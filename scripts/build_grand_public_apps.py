import os, base64, io, json
from PIL import Image

brain_dir = '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/6d0153e4-073f-44ef-baae-0b4264ac0fc3'

def b64_thumb(fname, max_w=420, quality=68):
    p = os.path.join(brain_dir, fname)
    if not os.path.exists(p): return ''
    try:
        im = Image.open(p)
        im.thumbnail((max_w, max_w), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format='JPEG', quality=quality, optimize=True)
        return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')
    except Exception as e:
        return ''

img_map = {
    'greek': b64_thumb('meal_greek_chicken_bowl_1794085317443.jpg'),
    'kefta': b64_thumb('meal_swap_kefta_skyr_1794085371246.jpg'),
    'halloumi': b64_thumb('meal_veggie_halloumi_bowl_1794213350865.jpg'),
    'dal': b64_thumb('meal_red_lentil_dal_1794085321442.jpg'),
    'satay': b64_thumb('meal_tofu_egg_satay_1794085320489.jpg'),
    'chimi': b64_thumb('meal_chicken_chimichurri_1794085322374.jpg'),
    'med': b64_thumb('meal_swap_med_tofu_bowl_1794085378029.jpg'),
    'tiger': b64_thumb('meal_tiger_bowl_satay_1794085321353.jpg'),
    'burger': b64_thumb('meal_pleasure_smash_burger_1794213351665.jpg'),
}

# Generate 8 step thumbnails
steps_dir = '/home/antigravity/public/steps'
step_thumbs = {}
for i in range(1, 9):
    p = os.path.join(steps_dir, f'step{i}_a.jpg')
    if os.path.exists(p):
        try:
            im = Image.open(p)
            im.thumbnail((360, 360), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, format='JPEG', quality=65, optimize=True)
            step_thumbs[f'step{i}'] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')
        except:
            step_thumbs[f'step{i}'] = ''
    else:
        step_thumbs[f'step{i}'] = ''

with open('/home/antigravity/scripts/recipes.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

def get_img_key(r):
    img = r.get('image', '')
    cat = r.get('category', '')
    if 'greek' in img: return 'greek'
    if 'kefta' in img: return 'kefta'
    if 'halloumi' in img: return 'halloumi'
    if 'dal' in img: return 'dal'
    if 'satay' in img: return 'satay'
    if 'chimi' in img: return 'chimi'
    if 'med' in img: return 'med'
    if 'tiger' in img: return 'tiger'
    if 'burger' in img: return 'burger'
    if cat == 'volaille': return 'greek'
    if cat == 'boeuf': return 'kefta'
    if cat == 'poisson': return 'med'
    if cat == 'vege_aop': return 'halloumi'
    if cat == 'vege_tofu': return 'satay'
    if cat == 'dal': return 'dal'
    if cat == 'plaisir': return 'burger'
    return 'greek'

for r in recipes:
    r['imgKey'] = get_img_key(r)

recipes_json_str = json.dumps(recipes, ensure_ascii=False)
img_map_json_str = json.dumps(img_map)
step_thumbs_json_str = json.dumps(step_thumbs)

batch_steps_data = [
  {
    "step": 1,
    "time": "T+00 min",
    "duration": 10,
    "title": "Préchauffage du four & Marinade express des protéines",
    "station": "Four & Plan de travail",
    "desc": "Allumez le four à 200°C chaleur tournante avec 2 grandes plaques à l'intérieur. Massez vos protéines (poulet, bœuf, tofu ou halloumi) avec jus de citron, ail, origan et huile d'olive.",
    "actions": [
      "Allumer le four à 200°C (chaleur tournante) avec 2 grandes plaques.",
      "Dans un saladier, masser les protéines avec le jus de citron, origan, ail pressé, huile d'olive, sel et poivre.",
      "Râper les concombres avec 1 c.à.c de sel dans une passoire pour les faire dégorger."
    ],
    "tip": "Enfourner sur des plaques déjà très chaudes garantit une saisie immédiate façon plancha sans perdre de jus."
  },
  {
    "step": 2,
    "time": "T+10 min",
    "duration": 12,
    "title": "Découpe des légumes racines & Enfournement Plaque 1 & 2",
    "station": "Four 200°C (2 niveaux)",
    "desc": "Taillez patates douces, carottes et oignons rouges en cubes réguliers de 2 cm. Enfournez simultanément sur 2 niveaux pour 15 min.",
    "actions": [
      "Couper patates douces et carottes en cubes de 2 cm, oignons en quartiers.",
      "Plaque #1 : Enrober d'huile d'olive, paprika fumé et sel. Plaque #2 : Disposer les protéines marinées.",
      "Enfourner les 2 plaques à 200°C pour une première phase de 15 minutes."
    ],
    "tip": "Gardez les brocolis hors du four pour l'instant : ils cuiront durant les 15 dernières minutes."
  },
  {
    "step": 3,
    "time": "T+22 min",
    "duration": 12,
    "title": "Lancement simultané du Féculent & du Mijoté/Dal",
    "station": "Plaques de cuisson (2 feux)",
    "desc": "Activez 2 feux sur la plaque de cuisson : les céréales (Riz/Quinoa) et le Dal corail mijotent en autonomie complète.",
    "actions": [
      "Faitout #1 : Rincer le riz basmati/quinoa, verser 1,6x le volume d'eau avec bouillon d'herbes, couvrir à feu doux 14 min.",
      "Sauteuse #2 : Revenir ail et curry 1 min, ajouter lentilles corail, protéines végétales, lait de coco, tomates et eau. Mijoter 18 min."
    ],
    "tip": "Ne soulevez jamais le couvercle des céréales : la vapeur emprisonnée assure des grains parfaitement détachés."
  },
  {
    "step": 4,
    "time": "T+34 min",
    "duration": 10,
    "title": "Ajout des Brocolis au four & Cuisson des Œufs Mollets 6'30",
    "station": "Four & Casserole",
    "desc": "Ajoutez les fleurons de brocolis sur la plaque de légumes et plongez les œufs délicatement pour 6 min 30 chrono.",
    "actions": [
      "Ouvrir le four, répartir les fleurons de brocolis sur la Plaque #1 et poursuivre la cuisson 15 min.",
      "Casserole #3 : Porter l'eau à ébullition, plonger les œufs 6 min 30 chrono.",
      "À la sonnerie, transférer immédiatement les œufs dans un saladier d'eau glacée pour stopper la cuisson."
    ],
    "tip": "6 min 30 donne un jaune coulant parfait qui reste crémeux même après réchauffage."
  },
  {
    "step": 5,
    "time": "T+44 min",
    "duration": 12,
    "title": "Sortie du four & Saisie des protéines poêlées",
    "station": "Plan de travail & Poêle",
    "desc": "Sortez les 2 plaques dorées du four, coupez le feu sous le riz et le dal, puis saisissez le tofu laqué soja/sésame ou les steaks.",
    "actions": [
      "Sortir les plaques de protéines et légumes rôtis du four. Égrener les féculents à la fourchette.",
      "Poêle feu vif : Dorer le tofu enrobé de fécule 6 min, déglacer à la sauce soja et graines de sésame.",
      "Laisser les préparations tiédir à l'air libre avant la mise en boîte."
    ],
    "tip": "Versez les sucs de cuisson de la plaque directement sur les protéines pour sceller le moelleux."
  },
  {
    "step": 6,
    "time": "T+56 min",
    "duration": 10,
    "title": "Assemblage à froid des 3 Sauces Maison",
    "station": "Plan de travail (Zéro cuisson)",
    "desc": "Toutes les cuissons sont finies : réalisez vos 3 sauces directement dans leurs bocaux étanches.",
    "actions": [
      "Bocal #1 (Tzatziki) : Concombre pressé dans un torchon + Skyr 0%, menthe ciselée, ail, zeste de citron.",
      "Bocal #2 (Satay) : Purée de cacahuète + sauce soja, citron vert, gingembre râpé et eau chaude.",
      "Bocal #3 (Chimichurri) : Persil plat + coriandre ciselés, huile d'olive, vinaigre de vin et origan."
    ],
    "tip": "Préparer les sauces directement dans leurs bocaux gradués évite de salir des bols supplémentaires."
  },
  {
    "step": 7,
    "time": "T+66 min",
    "duration": 8,
    "title": "Portionnage modulaire & Mise en boîtes hermétiques",
    "station": "Dressage & Contenants",
    "desc": "Répartissez vos 5 plats dans leurs boîtes en verre individuelles ou en bacs modulables pour la semaine.",
    "actions": [
      "Répartir féculents, légumes rôtis et protéines dans chaque boîte du Lundi au Vendredi.",
      "Conserver les sauces à froid séparément dans leurs petits pots étanches.",
      "Placer une feuille d'essuie-tout sous les légumes pour absorber l'humidité résiduelle."
    ],
    "tip": "Attendez que la vapeur soit totalement dissipée avant de fermer les couvercles pour éviter la buée."
  },
  {
    "step": 8,
    "time": "T+74 min",
    "duration": 6,
    "title": "Rangement réfrigérateur & Coup d'éponge final",
    "station": "Stockage Frigo",
    "desc": "Organisez votre frigo par ordre de consommation de la semaine. Vos 10 repas sont prêts en 1h20 !",
    "actions": [
      "Zone fraîche (0-3°C) : Plats du Lundi au Mercredi (volailles, poissons, œufs mollets).",
      "Zone intermédiaire : Plats du Jeudi au Vendredi (dals, tofu, halloumi ou plat plaisir).",
      "Lancer le lave-vaisselle : session pliée en 1h20 chrono !"
    ],
    "tip": "Chaque midi ou soir de semaine ne vous demandera plus que 2 minutes d'assemblage et réchauffage !"
  }
]
batch_steps_json_str = json.dumps(batch_steps_data, ensure_ascii=False)

html = f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>MacroBatch — Catalogue, Menu, Courses &amp; Préparation</title>
  <style>
    :root {{
      --bg-page: #F6F8FA;
      --bg-card: #FFFFFF;
      --ink-900: #0F172A;
      --ink-700: #334155;
      --ink-500: #64748B;
      --ink-400: #94A3B8;
      --coral: #FF5A36;
      --coral-light: #FFF0ED;
      --mint: #10B981;
      --mint-dark: #059669;
      --mint-light: #ECFDF5;
      --blue: #3B82F6;
      --amber: #F59E0B;
      --border: #E2E8F0;
      --radius-2xl: 24px;
      --radius-xl: 18px;
      --radius-lg: 12px;
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }}
    body {{
      background-color: var(--bg-page);
      color: var(--ink-900);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif;
      line-height: 1.45;
      padding: 12px 12px 140px 12px;
      -webkit-font-smoothing: antialiased;
      max-width: 640px;
      margin: 0 auto;
      overflow-x: hidden;
    }}
    .sr {{ position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }}

    /* ==============================================================
       MOTION DESIGN & KEYFRAMES SYSTEM
       ============================================================== */
    @keyframes viewFadeIn {{
      0% {{ opacity: 0; transform: translateY(14px); }}
      100% {{ opacity: 1; transform: translateY(0); }}
    }}

    @keyframes cardStaggerIn {{
      0% {{ opacity: 0; transform: translateY(18px) scale(0.97); }}
      100% {{ opacity: 1; transform: translateY(0) scale(1); }}
    }}

    @keyframes iconFloat {{
      0%, 100% {{ transform: translateY(0) rotate(0deg); }}
      50% {{ transform: translateY(-3px) rotate(3deg); }}
    }}

    @keyframes liveGlowPulse {{
      0% {{ box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }}
      70% {{ box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }}
      100% {{ box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }}
    }}

    @keyframes checkPopBounce {{
      0% {{ transform: scale(0.6); }}
      50% {{ transform: scale(1.3); }}
      100% {{ transform: scale(1); }}
    }}

    @keyframes toastSlideIn {{
      0% {{ opacity: 0; transform: translate(-50%, -24px) scale(0.9); }}
      18% {{ opacity: 1; transform: translate(-50%, 0) scale(1.04); }}
      28% {{ transform: translate(-50%, 0) scale(1); }}
      85% {{ opacity: 1; transform: translate(-50%, 0) scale(1); }}
      100% {{ opacity: 0; transform: translate(-50%, -15px) scale(0.96); }}
    }}

    @keyframes modalSheetIn {{
      from {{ transform: translateY(100%); opacity: 0.5; }}
      to {{ transform: translateY(0); opacity: 1; }}
    }}

    @keyframes backdropIn {{
      from {{ opacity: 0; }}
      to {{ opacity: 1; }}
    }}

    .view-panel {{
      animation: viewFadeIn 0.32s var(--ease-smooth) both;
    }}

    /* Global tactile feedback on clicks */
    button, .pill-btn, .cat-day-btn, .dock-btn, .p-btn, .chip, .prep-sub-btn, .step-done-btn, .profile-card-btn {{
      transition: transform 0.16s var(--ease-spring), background-color 0.2s, box-shadow 0.2s, border-color 0.2s, color 0.2s;
    }}
    button:active, .pill-btn:active, .cat-day-btn:active, .dock-btn:active, .p-btn:active, .chip:active, .prep-sub-btn:active, .step-done-btn:active, .profile-card-btn:active {{
      transform: scale(0.93) !important;
    }}

    /* Header */
    .top-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 4px 2px;
    }}
    .brand {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .brand-icon {{
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--coral), #E04826);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-size: 21px;
      box-shadow: 0 6px 18px rgba(255, 90, 54, 0.38);
      animation: iconFloat 4s ease-in-out infinite;
    }}
    .brand-name {{
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: var(--ink-900);
      line-height: 1.1;
    }}
    .brand-sub {{
      font-size: 11px;
      color: var(--ink-500);
      font-weight: 600;
    }}

    .people-picker {{
      display: flex;
      background: #E2E8F0;
      padding: 3px;
      border-radius: 99px;
      gap: 2px;
    }}
    .p-btn {{
      padding: 5px 9px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 800;
      border: none;
      background: transparent;
      color: var(--ink-500);
      cursor: pointer;
    }}
    .p-btn.active {{
      background: #FFFFFF;
      color: var(--ink-900);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }}

    /* Card */
    .card {{
      background: var(--bg-card);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border);
      padding: 15px;
      margin-bottom: 12px;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
      transition: box-shadow 0.25s ease, transform 0.2s ease;
    }}
    .section-title {{
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-500);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    /* ==============================================================
       GRAND PUBLIC PROFILES CARDS (ACTIF / SPORTIF / ATHLÈTE)
       ============================================================== */
    .profiles-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 6px;
      margin-bottom: 12px;
    }}
    .profile-card-btn {{
      background: #F8FAFC;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 10px 8px;
      text-align: left;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .profile-card-btn.active {{
      background: var(--ink-900);
      border-color: var(--ink-900);
      color: #FFF;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.2);
      transform: translateY(-2px);
    }}
    .profile-top-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }}
    .profile-icon {{ font-size: 22px; }}
    .profile-badge-prot {{
      font-size: 9.5px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 6px;
      background: #E2E8F0;
      color: var(--ink-700);
    }}
    .profile-card-btn.active .profile-badge-prot {{
      background: var(--coral);
      color: #FFF;
    }}
    .profile-name {{ font-size: 13px; font-weight: 900; line-height: 1.2; }}
    .profile-rhythm {{ font-size: 10px; font-weight: 800; color: var(--mint-dark); margin-top: 2px; }}
    .profile-card-btn.active .profile-rhythm {{ color: #34D399; }}
    .profile-desc {{ font-size: 9.5px; color: var(--ink-500); line-height: 1.35; margin-top: 4px; }}
    .profile-card-btn.active .profile-desc {{ color: #94A3B8; }}
    .profile-per-meal {{ font-size: 9.5px; font-weight: 800; color: var(--coral); margin-top: 4px; }}
    .profile-card-btn.active .profile-per-meal {{ color: #FF8038; }}

    /* Weight Selector */
    .weight-box {{
      background: #F8FAFC;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }}
    .weight-stepper-btn {{
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: #FFF;
      color: var(--ink-900);
      font-size: 20px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }}
    .weight-stepper-btn:hover {{
      transform: scale(1.08);
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
    }}
    .weight-stepper-btn:active {{
      transform: scale(0.88);
      background: #E2E8F0 !important;
    }}
    .w-chip {{
      padding: 5px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      background: #FFF;
      color: var(--ink-700);
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }}
    .w-chip:hover {{
      transform: translateY(-1.5px);
    }}
    .w-chip:active {{
      transform: scale(0.93);
    }}
    .w-chip.active {{
      background: var(--ink-900);
      color: #FFF;
      border-color: var(--ink-900);
      box-shadow: 0 2px 8px rgba(15,23,42,0.18);
      transform: scale(1.05);
    }}

    /* Onboarding Natural Flow */
    .onboarding-stories-bar {{
      display: flex;
      gap: 6px;
      margin-bottom: 14px;
    }}
    .onboarding-story-segment {{
      flex: 1;
      height: 5px;
      background: #E2E8F0;
      border-radius: 99px;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0.4;
    }}
    .onboarding-story-segment.active {{
      background: var(--coral);
      opacity: 1;
      
      
    }}
    .onboarding-story-segment.done {{
      background: var(--coral);
      opacity: 0.7;
    }}
    .profile-configured-bar {{
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 12px 16px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.03);
      transition: all 0.2s ease;
    }}
    .profile-configured-bar:hover {{
      border-color: var(--coral);
      transform: translateY(-1px);
    }}

    /* Levers */
    .lever-row {{
      margin-bottom: 10px;
    }}
    .lever-lbl {{
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--ink-700);
      margin-bottom: 4px;
    }}
    .pill-group {{
      display: flex;
      gap: 5px;
    }}
    .pill-btn {{
      flex: 1;
      padding: 8px 10px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: #FAFAFA;
      color: var(--ink-700);
      cursor: pointer;
      text-align: center;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    }}
    .pill-btn:hover {{
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }}
    .pill-btn:active {{
      transform: scale(0.93);
    }}
    .pill-btn.active {{
      background: var(--ink-900);
      color: #FFF;
      border-color: var(--ink-900);
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
      animation: springSelect 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }}
    .pill-btn.active-coral {{
      background: var(--coral);
      color: #FFF;
      border-color: var(--coral);
      box-shadow: 0 6px 16px rgba(255, 90, 54, 0.4);
      animation: springSelect 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }}
    .pill-btn.active-mint {{
      background: var(--mint-dark);
      color: #FFF;
      border-color: var(--mint-dark);
      box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
      animation: springSelect 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }}

    /* Persistent Week Menu Bar */
    .menu-summary-bar {{
      background: #FFF;
      border-radius: var(--radius-2xl);
      padding: 12px 14px;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      cursor: pointer;
      transition: all 0.22s var(--ease-spring);
    }}
    .menu-summary-bar:hover {{
      border-color: var(--coral);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 90, 54, 0.12);
    }}

    /* Nutrition Banner with Animated Gauges */
    .whoop-banner {{
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #FFF;
      border-radius: var(--radius-2xl);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.28);
      position: relative;
      overflow: hidden;
    }}
    .whoop-banner::before {{
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 220px;
      height: 220px;
      border-radius: 999px;
      background: radial-gradient(circle, rgba(255, 90, 54, 0.15) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%);
      pointer-events: none;
    }}
    .whoop-top {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }}
    .whoop-title {{ font-size: 11px; font-weight: 800; text-transform: uppercase; color: #FF5A36; letter-spacing: 0.05em; }}
    .whoop-prot {{ font-size: 22px; font-weight: 900; color: #FFF; letter-spacing: -0.02em; }}
    .whoop-plate-cost {{
      font-size: 13px;
      font-weight: 800;
      color: #34D399;
      background: rgba(16, 185, 129, 0.18);
      padding: 4px 11px;
      border-radius: 99px;
      border: 1px solid rgba(16, 185, 129, 0.35);
      backdrop-filter: blur(4px);
    }}

    .rings-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }}
    .ring-box {{
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: var(--radius-lg);
      padding: 9px 10px;
      text-align: center;
      transition: transform 0.2s ease;
    }}
    .ring-box:hover {{
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.1);
    }}
    .ring-val {{ font-size: 15px; font-weight: 900; }}
    .ring-lbl {{ font-size: 10px; color: #94A3B8; font-weight: 700; text-transform: uppercase; }}

    .macro-gauge-track {{
      height: 4px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 99px;
      overflow: hidden;
      margin-top: 6px;
    }}
    .macro-gauge-bar {{
      height: 100%;
      border-radius: 99px;
      transition: width 0.7s var(--ease-spring);
    }}

    /* Catalog Cards with Staggered Entrance & Hover Motion */
    .cat-card {{
      background: #FFF;
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 12px;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.06);
      transition: transform 0.22s var(--ease-spring), box-shadow 0.22s var(--ease-spring);
      animation: cardStaggerIn 0.35s var(--ease-smooth) both;
    }}
    .cat-card:hover {{
      transform: translateY(-3px);
      box-shadow: 0 10px 26px -4px rgba(15, 23, 42, 0.1);
    }}
    .cat-photo-wrap {{
      position: relative;
      aspect-ratio: 16 / 9;
      background: #0F172A;
      overflow: hidden;
    }}
    .cat-photo-wrap img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s var(--ease-smooth);
    }}
    .cat-card:hover .cat-photo-wrap img {{
      transform: scale(1.03);
    }}
    .cat-top-badges {{
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      gap: 4px;
    }}
    .cat-badge {{
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #FFF;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 99px;
      letter-spacing: 0.02em;
    }}
    .cat-badge-green {{
      background: var(--mint-dark);
      color: #FFF;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 99px;
      box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
    }}
    .cat-badge-price {{
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #34D399;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 99px;
    }}
    .cat-body {{
      padding: 12px 14px;
    }}
    .cat-category {{ font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--coral); margin-bottom: 2px; }}
    .cat-name {{ font-size: 15px; font-weight: 800; color: var(--ink-900); margin-bottom: 4px; line-height: 1.25; }}
    .cat-desc {{ font-size: 11px; color: var(--ink-500); line-height: 1.4; margin-bottom: 10px; }}

    .cat-actions {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #F1F5F9;
      padding-top: 8px;
      flex-wrap: wrap;
      gap: 6px;
    }}
    .cat-actions-label {{ font-size: 11px; font-weight: 800; color: var(--ink-500); }}
    .cat-day-btn {{
      padding: 4px 9px;
      border-radius: 99px;
      font-size: 10.5px;
      font-weight: 800;
      background: #F1F5F9;
      color: var(--ink-900);
      border: 1px solid var(--border);
      cursor: pointer;
    }}
    .cat-day-btn:hover {{
      background: var(--coral);
      color: #FFF;
      border-color: var(--coral);
      box-shadow: 0 2px 8px rgba(255, 90, 54, 0.3);
    }}
    .cat-day-btn.selected {{
      background: var(--mint-dark);
      color: #FFF;
      border-color: var(--mint-dark);
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
    }}

    /* Search & Filter pills in catalog */
    .search-input {{
      width: 100%;
      padding: 9px 12px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: #FFF;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 8px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }}
    .search-input:focus {{
      border-color: var(--coral);
      box-shadow: 0 0 0 3px rgba(255, 90, 54, 0.15);
    }}
    .chips-scroll {{
      display: flex;
      gap: 5px;
      overflow-x: auto;
      padding-bottom: 6px;
      margin-bottom: 10px;
      scrollbar-width: none;
    }}
    .chip {{
      font-size: 11px;
      font-weight: 700;
      padding: 5px 11px;
      border-radius: 99px;
      background: #FFF;
      border: 1px solid var(--border);
      color: var(--ink-500);
      white-space: nowrap;
      cursor: pointer;
    }}
    .chip.active {{
      background: var(--ink-900);
      color: #FFF;
      border-color: var(--ink-900);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
    }}

    /* Grocery Aisle with micro-animations */
    .aisle-group {{
      background: #FFF;
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border);
      padding: 14px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px -4px rgba(15,23,42,0.05);
      animation: cardStaggerIn 0.35s var(--ease-smooth) both;
    }}
    .aisle-title {{
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--coral);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }}
    .grocery-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 4px;
      border-bottom: 1px solid #F1F5F9;
      cursor: pointer;
      border-radius: 8px;
      transition: opacity 0.25s ease, transform 0.18s var(--ease-spring), background-color 0.15s;
    }}
    .grocery-row:hover {{
      background-color: #F8FAFC;
    }}
    .grocery-row:last-child {{ border-bottom: none; }}
    .grocery-row.checked {{ opacity: 0.38; text-decoration: line-through; }}
    .g-left {{ display: flex; align-items: center; gap: 9px; }}
    .g-chk {{
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
      transition: all 0.2s var(--ease-spring);
    }}
    .grocery-row.checked .g-chk {{
      background: var(--mint);
      border-color: var(--mint);
      color: #FFF;
      animation: checkPopBounce 0.28s var(--ease-spring);
    }}
    .g-name {{ font-size: 12px; font-weight: 700; color: var(--ink-900); }}
    .g-sub {{ font-size: 10.5px; color: var(--ink-500); }}
    .g-price {{ font-size: 12px; font-weight: 900; color: var(--ink-900); }}

    /* Slots Card (Menu View) */
    .slot-card {{
      background: #FFF;
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.05);
      animation: cardStaggerIn 0.35s var(--ease-smooth) both;
      transition: transform 0.22s var(--ease-spring), box-shadow 0.22s var(--ease-spring);
    }}
    .slot-card:hover {{
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.09);
    }}
    .slot-photo-wrap {{
      width: 105px;
      height: 92px;
      position: relative;
      shrink-0;
      background: #0F172A;
      overflow: hidden;
    }}
    .slot-photo-wrap img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s var(--ease-smooth);
    }}
    .slot-card:hover .slot-photo-wrap img {{
      transform: scale(1.05);
    }}
    .slot-day-badge {{
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(4px);
      color: #FFF;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
    }}
    .slot-swap-btn {{
      position: absolute;
      bottom: 6px;
      left: 6px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      color: var(--ink-900);
      font-size: 9px;
      font-weight: 800;
      padding: 3px 7px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    }}
    .slot-info {{
      padding: 10px 12px;
      flex: 1;
    }}
    .slot-title {{ font-size: 13.5px; font-weight: 800; color: var(--ink-900); margin-bottom: 2px; line-height: 1.25; }}
    .slot-meta {{ font-size: 10.5px; color: var(--ink-500); display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }}

    /* Préparation / Batch view styling with Timer motion */
    .prep-subnav {{
      display: flex;
      background: #E2E8F0;
      padding: 3px;
      border-radius: 99px;
      margin-bottom: 12px;
      gap: 3px;
    }}
    .prep-sub-btn {{
      flex: 1;
      padding: 8px 12px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 800;
      border: none;
      background: transparent;
      color: var(--ink-500);
      cursor: pointer;
      text-align: center;
    }}
    .prep-sub-btn.active {{
      background: #FFFFFF;
      color: var(--ink-900);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }}

    .timer-hero {{
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #FFF;
      border-radius: var(--radius-2xl);
      padding: 16px 18px;
      margin-bottom: 12px;
      box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.28);
      position: relative;
      overflow: hidden;
    }}
    .timer-val {{
      font-size: 34px;
      font-weight: 900;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      display: flex;
      align-items: center;
    }}
    .timer-pulse-dot {{
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #10B981;
      display: inline-block;
      margin-right: 8px;
      opacity: 0.6;
      transition: all 0.3s ease;
    }}
    .timer-pulse-dot.running {{
      opacity: 1;
      animation: liveGlowPulse 1.6s infinite;
    }}
    .timer-btn {{
      padding: 8px 16px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      background: var(--coral);
      color: #FFF;
      box-shadow: 0 4px 14px rgba(255, 90, 54, 0.4);
    }}
    .timer-progress-track {{
      height: 4px;
      background: rgba(255, 255, 255, 0.14);
      border-radius: 99px;
      overflow: hidden;
      margin-top: 10px;
    }}
    .timer-progress-bar {{
      height: 100%;
      background: linear-gradient(90deg, #10B981, #34D399);
      border-radius: 99px;
      transition: width 0.4s var(--ease-spring);
    }}

    .step-card {{
      background: #FFF;
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 12px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
      animation: cardStaggerIn 0.35s var(--ease-smooth) both;
      transition: opacity 0.3s ease, transform 0.25s var(--ease-spring);
    }}
    .step-card.done {{
      opacity: 0.55;
      filter: grayscale(0.2);
    }}
    .step-photo-wrap {{
      position: relative;
      aspect-ratio: 16 / 9;
      background: #0F172A;
      overflow: hidden;
    }}
    .step-photo-wrap img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s var(--ease-smooth);
    }}
    .step-card:hover .step-photo-wrap img {{
      transform: scale(1.03);
    }}
    .step-badge {{
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(6px);
      color: #FFF;
      font-size: 10.5px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 99px;
    }}
    .step-body {{
      padding: 14px;
    }}
    .step-title {{
      font-size: 15px;
      font-weight: 900;
      color: var(--ink-900);
      margin-bottom: 6px;
      line-height: 1.3;
    }}
    .step-desc {{
      font-size: 12px;
      color: var(--ink-700);
      margin-bottom: 8px;
      line-height: 1.45;
    }}
    .step-action-item {{
      font-size: 11.5px;
      color: var(--ink-900);
      background: #F8FAFC;
      padding: 6px 10px;
      border-radius: 8px;
      margin-bottom: 4px;
      line-height: 1.4;
      border: 1px solid #F1F5F9;
    }}
    .step-tip {{
      background: var(--mint-light);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: var(--mint-dark);
      font-size: 11px;
      padding: 7px 10px;
      border-radius: 10px;
      margin: 8px 0;
      line-height: 1.4;
    }}
    .step-done-btn {{
      width: 100%;
      padding: 9px;
      border-radius: var(--radius-lg);
      font-size: 12px;
      font-weight: 800;
      border: 1px solid var(--border);
      background: #F1F5F9;
      color: var(--ink-900);
      cursor: pointer;
    }}
    .step-done-btn.active {{
      background: var(--mint);
      color: #FFF;
      border-color: var(--mint);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    }}

    /* Toast with Spring Bounce */
    .toast {{
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: #0F172A;
      color: #FFF;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 99px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      z-index: 100;
      display: none;
      pointer-events: none;
    }}

    /* Bottom Glass Dock (4 TABS WITH ELASTIC MOTION) */
    .bottom-dock {{
      position: fixed;
      bottom: 12px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      z-index: 50;
      pointer-events: none;
    }}
    .dock-pill {{
      pointer-events: auto;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      padding: 5px;
      border-radius: 99px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.85);
      display: flex;
      gap: 3px;
    }}
    .dock-btn {{
      padding: 8px 14px;
      border-radius: 99px;
      font-size: 11.5px;
      font-weight: 800;
      color: var(--ink-500);
      background: transparent;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }}
    .dock-btn.active {{
      background: var(--ink-900);
      color: #FFF;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
      transform: translateY(-1px);
    }}

    /* Modal Sheet with Smooth Spring Up */
    .modal-overlay {{
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 90;
      display: none;
      align-items: flex-end;
      justify-content: center;
      animation: backdropIn 0.25s ease-out;
    }}
    .modal-sheet {{
      background: #FFF;
      width: 100%;
      max-width: 580px;
      max-height: 85vh;
      overflow-y: auto;
      border-radius: 28px 28px 0 0;
      padding: 18px;
      box-shadow: 0 -12px 48px rgba(0,0,0,0.28);
      animation: modalSheetIn 0.32s var(--ease-smooth);
    }}
    .modal-handle {{
      width: 40px;
      height: 4px;
      background: #CBD5E1;
      border-radius: 99px;
      margin: 0 auto 12px auto;
    }}

    /* ==============================================================
       MOBILE DEVICE SIMULATOR & HARDWARE FRAME STYLES
       ============================================================== */
    .sim-bar {{
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      margin: 0 auto 16px auto;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 99px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      width: fit-content;
      user-select: none;
    }}
    .sim-btn {{
      padding: 6px 13px;
      border-radius: 99px;
      font-size: 11.5px;
      font-weight: 800;
      background: transparent;
      border: 1px solid transparent;
      color: var(--ink-500);
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }}
    .sim-btn:hover {{
      color: var(--ink-900);
    }}
    .sim-btn.active {{
      background: var(--ink-900);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(15,23,42,0.18);
    }}
    .device-stage {{
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 0 0 30px 0;
      width: 100%;
    }}
    .device-chassis {{
      width: 393px;
      height: 852px;
      background: #0B0F17;
      border-radius: 54px;
      padding: 11px;
      box-shadow: 0 30px 80px -15px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 0 0 2px #1E293B;
      position: relative;
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease, height 0.25s ease, border-radius 0.25s ease;
      user-select: text;
    }}
    .device-chassis.device-compact {{
      width: 375px;
      height: 760px;
      border-radius: 46px;
    }}
    .device-chassis.device-pixel {{
      width: 412px;
      height: 880px;
      border-radius: 44px;
    }}
    .device-chassis.device-fluid {{
      width: 100%;
      max-width: 640px;
      height: auto;
      background: transparent;
      border-radius: 0;
      padding: 0;
      box-shadow: none;
      border: none;
    }}
    .device-screen {{
      flex: 1;
      background: var(--bg-page);
      border-radius: 44px;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 12px 14px 120px 14px;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }}
    .device-chassis.device-fluid .device-screen {{
      border-radius: 0;
      background: transparent;
      overflow: visible;
      padding: 12px 0 120px 0;
    }}
    .device-status-bar {{
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      background: rgba(246, 248, 250, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      z-index: 60;
      user-select: none;
      border-top-left-radius: 44px;
      border-top-right-radius: 44px;
    }}
    .device-island {{
      position: absolute;
      top: 9px;
      left: 50%;
      transform: translateX(-50%);
      width: 114px;
      height: 28px;
      background: #000000;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      z-index: 70;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: none;
    }}
    .device-island-lens {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #111827;
      border: 1px solid #1F2937;
    }}
    .device-home-bar {{
      position: sticky;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 135px;
      height: 4.5px;
      background: #0F172A;
      border-radius: 99px;
      opacity: 0.35;
      z-index: 60;
      pointer-events: none;
      margin-top: 10px;
    }}
    .device-chassis.device-fluid .device-status-bar,
    .device-chassis.device-fluid .device-island,
    .device-chassis.device-fluid .device-home-bar {{
      display: none !important;
    }}
    .device-chassis:not(.device-fluid) .bottom-dock {{
      position: sticky;
      bottom: 16px;
      margin-top: auto;
      z-index: 55;
    }}
    @media (max-width: 480px) {{
      .sim-bar {{
        display: none !important;
      }}
      .device-stage {{
        padding: 0 !important;
      }}
      .device-chassis {{
        width: 100% !important;
        height: auto !important;
        background: transparent !important;
        border-radius: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }}
      .device-screen {{
        border-radius: 0 !important;
        overflow: visible !important;
        padding: 8px 8px 120px 8px !important;
      }}
      .device-status-bar, .device-island, .device-home-bar {{
        display: none !important;
      }}
    }}
  </style>
</head>
<body>

  <!-- MOBILE DEVICE SIMULATOR CONTROLS -->
  <div class="sim-bar">
    <span style="font-size:11px; font-weight:800; color:var(--ink-400); text-transform:uppercase; letter-spacing:0.5px; margin-right:4px;">Aperçu :</span>
    <button class="sim-btn active" id="sim-btn-iphone" onclick="setDeviceMode('iphone')">iPhone 16 Pro (393px)</button>
    <button class="sim-btn" id="sim-btn-compact" onclick="setDeviceMode('compact')">iPhone SE (375px)</button>
    <button class="sim-btn" id="sim-btn-pixel" onclick="setDeviceMode('pixel')">Pixel 8 (412px)</button>
    <button class="sim-btn" id="sim-btn-fluid" onclick="setDeviceMode('fluid')">Plein Écran</button>
  </div>

  <div class="device-stage">
    <div id="device-chassis" class="device-chassis">
      <!-- Hardware elements -->
      <div class="device-island">
        <div class="device-island-lens"></div>
      </div>
      <div class="device-status-bar">
        <span id="device-time">9:41</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <!-- Cellular 4 bars SVG -->
          <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor"><rect x="0" y="8" width="2.5" height="3" rx="0.5"/><rect x="3.5" y="5.5" width="2.5" height="5.5" rx="0.5"/><rect x="7" y="3" width="2.5" height="8" rx="0.5"/><rect x="10.5" y="0" width="2.5" height="11" rx="0.5"/></svg>
          <!-- Wifi SVG -->
          <svg width="13" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
          <!-- Battery 100% SVG -->
          <svg width="22" height="11" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="1" width="19" height="10" rx="3"/><rect x="3" y="3" width="14" height="6" rx="1.5" fill="#10B981" stroke="none"/><path d="M22 4.5v3" stroke-linecap="round"/></svg>
        </div>
      </div>

      <div id="device-screen" class="device-screen">
        <!-- Toast -->
        <div id="app-toast" class="toast">Action effectuée</div>

  <!-- Header -->
  <header class="top-header">
    <div class="brand">
      <div class="brand-icon" style="display:flex; align-items:center; justify-content:center; color:#FFF;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>
      <div>
        <div class="brand-name">MacroBatch</div>
        <div class="brand-sub">Base 30 Recettes • Courses &amp; Préparation</div>
      </div>
    </div>

    <!-- People picker -->
    <div class="people-picker">
      <button class="p-btn" onclick="setPeople(1)">1P</button>
      <button class="p-btn active" onclick="setPeople(2)">2P</button>
      <button class="p-btn" onclick="setPeople(3)">3P</button>
      <button class="p-btn" onclick="setPeople(4)">4P</button>
      <button class="p-btn" onclick="setPeople(6)">6P</button>
    </div>
  </header>

  <!-- ================================================================
       CONFIGURATEUR INITIAL DE CRITÈRES (NON-BLOQUANT & ÉPURÉ)
       ================================================================ -->
  <div id="config-card" class="card view-enter" style="border-radius:24px; padding:20px; box-shadow:0 8px 24px -4px rgba(0,0,0,0.05); border:1px solid #F1F5F9; margin-bottom:14px;">
    <!-- En-tête avec repliage discret -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid #F1F5F9; margin-bottom:14px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:34px; height:34px; border-radius:12px; background:var(--ink-900); color:var(--coral); display:flex; align-items:center; justify-content:center;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/><line x1="14" x2="14" y1="11" y2="17"/><line x1="8" x2="8" y1="4" y2="10"/><line x1="16" x2="16" y1="18" y2="24"/></svg>
        </div>
        <div>
          <h2 style="font-size:14px; font-weight:900; color:var(--ink-900); margin:0; line-height:1.2;">
            Personnaliser mes critères
          </h2>
          <div style="font-size:11px; color:var(--ink-500); font-weight:600; margin-top:2px;">
            Ajuste tes paramètres pour calibrer les recettes et le panier de courses.
          </div>
        </div>
      </div>
      <button type="button" onclick="toggleConfigCard(false)" class="pill-btn" style="padding:6px 14px; border-radius:99px; font-size:11.5px; font-weight:700; background:#F8FAFC; border:1px solid var(--border); color:var(--ink-500); cursor:pointer;">
        Replier
      </button>
    </div>

    <!-- 1. Profil Rythme & Activité -->
    <div style="margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:800; color:var(--ink-700); margin-bottom:6px;">
        <span>Profil d'activité</span>
        <span id="lbl-profile-summary" style="color:var(--coral); font-weight:900;">Sportif (1.8g/kg)</span>
      </div>
      <div class="profiles-grid" style="margin-top:0; margin-bottom:0;">
        <!-- Actif -->
        <button type="button" class="profile-card-btn" id="btn-prof-110" onclick="setProt(110)" style="border-radius:16px; padding:10px;">
          <div>
            <div class="profile-top-row">
              <span class="profile-icon" style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(255,90,54,0.1); color:var(--coral);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
              <span class="profile-badge-prot" id="badge-prof-110" style="border-radius:6px;">1.5g/kg</span>
            </div>
            <div class="profile-name">Actif</div>
            <div class="profile-rhythm" style="font-size:9.5px;">Vie active, marche</div>
          </div>
          <div class="profile-per-meal" id="meal-prof-110">~54g / repas</div>
        </button>

        <!-- Sportif -->
        <button type="button" class="profile-card-btn active" id="btn-prof-130" onclick="setProt(130)" style="border-radius:16px; padding:10px;">
          <div>
            <div class="profile-top-row">
              <span class="profile-icon" style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(255,90,54,0.1); color:var(--coral);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
              <span class="profile-badge-prot" id="badge-prof-130" style="border-radius:6px;">1.8g/kg</span>
            </div>
            <div class="profile-name">Sportif</div>
            <div class="profile-rhythm" style="font-size:9.5px;">Fitness, muscu (2-4x)</div>
          </div>
          <div class="profile-per-meal" id="meal-prof-130">~65g / repas</div>
        </button>

        <!-- Athlète -->
        <button type="button" class="profile-card-btn" id="btn-prof-160" onclick="setProt(160)" style="border-radius:16px; padding:10px;">
          <div>
            <div class="profile-top-row">
              <span class="profile-icon" style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(255,90,54,0.1); color:var(--coral);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg></span>
              <span class="profile-badge-prot" id="badge-prof-160" style="border-radius:6px;">2.2g/kg</span>
            </div>
            <div class="profile-name">Athlète</div>
            <div class="profile-rhythm" style="font-size:9.5px;">Prépa &amp; intensif</div>
          </div>
          <div class="profile-per-meal" id="meal-prof-160">~79g / repas</div>
        </button>
      </div>
    </div>

    <!-- 2. Poids de corps -->
    <div class="weight-box" style="border-radius:18px; background:#FAFAFA; border:1px solid #E2E8F0; padding:14px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div>
          <div style="font-size:11px; color:var(--ink-500); font-weight:700;">Poids de corps</div>
          <div id="lbl-weight-val" style="font-size:26px; font-weight:900; color:var(--coral); line-height:1; margin-top:2px;">
            72 <span style="font-size:14px; color:var(--ink-400); font-weight:700;">kg</span>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px; font-weight:800; color:var(--ink-400); text-transform:uppercase;">Cible protéines</div>
          <div id="lbl-weight-target-meal" style="font-size:13.5px; font-weight:900; color:var(--mint-dark); margin-top:1px;">~65g / repas</div>
          <div id="lbl-weight-target-daily" style="font-size:10px; color:var(--ink-400); font-weight:600;">(130g / jour)</div>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:10px;">
        <button type="button" class="weight-stepper-btn" onclick="adjustWeight(-1)" style="width:38px; height:38px; border-radius:12px; font-size:18px;">−</button>
        <input type="range" id="weight-range-slider" min="45" max="120" step="1" value="72" oninput="setWeight(this.value)" style="flex:1; accent-color:var(--coral); cursor:pointer;" />
        <button type="button" class="weight-stepper-btn" onclick="adjustWeight(1)" style="width:38px; height:38px; border-radius:12px; font-size:18px;">+</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid #E2E8F0; font-size:11px;">
        <span style="color:var(--ink-400); font-weight:600;">Repères rapides :</span>
        <div style="display:flex; gap:4px;">
          <button type="button" id="chip-w-55" class="w-chip" onclick="setWeight(55)">55 kg</button>
          <button type="button" id="chip-w-65" class="w-chip" onclick="setWeight(65)">65 kg</button>
          <button type="button" id="chip-w-72" class="w-chip active" onclick="setWeight(72)">72 kg</button>
          <button type="button" id="chip-w-80" class="w-chip" onclick="setWeight(80)">80 kg</button>
          <button type="button" id="chip-w-90" class="w-chip" onclick="setWeight(90)">90 kg</button>
          <button type="button" id="chip-w-100" class="w-chip" onclick="setWeight(100)">100 kg</button>
        </div>
      </div>
    </div>

    <!-- 3. Régime & Budget (2 colonnes) -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
      <div>
        <div style="font-size:11.5px; font-weight:800; color:var(--ink-700); margin-bottom:6px;">Régime alimentaire</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;">
          <button type="button" class="pill-btn active" id="btn-diet-omni" onclick="setDiet('omni')" style="padding:8px 4px; border-radius:10px; font-weight:800; font-size:11px; text-align:center;">Omnivore</button>
          <button type="button" class="pill-btn" id="btn-diet-vege" onclick="setDiet('vege')" style="padding:8px 4px; border-radius:10px; font-weight:800; font-size:11px; text-align:center;">Végétarien</button>
          <button type="button" class="pill-btn" id="btn-diet-pesco" onclick="setDiet('pesco')" style="padding:8px 4px; border-radius:10px; font-weight:800; font-size:11px; text-align:center;">Pescatarien</button>
        </div>
      </div>

      <div>
        <div style="font-size:11.5px; font-weight:800; color:var(--ink-700); margin-bottom:6px;">Budget par repas</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;">
          <button type="button" class="pill-btn" id="btn-bud-eco" onclick="setBudget('eco')" style="padding:6px 2px; border-radius:10px; font-size:10.5px; text-align:center;">
            <div style="font-weight:900;">Malin</div>
            <div style="font-size:9px; opacity:0.8;">&lt;2,50€</div>
          </button>
          <button type="button" class="pill-btn active-mint" id="btn-bud-std" onclick="setBudget('std')" style="padding:6px 2px; border-radius:10px; font-size:10.5px; text-align:center;">
            <div style="font-weight:900;">Équilibré</div>
            <div style="font-size:9px; opacity:0.8;">~2,85€</div>
          </button>
          <button type="button" class="pill-btn" id="btn-bud-gourmet" onclick="setBudget('gourmet')" style="padding:6px 2px; border-radius:10px; font-size:10.5px; text-align:center;">
            <div style="font-weight:900;">Gourmet</div>
            <div style="font-size:9px; opacity:0.8;">~3,40€</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Vendredi Smash burger & Bouton Voir mes plats -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #F1F5F9; gap:8px;">
      <button type="button" id="btn-pleasure" onclick="togglePleasure()" class="pill-btn" style="padding:8px 12px; border-radius:12px; font-size:11.5px; font-weight:800; display:flex; align-items:center; gap:6px;">
        <span style="display:inline-flex; align-items:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M5 2c0 4 2 6 4 7v13"/></svg> <span>Option plaisir du vendredi</span></span>
        <span id="lbl-pleasure-badge" style="font-size:10.5px; font-weight:900; color:var(--coral);">+ Activer</span>
      </button>

      <button type="button" onclick="toggleConfigCard(false); triggerToast('Critères appliqués à votre semaine !');" class="pill-btn active" style="padding:9px 18px; border-radius:12px; font-size:12px; font-weight:900; background:var(--ink-900); color:#FFF; border:none; cursor:pointer;">
        Voir mes plats ↓
      </button>
    </div>
  </div>

  <!-- BANDEAU COMPACT QUAND REPLIÉ -->
  <div id="config-collapsed-bar" class="profile-configured-bar" style="display:none;" onclick="toggleConfigCard(true)">
    <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--ink-700); font-weight:700; overflow:hidden;">
      <span style="display:inline-flex; align-items:center; color:var(--coral);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/><line x1="14" x2="14" y1="11" y2="17"/><line x1="8" x2="8" y1="4" y2="10"/><line x1="16" x2="16" y1="18" y2="24"/></svg></span>
      <span id="config-summary-pill" style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">
        72 kg • Sportif • ~65g prot/repas • Omnivore • 2 pers
      </span>
    </div>
    <button type="button" class="pill-btn" onclick="event.stopPropagation(); toggleConfigCard(true);" style="padding:5px 12px; border-radius:99px; font-size:11px; font-weight:800; background:#F1F5F9; border:1px solid var(--border); shrink:0; cursor:pointer;">
      Modifier
    </button>
  </div>

  <!-- CONTENU PRINCIPAL DE L'APPLICATION (CATALOGUE, MENU, COURSES, PREP) -->
  <div id="app-main-content" style="display:block;">

  <!-- Persistent Week Menu Bar (Click jumps to Mon Menu) -->
  <div class="menu-summary-bar" onclick="switchView('menu')">
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="display:inline-flex; align-items:center; color:var(--coral);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg></span>
      <div>
        <div style="font-size:12px; font-weight:900; color:var(--ink-900);">Mon Menu Semaine : 5/5 plats choisis</div>
        <div style="font-size:11px; font-weight:700; color:var(--ink-500); display:flex; align-items:center; gap:6px;">
          <span id="summary-profile-tag" style="color:var(--coral); font-weight:900;">Profil Sportif</span>
          <span>•</span>
          <span id="summary-prot">132g</span> prot/j
          <span>•</span>
          <span id="summary-cost">2,85 €</span> / assiette
        </div>
      </div>
    </div>
    <div style="font-size:11.5px; font-weight:800; color:var(--coral); display:flex; align-items:center; gap:3px;">
      <span>Voir mon menu</span> →
    </div>
  </div>

  <!-- ================================================================
       VUE 1 (PAR DÉFAUT) : CATALOGUE DE 30 RECETTES
       ================================================================ -->
  <div id="view-catalog" class="view-panel" style="display:block;">
    <div style="margin-bottom:8px;">
      <input type="text" id="cat-search" class="search-input" placeholder="Rechercher (ex: poulet, skyr, burger, dal, saumon)..." oninput="onSearch(this.value)" />

      <div class="chips-scroll" id="cat-filter-chips">
        <button class="chip active" onclick="filterCategory('all', this)">Tous</button>
        <button class="chip" onclick="filterCategory('volaille', this)">Volailles</button>
        <button class="chip" onclick="filterCategory('boeuf', this)">Bœuf 5%</button>
        <button class="chip" onclick="filterCategory('poisson', this)">Poissons</button>
        <button class="chip" onclick="filterCategory('vege_aop', this)">Halloumi & Fromages</button>
        <button class="chip" onclick="filterCategory('vege_tofu', this)">100% Végétal</button>
        <button class="chip" onclick="filterCategory('dal', this)">Dals & Légumes</button>
        <button class="chip" onclick="filterCategory('eco', this)">Éco (&lt; 2,50€)</button>
        <button class="chip" onclick="filterCategory('plaisir', this)">Option Plaisir</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:11px; font-weight:800; color:var(--ink-500);" id="cat-filter-status">
          30 recettes disponibles
        </span>
        <button onclick="toggleFilterOnlyMatching()" id="btn-filter-toggle" style="font-size:10.5px; font-weight:800; padding:4px 10px; border-radius:99px; border:1px solid var(--border); background:#FFF; cursor:pointer;">
          Recettes adaptées à vos critères
        </button>
      </div>
    </div>

    <div id="catalog-list"></div>
  </div>

  <!-- ================================================================
       VUE 2 : MON MENU DE LA SEMAINE & BILAN NUTRITIONNEL
       ================================================================ -->
  <div id="view-menu" class="view-panel" style="display:none;">
    <!-- Nutrition Live Rings Banner with Animated Macro Gauges -->
    <div class="whoop-banner">
      <div class="whoop-top">
        <div>
          <div class="whoop-title" id="whoop-title-text">Bilan Nutritionnel Quotidien • Profil Sportif</div>
          <div class="whoop-prot" id="whoop-prot">132g Protéines <span style="font-size:11px; color:#94A3B8; font-weight:500;">/ jour (Cible 130g)</span></div>
        </div>
        <div class="whoop-plate-cost" id="whoop-plate-cost">2,85 € / assiette</div>
      </div>
      <div class="rings-grid">
        <div class="ring-box">
          <div class="ring-val" style="color:#FF5A36;" id="stat-prot">132g</div>
          <div class="ring-lbl">Protéines</div>
          <div class="macro-gauge-track"><div class="macro-gauge-bar" id="gauge-prot" style="width:100%; background:#FF5A36;"></div></div>
          <div style="font-size:9px; color:#34D399; font-weight:800; margin-top:3px;">101% objectif</div>
        </div>
        <div class="ring-box">
          <div class="ring-val" style="color:#38BDF8;" id="stat-carbs">54g</div>
          <div class="ring-lbl">Glucides</div>
          <div class="macro-gauge-track"><div class="macro-gauge-bar" id="gauge-carbs" style="width:75%; background:#38BDF8;"></div></div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700; margin-top:3px;">Énergie lente</div>
        </div>
        <div class="ring-box">
          <div class="ring-val" style="color:#FBBF24;" id="stat-fat">18g</div>
          <div class="ring-lbl">Lipides</div>
          <div class="macro-gauge-track"><div class="macro-gauge-bar" id="gauge-fat" style="width:65%; background:#FBBF24;"></div></div>
          <div style="font-size:9px; color:#94A3B8; font-weight:700; margin-top:3px;">Bons acides</div>
        </div>
      </div>
    </div>

    <!-- Active 5 Slots List -->
    <div class="section-title">
      <span>Vos 5 plats pour la semaine (Lundi à Vendredi)</span>
      <span style="color:var(--coral);">10 repas au total</span>
    </div>
    <div id="slots-container"></div>
  </div>

  <!-- ================================================================
       VUE 3 : COURSES DYNAMIQUES PAR RAYON
       ================================================================ -->
  <div id="view-cart" class="view-panel" style="display:none;">
    <div class="card" style="margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:var(--ink-500);">Panier d'ingrédients exacts</span>
          <div style="font-size:22px; font-weight:900;" id="cart-total-title">0,00 €</div>
          <div style="font-size:11px; color:var(--ink-500); font-weight:700;" id="cart-subtitle">10 repas • 0,00 € / assiette</div>
        </div>
        <div style="text-align:right; background:#F8FAFC; padding:8px 12px; border-radius:14px; border:1px solid var(--border);">
          <span style="font-size:9.5px; color:var(--ink-500); font-weight:700; display:block;">Total Protéines</span>
          <strong style="font-size:15px; font-weight:900; color:var(--coral);" id="cart-total-prot">0g</strong>
          <span style="font-size:10px; color:var(--mint-dark); font-weight:800; display:block;" id="cart-prot-per-eur">0g prot/€</span>
        </div>
      </div>
    </div>

    <!-- Pantry deduction toggle -->
    <div class="card" onclick="togglePantry()" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div>
        <div style="font-size:13px; font-weight:800;">Déduire mes basiques du placard</div>
        <div style="font-size:11px; color:var(--ink-500);" id="pantry-deduct-lbl">Retire huiles, épices, sel et condiments</div>
      </div>
      <div style="width:38px; height:22px; border-radius:99px; background:#CBD5E1; position:relative;" id="pantry-switch">
        <div style="width:18px; height:18px; border-radius:99px; background:#FFF; position:absolute; top:2px; left:2px; transition:transform 0.25s var(--ease-spring);" id="pantry-knob"></div>
      </div>
    </div>

    <div id="groceries-container"></div>
  </div>

  <!-- ================================================================
       VUE 4 : PRÉPARATION (SESSION CUISINE & RECETTES PRÉVUES)
       ================================================================ -->
  <div id="view-prep" class="view-panel" style="display:none;">
    <!-- Sub-navigator inside Preparation -->
    <div class="prep-subnav">
      <button class="prep-sub-btn active" id="btn-prep-batch" onclick="setPrepMode('batch')">⏱️ Grand Batch (1h20)</button>
      <button class="prep-sub-btn" id="btn-prep-recipes" onclick="setPrepMode('recipes')">Fiches Recettes</button>
    </div>

    <!-- SUBVIEW A: LE GRAND BATCH EN 1H20 -->
    <div id="prep-sub-batch" style="display:block;">
      <!-- Interactive Timer Hero with Pulsing Dot & Timeline Bar -->
      <div class="timer-hero">
        <div style="flex:1;">
          <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#94A3B8;">Chrono Session Batch</div>
          <div class="timer-val">
            <span class="timer-pulse-dot" id="timer-live-dot"></span>
            <span id="batch-timer-display">01:20:00</span>
          </div>
          <div style="font-size:11px; color:#34D399; font-weight:700;"><span id="batch-steps-done-count">0</span> / 8 étapes terminées</div>
          <div class="timer-progress-track">
            <div class="timer-progress-bar" id="batch-timer-progress" style="width:0%;"></div>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end; margin-left:12px;">
          <button class="timer-btn" id="batch-timer-btn" onclick="toggleBatchTimer()">Démarrer ▶</button>
          <button onclick="resetBatchTimer()" style="background:transparent; border:none; color:#94A3B8; font-size:10.5px; font-weight:700; cursor:pointer;">Réinitialiser</button>
        </div>
      </div>

      <!-- Cooking Stations Requirements Card -->
      <div class="card" style="margin-bottom:12px;">
        <div class="section-title">
          <span>Matériel &amp; Postes de cuisson requis</span>
          <span style="color:var(--coral);">Pour vos 5 plats</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;" id="prep-stations-tags"></div>
      </div>

      <!-- 8 Illustrated Steps -->
      <div id="batch-steps-container"></div>
    </div>

    <!-- SUBVIEW B: LES 5 FICHES RECETTES DÉTAILLÉES -->
    <div id="prep-sub-recipes" style="display:none;">
      <div class="section-title">
        <span>Les 5 Recettes prévues pour votre semaine</span>
        <span style="color:var(--mint-dark);">Proportions exactes</span>
      </div>
      <div id="prep-recipes-container"></div>
    </div>
  </div>

  <!-- Modal Recipe Detail with Drag Handle -->
  <div class="modal-overlay" id="recipe-modal" onclick="closeModal()">
    <div class="modal-sheet" onclick="event.stopPropagation()">
      <div class="modal-handle"></div>
      <div id="modal-content"></div>
      <button onclick="closeModal()" style="width:100%; margin-top:12px; padding:11px; background:var(--ink-900); color:#FFF; font-weight:800; font-size:12px; border-radius:14px; border:none; cursor:pointer;">
        Fermer
      </button>
    </div>
  </div>

  <!-- Bottom Glass Dock (4 ONGLETS UNIQUEMENT EN BAS AVEC MOTION) -->
  <div class="bottom-dock">
    <div class="dock-pill">
      <button class="dock-btn active" id="dock-btn-catalog" onclick="switchView('catalog')" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/></svg> <span>Catalogue</span></button>
      <button class="dock-btn" id="dock-btn-menu" onclick="switchView('menu')" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg> <span>Mon Menu</span></button>
      <button class="dock-btn" id="dock-btn-cart" onclick="switchView('cart')" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg> <span>Courses</span></button>
      <button class="dock-btn" id="dock-btn-prep" onclick="switchView('prep')" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.8a4.41 4.41 0 1 1 5-7.6 4.42 4.42 0 0 1 6 0 4.43 4.43 0 1 1 5 7.6"/><path d="M6 17h12a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2Z"/></svg> <span>Préparation</span></button>
    </div>
  </div>
  </div> <!-- Fin app-main-content -->

        <div class="device-home-bar"></div>
      </div> <!-- Fin device-screen -->
    </div> <!-- Fin device-chassis -->
  </div> <!-- Fin device-stage -->

  <script>
    function setDeviceMode(mode) {{
      var chassis = document.getElementById('device-chassis');
      var btns = ['iphone', 'compact', 'pixel', 'fluid'];
      btns.forEach(function(b) {{
        var el = document.getElementById('sim-btn-' + b);
        if (el) el.classList.toggle('active', b === mode);
      }});
      if (chassis) {{
        chassis.className = 'device-chassis' + (mode === 'fluid' ? ' device-fluid' : (mode === 'compact' ? ' device-compact' : (mode === 'pixel' ? ' device-pixel' : '')));
      }}
    }}

    // Live clock in status bar
    function updateDeviceClock() {{
      var timeEl = document.getElementById('device-time');
      if (timeEl) {{
        var now = new Date();
        var h = String(now.getHours()).padStart(2, '0');
        var m = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = h + ':' + m;
      }}
    }}
    setInterval(updateDeviceClock, 30000);
    updateDeviceClock();

    var ALL_RECIPES = {recipes_json_str};
    var IMG_MAP = {img_map_json_str};
    var STEP_THUMBS = {step_thumbs_json_str};
    var BATCH_STEPS = {batch_steps_json_str};

    var DAYS = [
      "Lundi • Repas 1 & 2",
      "Mardi • Repas 3 & 4",
      "Mercredi • Repas 5 & 6",
      "Jeudi • Repas 7 & 8",
      "Vendredi • Repas 9 & 10"
    ];
    var SHORT_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

    var state = {{
      people: 2,
      weight: 72,
      isConfigOpen: true,
      diet: 'omni',
      prot: 130,
      budget: 'std',
      pleasure: false,
      filterOnlyMatching: true,
      currentCategory: 'all',
      searchQuery: '',
      slots: ['d_greek', 'd_dal', 'd_tofu_satay', 'd_chimi', 'd_tiger'],
      pantryDeduct: false,
      checkedItems: {{}},
      activeView: 'catalog',
      prepMode: 'batch',
      targetSlotToSwap: null,
      doneSteps: {{}},
      totalTimerSeconds: 80 * 60,
      timerSeconds: 80 * 60,
      timerRunning: false,
      timerInterval: null
    }};

    function toggleConfigCard(open) {{
      if (open !== undefined) {{
        state.isConfigOpen = open;
      }} else {{
        state.isConfigOpen = !state.isConfigOpen;
      }}
      var card = document.getElementById('config-card');
      var bar = document.getElementById('config-collapsed-bar');
      if (card) card.style.display = state.isConfigOpen ? 'block' : 'none';
      if (bar) bar.style.display = state.isConfigOpen ? 'none' : 'flex';
      updateConfigSummaryUI();
    }}

    function updateConfigSummaryUI() {{
      var prof = getProfileInfo(state.prot);
      var mult = getProfileMultiplier(state.prot);
      var targetDaily = Math.round(state.weight * mult);
      var targetMeal = Math.round(targetDaily / 2);
      var dietLabel = state.diet === 'vege' ? 'Végétarien' : state.diet === 'pesco' ? 'Pescatarien' : 'Omnivore';

      var summaryPill = document.getElementById('config-summary-pill');
      if (summaryPill) {{
        summaryPill.textContent = state.weight + ' kg • ' + prof.name + ' • ~' + targetMeal + 'g prot/repas • ' + dietLabel + ' • ' + state.people + ' pers';
      }}

      var pleBadge = document.getElementById('lbl-pleasure-badge');
      if (pleBadge) {{
        pleBadge.textContent = state.pleasure ? 'Activé' : '+ Activer';
        pleBadge.style.color = state.pleasure ? 'var(--mint-dark)' : 'var(--coral)';
      }}
    }}

    function getProfileMultiplier(p) {{
      if (p === 110) return 1.5;
      if (p === 160) return 2.2;
      return 1.8;
    }}

    function getDishProtein(d) {{
      var baseProt = (d.prot && d.prot[state.prot]) || 60;
      return Math.round(baseProt * (state.weight / 72));
    }}

    function getProfileInfo(p) {{
      if (p === 110) return {{ name: 'Actif', icon: '', tag: '108g/j', rhythm: 'Forme (1.5g/kg)' }};
      if (p === 160) return {{ name: 'Athlète', icon: '', tag: '158g/j', rhythm: 'Muscu (2.2g/kg)' }};
      return {{ name: 'Sportif', icon: '', tag: '130g/j', rhythm: 'Tonus (1.8g/kg)' }};
    }}

    function updateWeightUI() {{
      var mult = getProfileMultiplier(state.prot);
      var targetDaily = Math.round(state.weight * mult);
      var wEl = document.getElementById('lbl-weight-val');
      if (wEl) wEl.innerHTML = state.weight + ' <span style="font-size:12px; color:var(--ink-500); font-weight:700;">kg</span>';
      var targetEl = document.getElementById('lbl-weight-target');
      if (targetEl) targetEl.textContent = 'Cible : ' + targetDaily + 'g/j (' + mult.toFixed(1) + 'g/kg)';
      var slider = document.getElementById('weight-range-slider');
      if (slider) slider.value = state.weight;

      // Update quick chips
      [55, 65, 72, 80, 90, 100].forEach(function(val) {{
        var chip = document.getElementById('chip-w-' + val);
        if (chip) chip.className = 'w-chip' + (val === state.weight ? ' active' : '');
      }});

      // Update profile cards labels
      var prof110 = Math.round(state.weight * 1.5);
      var prof130 = Math.round(state.weight * 1.8);
      var prof160 = Math.round(state.weight * 2.2);

      var b110 = document.getElementById('badge-prof-110');
      var b130 = document.getElementById('badge-prof-130');
      var b160 = document.getElementById('badge-prof-160');
      if (b110) b110.textContent = prof110 + 'g/j';
      if (b130) b130.textContent = prof130 + 'g/j';
      if (b160) b160.textContent = prof160 + 'g/j';

      var m110 = document.getElementById('meal-prof-110');
      var m130 = document.getElementById('meal-prof-130');
      var m160 = document.getElementById('meal-prof-160');
      if (m110) m110.textContent = '~' + Math.round(prof110 / 2) + 'g / repas';
      if (m130) m130.textContent = '~' + Math.round(prof130 / 2) + 'g / repas';
      if (m160) m160.textContent = '~' + Math.round(prof160 / 2) + 'g / repas';

      var sumEl = document.getElementById('lbl-profile-summary');
      var prof = getProfileInfo(state.prot);
      if (sumEl) sumEl.textContent = prof.icon + ' ' + prof.name + ' (' + targetDaily + 'g prot/j • ' + mult.toFixed(1) + 'g/kg)';
    }}

    function setWeight(w) {{
      state.weight = Math.max(45, Math.min(120, Number(w)));
      updateWeightUI();
      triggerToast('Poids ajusté : ' + state.weight + ' kg');
      renderApp();
    }}

    function adjustWeight(delta) {{
      setWeight(state.weight + delta);
    }}

    function triggerToast(msg) {{
      var t = document.getElementById('app-toast');
      if (t) {{
        t.textContent = msg;
        t.style.display = 'block';
        t.style.animation = 'none';
        t.offsetHeight;
        t.style.animation = 'toastSlideIn 2.8s var(--ease-smooth) forwards';
        setTimeout(function() {{ t.style.display = 'none'; }}, 2800);
      }}
    }}

    function setPeople(n) {{
      state.people = n;
      document.querySelectorAll('.p-btn').forEach(function(b, idx) {{
        b.classList.toggle('active', [1,2,3,4,6][idx] === n);
      }});
      [1,2,3,4,6].forEach(function(x) {{
        var fb = document.getElementById('btn-foyer-' + x);
        if (fb) fb.classList.toggle('active', x === n);
      }});
      if (document.getElementById('lbl-foyer-summary')) {{
        document.getElementById('lbl-foyer-summary').textContent = n + ' personne' + (n > 1 ? 's' : '') + ' (' + (n * 10) + ' repas)';
      }}
      updateConfigSummaryUI();
      triggerToast('Portions ajustées pour ' + n + ' personne' + (n > 1 ? 's' : '') + ' (' + (n*10) + ' repas)');
      renderApp();
    }}

    function setDiet(d) {{
      state.diet = d;
      document.getElementById('lbl-diet').textContent = d === 'vege' ? '100% Végé' : d === 'pesco' ? 'Pescatarien' : 'Omnivore';
      document.getElementById('btn-diet-omni').className = 'pill-btn' + (d === 'omni' ? ' active' : '');
      document.getElementById('btn-diet-vege').className = 'pill-btn' + (d === 'vege' ? ' active' : '');
      document.getElementById('btn-diet-pesco').className = 'pill-btn' + (d === 'pesco' ? ' active' : '');

      if (d === 'vege') {{
        if (state.slots[0] === 'd_greek' || state.slots[0] === 'd_kefta') state.slots[0] = 'd_halloumi';
        if (state.slots[3] === 'd_chimi') state.slots[3] = 'd_med_tofu';
        if (state.slots[4] === 'd_burger_omni') state.slots[4] = 'd_burger_vege';
      }} else if (d === 'pesco') {{
        if (state.slots[0] === 'd_greek' || state.slots[0] === 'd_kefta') state.slots[0] = 'd_thon_bowl';
        if (state.slots[3] === 'd_chimi') state.slots[3] = 'd_cabillaud_provencale';
      }} else {{
        if (state.slots[0] === 'd_halloumi' || state.slots[0] === 'd_thon_bowl') state.slots[0] = 'd_greek';
        if (state.slots[3] === 'd_med_tofu') state.slots[3] = 'd_chimi';
      }}
      triggerToast('Filtre : ' + (d === 'vege' ? '100% Végétarien' : d === 'pesco' ? 'Pescatarien' : 'Omnivore'));
      renderApp();
    }}

    function setProt(p) {{
      state.prot = p;
      updateWeightUI();
      var prof = getProfileInfo(p);
      var mult = getProfileMultiplier(p);
      var targetDaily = Math.round(state.weight * mult);

      [110, 130, 160].forEach(function(val) {{
        var btn = document.getElementById('btn-prof-' + val);
        if (btn) btn.classList.toggle('active', val === p);
      }});

      triggerToast('Profil ' + prof.name + ' activé : ' + targetDaily + 'g (' + state.weight + 'kg • ' + mult.toFixed(1) + 'g/kg)');
      renderApp();
    }}

    function setBudget(b) {{
      state.budget = b;
      document.getElementById('lbl-budget').textContent = b === 'eco' ? 'Malin < 2,50€' : b === 'std' ? 'Équilibré (~2,85€)' : 'Gourmet (~3,40€)';
      ['eco', 'std', 'gourmet'].forEach(function(val) {{
        var btn = document.getElementById('btn-bud-' + val);
        if (btn) btn.className = 'pill-btn' + (val === b ? ' active-mint' : '');
      }});
      triggerToast('Budget calé sur ' + (b === 'eco' ? 'Malin' : b === 'std' ? 'Équilibré' : 'Gourmet'));
      renderApp();
    }}

    function togglePleasure() {{
      state.pleasure = !state.pleasure;
      var btn = document.getElementById('btn-pleasure');
      if (state.pleasure) {{
        state.slots[4] = state.diet === 'vege' ? 'd_burger_vege' : 'd_burger_omni';
        btn.textContent = 'Option activée'; updateConfigSummaryUI();
        btn.className = 'pill-btn active-coral';
        triggerToast('Option plaisir activée pour le vendredi !');
      }} else {{
        state.slots[4] = 'd_tiger';
        btn.textContent = '+ Activer';
        btn.className = 'pill-btn';
        triggerToast('Option 100% Healthy pour le vendredi.');
      }}
      renderApp();
    }}

    function toggleFilterOnlyMatching() {{
      state.filterOnlyMatching = !state.filterOnlyMatching;
      var btn = document.getElementById('btn-filter-toggle');
      if (btn) {{
        btn.textContent = state.filterOnlyMatching ? 'Recettes adaptées à vos critères' : 'Afficher les 30 recettes';
        btn.style.color = state.filterOnlyMatching ? 'var(--mint-dark)' : 'var(--ink-500)';
      }}
      renderApp();
    }}

    function filterCategory(cat, el) {{
      state.currentCategory = cat;
      document.querySelectorAll('#cat-filter-chips .chip').forEach(function(c) {{ c.classList.remove('active'); }});
      if (el) el.classList.add('active');
      renderApp();
    }}

    function onSearch(val) {{
      state.searchQuery = val.trim().toLowerCase();
      renderApp();
    }}

    function switchView(viewName) {{
      state.activeView = viewName;
      var views = ['catalog', 'menu', 'cart', 'prep'];
      views.forEach(function(v) {{
        var el = document.getElementById('view-' + v);
        var btn = document.getElementById('dock-btn-' + v);
        if (v === viewName) {{
          el.style.display = 'block';
          el.classList.remove('view-panel');
          void el.offsetWidth;
          el.classList.add('view-panel');
          btn.classList.add('active');
        }} else {{
          el.style.display = 'none';
          btn.classList.remove('active');
        }}
      }});

      window.scrollTo({{ top: 0, behavior: 'smooth' }});
      renderApp();
    }}

    function setPrepMode(mode) {{
      state.prepMode = mode;
      document.getElementById('btn-prep-batch').classList.toggle('active', mode === 'batch');
      document.getElementById('btn-prep-recipes').classList.toggle('active', mode === 'recipes');
      
      var bEl = document.getElementById('prep-sub-batch');
      var rEl = document.getElementById('prep-sub-recipes');
      if (mode === 'batch') {{
        bEl.style.display = 'block';
        bEl.classList.remove('view-panel');
        void bEl.offsetWidth;
        bEl.classList.add('view-panel');
        rEl.style.display = 'none';
      }} else {{
        rEl.style.display = 'block';
        rEl.classList.remove('view-panel');
        void rEl.offsetWidth;
        rEl.classList.add('view-panel');
        bEl.style.display = 'none';
      }}
      renderApp();
    }}

    function toggleBatchTimer() {{
      state.timerRunning = !state.timerRunning;
      var btn = document.getElementById('batch-timer-btn');
      var dot = document.getElementById('timer-live-dot');
      if (state.timerRunning) {{
        btn.textContent = 'Pause ⏸';
        btn.style.background = 'var(--amber)';
        if (dot) dot.classList.add('running');
        state.timerInterval = setInterval(function() {{
          if (state.timerSeconds > 0) {{
            state.timerSeconds--;
            updateTimerDisplay();
          }} else {{
            clearInterval(state.timerInterval);
            state.timerRunning = false;
            btn.textContent = 'Terminé';
            if (dot) dot.classList.remove('running');
            triggerToast('⏱️ Session Batch 1h20 terminée ! Bon appétit.');
          }}
        }}, 1000);
      }} else {{
        btn.textContent = 'Reprendre ▶';
        btn.style.background = 'var(--coral)';
        if (dot) dot.classList.remove('running');
        clearInterval(state.timerInterval);
      }}
    }}

    function resetBatchTimer() {{
      clearInterval(state.timerInterval);
      state.timerRunning = false;
      state.timerSeconds = state.totalTimerSeconds;
      var btn = document.getElementById('batch-timer-btn');
      var dot = document.getElementById('timer-live-dot');
      if (btn) {{
        btn.textContent = 'Démarrer ▶';
        btn.style.background = 'var(--coral)';
      }}
      if (dot) dot.classList.remove('running');
      updateTimerDisplay();
    }}

    function updateTimerDisplay() {{
      var h = Math.floor(state.timerSeconds / 3600);
      var m = Math.floor((state.timerSeconds % 3600) / 60);
      var s = state.timerSeconds % 60;
      var str = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
      var el = document.getElementById('batch-timer-display');
      if (el) el.textContent = str;

      var progress = ((state.totalTimerSeconds - state.timerSeconds) / state.totalTimerSeconds) * 100;
      var bar = document.getElementById('batch-timer-progress');
      if (bar) bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }}

    function toggleStepDone(stepNum) {{
      state.doneSteps[stepNum] = !state.doneSteps[stepNum];
      renderApp();
    }}

    function togglePantry() {{
      state.pantryDeduct = !state.pantryDeduct;
      var knob = document.getElementById('pantry-knob');
      var sw = document.getElementById('pantry-switch');
      if (knob && sw) {{
        knob.style.transform = state.pantryDeduct ? 'translateX(16px)' : 'translateX(0)';
        sw.style.background = state.pantryDeduct ? 'var(--mint)' : '#CBD5E1';
      }}
      triggerToast(state.pantryDeduct ? 'Basiques du placard déduits !' : 'Basiques réintégrés aux courses');
      renderApp();
    }}

    function toggleCheck(name) {{
      state.checkedItems[name] = !state.checkedItems[name];
      renderApp();
    }}

    function assignSlot(slotIdx, dishId) {{
      var r = ALL_RECIPES.find(function(x) {{ return x.id === dishId; }});
      if (!r) return;
      state.slots[slotIdx] = dishId;
      state.targetSlotToSwap = null;
      triggerToast(r.shortName + ' ajouté au ' + SHORT_DAYS[slotIdx] + ' — synchronisé.');
      renderApp();
    }}

    function promptSwap(slotIdx) {{
      state.targetSlotToSwap = slotIdx;
      switchView('catalog');
      triggerToast('Choisissez un plat pour ' + SHORT_DAYS[slotIdx]);
    }}

    function openModal(dishId) {{
      var r = ALL_RECIPES.find(function(x) {{ return x.id === dishId; }});
      if (!r) return;
      var img = IMG_MAP[r.imgKey] || '';
      var prof = getProfileInfo(state.prot);

      var html = '<div style="position:relative; aspect-ratio:16/9; border-radius:18px; overflow:hidden; margin-bottom:12px; background:#0F172A;">' +
        '<img src="' + img + '" style="width:100%; height:100%; object-fit:cover;" />' +
        '</div>' +
        '<div style="font-size:11px; font-weight:800; color:var(--coral); text-transform:uppercase;">' + r.categoryLabel + ' • ' + r.prepTime + '</div>' +
        '<h3 style="font-size:18px; font-weight:900; color:var(--ink-900); margin:4px 0 10px 0;">' + r.name + '</h3>' +
        '<div style="background:#F8FAFC; padding:10px; border-radius:14px; border:1px solid var(--border); margin-bottom:12px;">' +
        '<div style="font-size:11px; font-weight:800; color:var(--ink-500); margin-bottom:6px;">AJOUTER CE PLAT À VOTRE SEMAINE :</div>' +
        '<div style="display:flex; gap:6px;">';

      SHORT_DAYS.forEach(function(d, idx) {{
        var isCurrent = state.slots[idx] === r.id;
        html += '<button onclick="assignSlot(' + idx + ', \\'' + r.id + '\\'); closeModal();" class="cat-day-btn' + (isCurrent ? ' selected' : '') + '" style="flex:1; padding:6px 0;">' + d + '</button>';
      }});

      html += '</div></div>' +
        '<div style="background:#ECFDF5; border:1px solid rgba(16,185,129,0.3); padding:8px 12px; border-radius:12px; font-size:11.5px; color:var(--mint-dark); margin-bottom:10px;">' +
        '<strong>Calibré pour ' + state.weight + ' kg • ' + prof.name + ' : </strong>Apporte ' + getDishProtein(r) + 'g de protéines par assiette.' +
        '</div>' +
        '<p style="font-size:12px; color:var(--ink-700); line-height:1.45; margin-bottom:12px;">' + r.desc + '</p>' +
        '<div style="font-size:11px; font-weight:800; color:var(--ink-500); margin-bottom:6px;">INGRÉDIENTS PAR ASSIETTE :</div>' +
        '<div style="display:flex; flex-direction:column; gap:4px; margin-bottom:12px;">';

      r.ingredients.forEach(function(ing) {{
        html += '<div style="display:flex; justify-content:space-between; font-size:11px; padding:4px 8px; background:#F1F5F9; border-radius:8px;">' +
          '<span>' + ing.name + '</span><strong>' + ing.qty + ' ' + ing.unit + '</strong></div>';
      }});

      html += '</div>' +
        '<div style="background:var(--coral-light); border:1px solid rgba(255,90,54,0.3); padding:8px 12px; border-radius:12px; font-size:11px; color:var(--coral);">' +
        '<strong>Astuce Réchauffage &amp; Conservation : </strong>' + r.assemblyTip + '</div>';

      document.getElementById('modal-content').innerHTML = html;
      document.getElementById('recipe-modal').style.display = 'flex';
    }}

    function closeModal() {{
      document.getElementById('recipe-modal').style.display = 'none';
    }}

    function renderApp() {{
      var prof = getProfileInfo(state.prot);
      var mult = getProfileMultiplier(state.prot);
      var targetDaily = Math.round(state.weight * mult);
      var activeDishes = state.slots.map(function(id) {{
        return ALL_RECIPES.find(function(x) {{ return x.id === id; }}) || ALL_RECIPES[0];
      }});

      // 1. Stats & Animated Macro Gauges
      var sumProt = 0, sumCal = 0, sumCarbs = 0, sumFat = 0, sumCost = 0;
      activeDishes.forEach(function(d) {{
        sumProt += getDishProtein(d);
        sumCal += d.cal || 600;
        sumCarbs += d.carbs || 50;
        sumFat += d.fat || 15;
        sumCost += d.cost[state.budget] || 2.85;
      }});
      var avgProt = Math.round(sumProt / activeDishes.length);
      var avgCal = Math.round(sumCal / activeDishes.length);
      var avgCarbs = Math.round(sumCarbs / activeDishes.length);
      var avgFat = Math.round(sumFat / activeDishes.length);
      var avgCost = (sumCost / activeDishes.length).toFixed(2).replace('.', ',');

      document.getElementById('whoop-title-text').textContent = 'Bilan Nutritionnel Quotidien • ' + state.weight + ' kg • Profil ' + prof.name + ' ' + prof.icon;
      document.getElementById('whoop-prot').innerHTML = (avgProt * 2) + 'g Protéines <span style="font-size:11px; color:#94A3B8; font-weight:500;">/ jour (Cible ' + targetDaily + 'g • ' + mult.toFixed(1) + 'g/kg)</span>';
      document.getElementById('stat-prot').textContent = avgProt + 'g';
      document.getElementById('stat-carbs').textContent = avgCarbs + 'g';
      document.getElementById('stat-fat').textContent = avgFat + 'g';
      document.getElementById('whoop-plate-cost').textContent = avgCost + ' € / assiette';

      // Update animated gauges
      var gProt = document.getElementById('gauge-prot');
      var gCarbs = document.getElementById('gauge-carbs');
      var gFat = document.getElementById('gauge-fat');
      if (gProt) gProt.style.width = Math.min(100, Math.round(((avgProt * 2) / targetDaily) * 100)) + '%';
      if (gCarbs) gCarbs.style.width = Math.min(100, Math.round(avgCarbs / 70 * 100)) + '%';
      if (gFat) gFat.style.width = Math.min(100, Math.round(avgFat / 25 * 100)) + '%';

      var summaryProtEl = document.getElementById('summary-prot');
      var summaryCostEl = document.getElementById('summary-cost');
      var summaryProfTag = document.getElementById('summary-profile-tag');
      if (summaryProtEl) summaryProtEl.textContent = avgProt + 'g';
      if (summaryCostEl) summaryCostEl.textContent = avgCost + ' €';
      if (summaryProfTag) summaryProfTag.textContent = prof.icon + ' ' + state.weight + 'kg (' + prof.name + ')';

      // 2. Render Slots (View 2) with Staggered Entrance
      var slotsHtml = '';
      activeDishes.forEach(function(d, idx) {{
        var img = IMG_MAP[d.imgKey] || '';
        var staggerDelay = (idx * 0.04).toFixed(3) + 's';
        slotsHtml += '<div class="slot-card" style="animation-delay:' + staggerDelay + ';">' +
          '<div class="slot-photo-wrap">' +
          '<img src="' + img + '" alt="' + d.name + '" />' +
          '<div class="slot-day-badge">' + DAYS[idx] + '</div>' +
          '<button class="slot-swap-btn" onclick="promptSwap(' + idx + ')">Remplacer</button>' +
          '</div>' +
          '<div class="slot-info" onclick="openModal(\\'' + d.id + '\\')" style="cursor:pointer;">' +
          '<div class="slot-title">' + d.name + '</div>' +
          '<div class="slot-meta">' +
          '<span style="color:var(--coral); font-weight:800;">' + prof.icon + ' ' + getDishProtein(d) + 'g PROT</span>' +
          '<span>' + d.cal + ' kcal • ' + d.cookMethodLabel + '</span>' +
          '<strong style="color:var(--mint-dark);">' + (d.cost[state.budget] || 2.85).toFixed(2).replace('.', ',') + ' €</strong>' +
          '</div></div></div>';
      }});
      document.getElementById('slots-container').innerHTML = slotsHtml;

      // 3. Filter and Render Catalog (View 1 - FIRST SCREEN) with Stagger
      var filtered = ALL_RECIPES.filter(function(r) {{
        if (state.searchQuery) {{
          var q = state.searchQuery;
          var m = r.name.toLowerCase().indexOf(q) !== -1 || r.desc.toLowerCase().indexOf(q) !== -1;
          if (!m) return false;
        }}
        if (state.filterOnlyMatching) {{
          if (state.diet === 'vege' && (r.diet === 'omni' || r.diet === 'pesco')) return false;
          if (state.diet === 'pesco' && r.diet === 'omni') return false;
          if (state.budget === 'eco' && !r.isEco && r.cost.eco > 2.60) return false;
        }}
        if (state.currentCategory === 'volaille') return r.category === 'volaille';
        if (state.currentCategory === 'boeuf') return r.category === 'boeuf';
        if (state.currentCategory === 'poisson') return r.category === 'poisson';
        if (state.currentCategory === 'vege_aop') return r.category === 'vege_aop';
        if (state.currentCategory === 'vege_tofu') return r.category === 'vege_tofu';
        if (state.currentCategory === 'dal') return r.category === 'dal';
        if (state.currentCategory === 'plaisir') return r.isPleasure === true;
        if (state.currentCategory === 'eco') return r.isEco || r.cost[state.budget] <= 2.50;
        return true;
      }});

      document.getElementById('cat-filter-status').textContent = filtered.length + ' recettes adaptées à votre sélection (' + state.diet + ')';

      var catHtml = '';
      if (state.targetSlotToSwap !== null) {{
        catHtml += '<div style="background:var(--coral-light); border:1px solid rgba(255,90,54,0.4); padding:10px 14px; border-radius:14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; animation:cardStaggerIn 0.25s ease both;">' +
          '<div><span style="font-size:10px; font-weight:800; color:var(--coral); text-transform:uppercase;">Remplacement</span><div style="font-size:13px; font-weight:900;">Choisis un plat pour ' + DAYS[state.targetSlotToSwap] + '</div></div>' +
          '<button onclick="state.targetSlotToSwap=null; renderApp();" style="padding:4px 8px; border-radius:99px; border:1px solid #CBD5E1; background:#FFF; font-size:11px; font-weight:700;">Annuler</button>' +
          '</div>';
      }}

      filtered.forEach(function(r, idx) {{
        var img = IMG_MAP[r.imgKey] || '';
        var isInMenu = state.slots.indexOf(r.id);
        var staggerDelay = (idx * 0.03).toFixed(3) + 's';

        catHtml += '<div class="cat-card" style="animation-delay:' + staggerDelay + ';">' +
          '<div class="cat-photo-wrap" onclick="openModal(\\'' + r.id + '\\')" style="cursor:pointer;">' +
          '<img src="' + img + '" alt="' + r.name + '" loading="lazy" />' +
          '<div class="cat-top-badges">' +
          (r.tag ? '<span class="cat-badge-green">' + r.tag + '</span>' : '') +
          '<span class="cat-badge" style="display:flex; align-items:center; gap:3px;"><span>' + prof.icon + '</span><span>' + getDishProtein(r) + 'g prot</span></span>' +
          '</div>' +
          '<div class="cat-badge-price">' + (r.cost[state.budget] || 2.85).toFixed(2).replace('.', ',') + ' €</div>' +
          (isInMenu !== -1 ? '<div style="position:absolute; bottom:8px; left:8px; background:var(--mint); color:#FFF; font-size:10px; font-weight:800; padding:3px 8px; border-radius:99px; box-shadow:0 2px 6px rgba(0,0,0,0.2);">Dans le menu (' + SHORT_DAYS[isInMenu] + ')</div>' : '') +
          '</div>' +
          '<div class="cat-body">' +
          '<div class="cat-category">' + r.categoryLabel + ' • ' + r.prepTime + '</div>' +
          '<div class="cat-name" onclick="openModal(\\'' + r.id + '\\')" style="cursor:pointer;">' + r.name + '</div>' +
          '<div class="cat-desc">' + r.desc + '</div>' +
          '<div class="cat-actions">';

        if (state.targetSlotToSwap !== null) {{
          catHtml += '<button onclick="assignSlot(' + state.targetSlotToSwap + ', \\'' + r.id + '\\')" class="cat-day-btn" style="width:100%; background:var(--coral); color:#FFF; border-color:var(--coral); padding:8px 0; font-size:12px;">' +
            'Choisir pour ' + DAYS[state.targetSlotToSwap] + '</button>';
        }} else {{
          catHtml += '<span class="cat-actions-label">+ Ajouter pour :</span>' +
            '<div style="display:flex; gap:4px;">';
          SHORT_DAYS.forEach(function(d, dIdx) {{
            var isCurrent = state.slots[dIdx] === r.id;
            catHtml += '<button onclick="assignSlot(' + dIdx + ', \\'' + r.id + '\\')" class="cat-day-btn' + (isCurrent ? ' selected' : '') + '">' + d + '</button>';
          }});
          catHtml += '</div>';
        }}

        catHtml += '</div></div></div>';
      }});
      document.getElementById('catalog-list').innerHTML = catHtml;

      // 4. Calculate Dynamic Groceries (View 3)
      var portionsPerMeal = 2 * (state.people / 2);
      var totalPortions = state.people * 10;
      var priceMultiplier = state.budget === 'eco' ? 0.92 : state.budget === 'gourmet' ? 1.15 : 1.0;

      var itemsMap = {{}};
      activeDishes.forEach(function(dish) {{
        dish.ingredients.forEach(function(ing) {{
          var key = ing.name.trim().toLowerCase();
          var pPrice = (ing.pricePerPortion || 0.4) * portionsPerMeal * priceMultiplier;
          var pProt = (ing.protPerPortion || 5) * portionsPerMeal;

          if (!itemsMap[key]) {{
            itemsMap[key] = {{
              name: ing.name,
              totalQty: ing.qty * portionsPerMeal,
              unit: ing.unit,
              aisle: ing.aisle,
              aisleLabel: ing.aisleLabel,
              totalPrice: pPrice,
              totalProt: pProt,
              isPantry: !!ing.isPantry,
              usedIn: [dish.shortName]
            }};
          }} else {{
            itemsMap[key].totalQty += ing.qty * portionsPerMeal;
            itemsMap[key].totalPrice += pPrice;
            itemsMap[key].totalProt += pProt;
            if (itemsMap[key].usedIn.indexOf(dish.shortName) === -1) {{
              itemsMap[key].usedIn.push(dish.shortName);
            }}
          }}
        }});
      }});

      var allItems = Object.values(itemsMap);
      var rawTotalCost = 0;
      var pantryCost = 0;
      var totalProt = 0;

      allItems.forEach(function(item) {{
        rawTotalCost += item.totalPrice;
        if (item.isPantry) pantryCost += item.totalPrice;
        totalProt += item.totalProt;
      }});

      var effectiveTotal = state.pantryDeduct ? Math.max(0, rawTotalCost - pantryCost) : rawTotalCost;
      var costPerMeal = (effectiveTotal / totalPortions).toFixed(2).replace('.', ',');
      var totalProtBought = Math.round(totalProt);
      var protPerEur = effectiveTotal > 0 ? (totalProtBought / effectiveTotal).toFixed(1) : '0';

      document.getElementById('cart-total-title').textContent = effectiveTotal.toFixed(2).replace('.', ',') + ' €';
      document.getElementById('cart-subtitle').textContent = totalPortions + ' repas • ' + costPerMeal + ' € / assiette';
      document.getElementById('cart-total-prot').textContent = totalProtBought + 'g';
      document.getElementById('cart-prot-per-eur').textContent = protPerEur + 'g prot / €';
      document.getElementById('pantry-deduct-lbl').textContent = 'Retire huiles, épices, sel et condiments (-' + pantryCost.toFixed(2).replace('.', ',') + ' €)';

      var aislesOrder = ['boucherie', 'cremerie', 'legumes', 'epicerie', 'placard'];
      var cartHtml = '';

      aislesOrder.forEach(function(aisleKey, aIdx) {{
        var aisleItems = allItems.filter(function(i) {{ return i.aisle === aisleKey; }});
        if (aisleItems.length === 0) return;
        var staggerDelay = (aIdx * 0.05).toFixed(3) + 's';

        if (state.pantryDeduct && aisleKey === 'placard') {{
          cartHtml += '<div style="background:#F1F5F9; border-radius:16px; padding:12px; text-align:center; font-size:11px; font-weight:700; color:var(--ink-500); margin-bottom:10px; animation:cardStaggerIn 0.3s ease both;">' +
            aisleItems.length + ' condiments du placard déduits du panier' +
            '</div>';
          return;
        }}

        var aisleTitle = aisleItems[0].aisleLabel || aisleKey;
        cartHtml += '<div class="aisle-group" style="animation-delay:' + staggerDelay + ';">' +
          '<div class="aisle-title"><span>' + aisleTitle + '</span><span>' + aisleItems.length + ' articles</span></div>';

        aisleItems.forEach(function(item) {{
          var isChecked = !!state.checkedItems[item.name];
          var qtyStr = item.unit === 'g' && item.totalQty >= 1000
            ? (item.totalQty / 1000).toFixed(1).replace('.', ',') + ' kg'
            : Math.round(item.totalQty) + ' ' + item.unit;

          cartHtml += '<div class="grocery-row' + (isChecked ? ' checked' : '') + '" onclick="toggleCheck(\\'' + item.name.replace(/'/g, "\\\\'") + '\\')">' +
            '<div class="g-left">' +
            '<div class="g-chk" style="display:flex; align-items:center; justify-content:center;">' + (isChecked ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '') + '</div>' +
            '<div><div class="g-name">' + item.name + '</div>' +
            '<div class="g-sub">' + qtyStr + ' • ' + item.usedIn.join(', ') + '</div></div>' +
            '</div>' +
            '<div class="g-price">' + item.totalPrice.toFixed(2).replace('.', ',') + ' €</div>' +
            '</div>';
        }});

        cartHtml += '</div>';
      }});
      document.getElementById('groceries-container').innerHTML = cartHtml;

      // 5. Render Préparation (View 4) with Motion
      var stationsSet = {{}};
      activeDishes.forEach(function(d) {{
        stationsSet[d.cookMethodLabel] = true;
      }});
      var stationsHtml = '';
      Object.keys(stationsSet).forEach(function(st) {{
        stationsHtml += '<span style="background:var(--coral-light); color:var(--coral); font-size:11px; font-weight:800; padding:4px 10px; border-radius:99px; border:1px solid rgba(255,90,54,0.25);">' + st + '</span>';
      }});
      document.getElementById('prep-stations-tags').innerHTML = stationsHtml;

      // 8 Batch Steps
      var doneCount = 0;
      var stepsHtml = '';
      BATCH_STEPS.forEach(function(st, sIdx) {{
        var isDone = !!state.doneSteps[st.step];
        if (isDone) doneCount++;
        var stepImg = STEP_THUMBS['step' + st.step] || '';
        var staggerDelay = (sIdx * 0.04).toFixed(3) + 's';

        stepsHtml += '<div class="step-card' + (isDone ? ' done' : '') + '" style="animation-delay:' + staggerDelay + ';">' +
          (stepImg ? '<div class="step-photo-wrap"><img src="' + stepImg + '" alt="' + st.title + '" loading="lazy" />' +
                     '<div class="step-badge">⏱️ ' + st.time + ' • ' + st.duration + ' min</div></div>' : '') +
          '<div class="step-body">' +
          '<div style="font-size:10px; font-weight:800; color:var(--coral); text-transform:uppercase;">Étape ' + st.step + '/8 • ' + st.station + '</div>' +
          '<div class="step-title">' + st.title + '</div>' +
          '<div class="step-desc">' + st.desc + '</div>' +
          '<div style="margin-bottom:8px;">';

        st.actions.forEach(function(act) {{
          stepsHtml += '<div class="step-action-item">• ' + act + '</div>';
        }});

        stepsHtml += '</div>' +
          '<div class="step-tip"><strong>Conseil pro : </strong>' + st.tip + '</div>' +
          '<button class="step-done-btn' + (isDone ? ' active' : '') + '" onclick="toggleStepDone(' + st.step + ')">' +
          (isDone ? 'Étape terminée' : 'Marquer comme fait') +
          '</button>' +
          '</div></div>';
      }});
      document.getElementById('batch-steps-container').innerHTML = stepsHtml;
      document.getElementById('batch-steps-done-count').textContent = doneCount;

      // 5 Detailed Recipes for the week
      var prepRecHtml = '';
      activeDishes.forEach(function(d, dIdx) {{
        var img = IMG_MAP[d.imgKey] || '';
        var staggerDelay = (dIdx * 0.04).toFixed(3) + 's';
        prepRecHtml += '<div class="cat-card" style="margin-bottom:14px; animation-delay:' + staggerDelay + ';">' +
          '<div class="cat-photo-wrap" style="aspect-ratio:16/9;">' +
          '<img src="' + img + '" alt="' + d.name + '" loading="lazy" />' +
          '<div class="cat-top-badges">' +
          '<span class="cat-badge-green">' + DAYS[dIdx] + '</span>' +
          '<span class="cat-badge">' + getDishProtein(d) + 'g PROT / repas</span>' +
          '</div></div>' +
          '<div class="cat-body">' +
          '<div class="cat-category">' + d.categoryLabel + ' • ' + d.cookMethodLabel + '</div>' +
          '<div class="cat-name">' + d.name + '</div>' +
          '<div class="cat-desc">' + d.desc + '</div>' +
          '<div style="background:#F8FAFC; border:1px solid var(--border); padding:10px; border-radius:14px; margin-bottom:10px;">' +
          '<strong style="font-size:11px; font-weight:800; color:var(--ink-500); display:block; margin-bottom:6px; text-transform:uppercase;">Ingrédients pour ' + state.people + ' personne' + (state.people > 1 ? 's' : '') + ' (' + (state.people*2) + ' portions) :</strong>' +
          '<div style="display:flex; flex-direction:column; gap:4px;">';

        d.ingredients.forEach(function(ing) {{
          var totalIngQty = Math.round(ing.qty * (state.people * 2 / 2));
          var unitStr = ing.unit;
          if (unitStr === 'g' && totalIngQty >= 1000) {{
            totalIngQty = (totalIngQty / 1000).toFixed(1).replace('.', ',') + ' kg';
          }} else {{
            totalIngQty = totalIngQty + ' ' + unitStr;
          }}
          prepRecHtml += '<div style="display:flex; justify-content:space-between; font-size:11.5px; padding:3px 6px; background:#FFF; border-radius:6px; border:1px solid #F1F5F9;">' +
            '<span>' + ing.name + '</span><strong style="color:var(--ink-900);">' + totalIngQty + '</strong></div>';
        }});

        prepRecHtml += '</div></div>' +
          '<div style="background:var(--mint-light); border:1px solid rgba(16,185,129,0.3); padding:8px 12px; border-radius:12px; font-size:11.5px; color:var(--mint-dark);">' +
          '<strong>Astuce Réchauffage &amp; Conservation : </strong>' + d.assemblyTip + '</div>' +
          '</div></div>';
      }});
      document.getElementById('prep-recipes-container').innerHTML = prepRecHtml;
    }}

    // Initial render
    updateConfigSummaryUI();
    renderApp();
    updateTimerDisplay();
  </script>
</body>
</html>
'''

# Write to MacroBatch_App_Complete.html and MacroBatch_Inline_Widget.html
path_app = os.path.join(brain_dir, 'MacroBatch_App_Complete.html')
path_widget = os.path.join(brain_dir, 'MacroBatch_Inline_Widget.html')

with open(path_app, 'w', encoding='utf-8') as f:
    f.write(html)
print('Wrote MacroBatch_App_Complete.html with Grand Public Profiles:', os.path.getsize(path_app))

with open(path_widget, 'w', encoding='utf-8') as f:
    f.write(html)
print('Wrote MacroBatch_Inline_Widget.html with Grand Public Profiles:', os.path.getsize(path_widget))
