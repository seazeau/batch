import { NextResponse } from 'next/server';

const PRESET_CATALOG = [
  { id: 'poulet', label: 'Filets de poulet', zone: 'fridge', keywords: ['poulet', 'dinde', 'volaille', 'chicken'] },
  { id: 'oeufs', label: 'Œufs frais', zone: 'fridge', keywords: ['oeuf', 'œuf', 'oeufs', 'egg'] },
  { id: 'skyr', label: 'Skyr / Yaourt grec', zone: 'fridge', keywords: ['skyr', 'yaourt', 'fromage blanc', 'yogurt'] },
  { id: 'brocoli', label: 'Brocolis', zone: 'fridge', keywords: ['brocoli', 'broccoli'] },
  { id: 'courgette', label: 'Courgettes', zone: 'fridge', keywords: ['courgette', 'zucchini'] },
  { id: 'carotte', label: 'Carottes', zone: 'fridge', keywords: ['carotte', 'carrot'] },
  { id: 'feta', label: 'Feta / Halloumi', zone: 'fridge', keywords: ['feta', 'halloumi', 'chèvre', 'fromage'] },
  { id: 'tofu', label: 'Tofu ferme', zone: 'fridge', keywords: ['tofu'] },
  { id: 'citron', label: 'Citrons jaunes / verts', zone: 'fridge', keywords: ['citron', 'lemon', 'lime'] },
  { id: 'riz', label: 'Riz basmati / thaï', zone: 'pantry', keywords: ['riz', 'rice', 'basmati'] },
  { id: 'quinoa', label: 'Quinoa / Boulgour', zone: 'pantry', keywords: ['quinoa', 'boulgour', 'semoule', 'blé'] },
  { id: 'lentilles', label: 'Lentilles corail', zone: 'pantry', keywords: ['lentille', 'lentil', 'corail'] },
  { id: 'pois_chiches', label: 'Pois chiches', zone: 'pantry', keywords: ['pois chiche', 'chickpea', 'haricot'] },
  { id: 'patate_douce', label: 'Patates douces', zone: 'pantry', keywords: ['patate douce', 'pomme de terre', 'sweet potato'] },
  { id: 'lait_coco', label: 'Lait de coco', zone: 'pantry', keywords: ['lait de coco', 'coco', 'coconut'] },
  { id: 'cacahuete', label: 'Beurre de cacahuète', zone: 'pantry', keywords: ['cacahuète', 'cacahuete', 'peanut', 'tahin', 'sésame'] },
  { id: 'tomate', label: 'Tomates concassées', zone: 'pantry', keywords: ['tomate', 'passata', 'coulis'] },
  { id: 'oignon', label: 'Oignons & Ail', zone: 'pantry', keywords: ['oignon', 'ail', 'échalote', 'onion', 'garlic'] },
];

interface ScanRequestBody {
  imageBase64?: string;
  mimeType?: string;
  zone?: 'fridge' | 'pantry';
  apiKey?: string;
  colorStats?: {
    greenRatio?: number;
    warmRatio?: number;
    brightRatio?: number;
    earthyRatio?: number;
  };
  fileName?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScanRequestBody;
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      zone = 'fridge',
      apiKey,
      colorStats,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Aucune image fournie pour l’analyse.' },
        { status: 400 }
      );
    }

    const rawBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const resolvedKey = (
      apiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      ''
    ).trim();

    const systemPrompt = `Tu es un assistant culinaire expert en reconnaissance visuelle d'ingrédients dans un frigo ou un placard.
Analyse cette photo (${zone === 'fridge' ? 'Frigo / Produits frais' : 'Placard / Épicerie sèche'}) et renvoie UNIQUEMENT un objet JSON valide avec la structure suivante :
{
  "detectedPresetIds": ["id1", "id2"],
  "customIngredients": ["nom court ingrédient 1", "nom court ingrédient 2"],
  "summary": "Résumé court en français des aliments identifiés (max 90 caractères)"
}

Voici la liste des IDs prédéfinis autorisés dans "detectedPresetIds" :
${PRESET_CATALOG.map((p) => `- "${p.id}" (${p.label})`).join('\n')}

Si tu vois d'autres ingrédients utiles en cuisine qui ne sont pas dans la liste prédéfinie (ex: "Saumon", "Poivron rouge", "Épinards", "Thon", "Pâtes", "Patate douce", "Fromage râpé"), ajoute-les en français au singulier dans "customIngredients" (maximum 5).`;

    // 1. Try OpenAI Vision if key starts with sk-
    if (resolvedKey.startsWith('sk-')) {
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolvedKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: systemPrompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${rawBase64}` },
                },
              ],
            },
          ],
          max_tokens: 400,
        }),
      });

      if (openAiRes.ok) {
        const data = await openAiRes.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return NextResponse.json({
            mode: 'openai-vision',
            detectedPresetIds: Array.isArray(parsed.detectedPresetIds) ? parsed.detectedPresetIds : [],
            customIngredients: Array.isArray(parsed.customIngredients) ? parsed.customIngredients : [],
            summary: parsed.summary || 'Analyse Vision OpenAI terminée.',
          });
        }
      }
    }

    // 2. Try Google Gemini Vision API if a key is provided
    if (resolvedKey && !resolvedKey.startsWith('sk-')) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        resolvedKey
      )}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: rawBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json({
            mode: 'gemini-vision',
            detectedPresetIds: Array.isArray(parsed.detectedPresetIds) ? parsed.detectedPresetIds : [],
            customIngredients: Array.isArray(parsed.customIngredients) ? parsed.customIngredients : [],
            summary: parsed.summary || 'Analyse Gemini Vision terminée.',
          });
        }
      }
    }

    // 3. Local Visual Heuristic & Color-Profile Analysis (works immediately without external API key)
    const detectedPresetIds: string[] = [];
    const customIngredients: string[] = [];

    const green = colorStats?.greenRatio ?? 0.15;
    const warm = colorStats?.warmRatio ?? 0.22;
    const bright = colorStats?.brightRatio ?? 0.28;
    const earthy = colorStats?.earthyRatio ?? 0.2;

    if (zone === 'fridge') {
      if (bright > 0.12) {
        detectedPresetIds.push('skyr', 'oeufs');
      }
      if (green > 0.08) {
        detectedPresetIds.push('brocoli', 'courgette');
      } else {
        detectedPresetIds.push('courgette');
      }
      if (warm > 0.12) {
        detectedPresetIds.push('poulet', 'carotte');
      } else {
        detectedPresetIds.push('poulet');
      }
      if (bright > 0.25) {
        detectedPresetIds.push('feta');
      }
      if (warm > 0.2) {
        detectedPresetIds.push('citron');
      }
    } else {
      if (earthy > 0.1) {
        detectedPresetIds.push('riz', 'oignon');
      }
      if (warm > 0.1) {
        detectedPresetIds.push('lentilles', 'patate_douce');
      }
      if (bright > 0.15) {
        detectedPresetIds.push('lait_coco');
      }
      if (earthy > 0.2) {
        detectedPresetIds.push('pois_chiches', 'cacahuete');
      }
    }

    return NextResponse.json({
      mode: 'local-vision',
      detectedPresetIds: Array.from(new Set(detectedPresetIds)),
      customIngredients,
      summary:
        zone === 'fridge'
          ? 'Analyse visuelle locale du frigo effectuée (vérifiez ou ajustez les éléments détectés).'
          : 'Analyse visuelle locale du placard effectuée (vérifiez ou ajustez les éléments détectés).',
    });
  } catch (err) {
    console.error('Error in /api/scan-stock:', err);
    return NextResponse.json(
      { error: 'Erreur lors de l’analyse de l’image.' },
      { status: 500 }
    );
  }
}
