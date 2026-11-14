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
    except Exception:
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
        except Exception:
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

batch_steps = [
  {"step": 1, "duration": 10, "title": "Préchauffage du four & Marinade des protéines", "desc": "Allumez le four à 200°C chaleur tournante avec 2 grandes plaques à l'intérieur. Massez vos protéines avec jus de citron, ail, origan et huile d'olive."},
  {"step": 2, "duration": 12, "title": "Découpe des légumes racines & Enfournement", "desc": "Taillez patates douces, carottes et oignons rouges en cubes de 2 cm. Enfournez sur 2 niveaux pour 15 min."},
  {"step": 3, "duration": 12, "title": "Lancement du Féculent & du Mijoté", "desc": "Activez 2 feux : les céréales (Riz/Quinoa) et le Dal corail mijotent en autonomie complète."},
  {"step": 4, "duration": 10, "title": "Ajout des Brocolis & Cuisson des Œufs Mollets", "desc": "Ajoutez les brocolis au four et plongez les œufs 6 min 30 chrono puis refroidissez à l'eau glacée."},
  {"step": 5, "duration": 12, "title": "Sortie du four & Saisie à la poêle", "desc": "Sortez les plaques du four, égrenez les féculents et saisissez le tofu ou les steaks à feu vif."},
  {"step": 6, "duration": 10, "title": "Assemblage à froid des 3 Sauces Maison", "desc": "Réalisez Tzatziki, Satay et Chimichurri directement dans leurs bocaux étanches."},
  {"step": 7, "duration": 8, "title": "Portionnage & Mise en boîtes hermétiques", "desc": "Répartissez vos 5 plats du Lundi au Vendredi et gardez les sauces à part."},
  {"step": 8, "duration": 6, "title": "Refroidissement & Rangement au frais", "desc": "Laissez tiédir avant de fermer les couvercles et rangez au réfrigérateur."}
]

html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>MacroBatch — Aperçu Mobile</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;
      background: transparent;
      color: #0F172A;
      display: flex;
      justify-content: center;
      padding: 8px;
      -webkit-font-smoothing: antialiased;
    }}
    .phone {{
      width: 393px;
      max-width: 100%;
      height: 760px;
      background: #0B0F17;
      border-radius: 48px;
      padding: 10px;
      box-shadow: 0 24px 60px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      position: relative;
    }}
    .screen {{
      flex: 1;
      background: #F8F9FA;
      border-radius: 38px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }}
    .status-bar {{
      height: 36px;
      padding: 0 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      background: rgba(248, 249, 250, 0.92);
      position: relative;
      flex-shrink: 0;
    }}
    .island {{
      position: absolute;
      top: 7px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 22px;
      background: #000;
      border-radius: 99px;
    }}
    .app-header {{
      padding: 8px 16px 10px 16px;
      background: rgba(248, 249, 250, 0.95);
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }}
    .brand-title {{ font-size: 17px; font-weight: 800; letter-spacing: -0.3px; }}
    .brand-sub {{ font-size: 11px; color: #64748B; font-weight: 500; margin-top: 1px; }}
    .header-actions {{ display: flex; align-items: center; gap: 8px; }}
    .p-switch {{
      display: flex;
      background: #E2E8F0;
      padding: 2px;
      border-radius: 99px;
    }}
    .p-btn {{
      border: none;
      background: transparent;
      padding: 4px 9px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      cursor: pointer;
    }}
    .p-btn.active {{ background: #FFF; color: #0F172A; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }}
    .icon-btn {{
      width: 34px;
      height: 34px;
      border-radius: 99px;
      background: #FFF;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #334155;
      cursor: pointer;
    }}
    .scroll-area {{
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px 20px 14px;
      -webkit-overflow-scrolling: touch;
    }}
    .scroll-area::-webkit-scrollbar {{ display: none; }}
    .search-wrap {{
      position: relative;
      margin-bottom: 10px;
    }}
    .search-input {{
      width: 100%;
      padding: 9px 12px 9px 34px;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      background: #FFF;
      font-size: 13px;
      color: #0F172A;
      outline: none;
    }}
    .search-icon {{
      position: absolute;
      left: 11px;
      top: 50%;
      transform: translateY(-50%);
      color: #94A3B8;
      pointer-events: none;
    }}
    .chips {{
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 10px;
    }}
    .chips::-webkit-scrollbar {{ display: none; }}
    .chip {{
      padding: 6px 12px;
      border-radius: 99px;
      border: 1px solid #E2E8F0;
      background: #FFF;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      white-space: nowrap;
      cursor: pointer;
    }}
    .chip.active {{ background: #0F172A; color: #FFF; border-color: #0F172A; }}
    .card {{
      background: #FFF;
      border-radius: 20px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      margin-bottom: 12px;
      cursor: pointer;
    }}
    .card-img-wrap {{
      position: relative;
      aspect-ratio: 16 / 10;
      background: #F1F5F9;
    }}
    .card-img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
    .badge-time {{
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255,255,255,0.94);
      color: #0F172A;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 99px;
    }}
    .badge-added {{
      position: absolute;
      top: 10px;
      right: 10px;
      background: #059669;
      color: #FFF;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 99px;
    }}
    .card-body {{ padding: 12px 14px; }}
    .card-cat {{ font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #94A3B8; }}
    .card-title {{ font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 2px; line-height: 1.3; }}
    .card-footer {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
    }}
    .tags {{ display: flex; gap: 6px; }}
    .tag-prot {{
      background: #FFF1EE;
      color: #FF5A36;
      font-size: 11.5px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 8px;
    }}
    .tag-price {{
      background: #F1F5F9;
      color: #334155;
      font-size: 11.5px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 8px;
    }}
    .btn-add {{
      background: #0F172A;
      color: #FFF;
      border: none;
      padding: 7px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }}
    .btn-add.secondary {{ background: #F1F5F9; color: #334155; }}
    .btn-add.coral {{ background: #FF5A36; color: #FFF; }}
    .bottom-nav {{
      height: 62px;
      background: rgba(255,255,255,0.96);
      border-top: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-bottom: 4px;
      flex-shrink: 0;
    }}
    .nav-btn {{
      border: none;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      color: #94A3B8;
      font-size: 10.5px;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 10px;
    }}
    .nav-btn.active {{ color: #FF5A36; }}
    .summary-card {{
      background: #0F172A;
      color: #FFF;
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 12px;
    }}
    .summary-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.12);
      text-align: center;
    }}
    .day-row {{
      background: #FFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      cursor: pointer;
    }}
    .day-thumb {{ width: 56px; height: 56px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }}
    .aisle-card {{
      background: #FFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 10px;
    }}
    .aisle-head {{
      padding: 8px 12px;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      display: flex;
      justify-content: space-between;
    }}
    .g-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid #F1F5F9;
      font-size: 13px;
      cursor: pointer;
    }}
    .g-row:last-child {{ border-bottom: none; }}
    .chk-box {{
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 1.5px solid #CBD5E1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      flex-shrink: 0;
    }}
    .chk-box.checked {{ background: #059669; border-color: #059669; color: #FFF; }}
    .seg-ctrl {{
      background: #E2E8F0;
      padding: 3px;
      border-radius: 14px;
      display: flex;
      margin-bottom: 12px;
    }}
    .seg-btn {{
      flex: 1;
      border: none;
      background: transparent;
      padding: 7px;
      border-radius: 11px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
    }}
    .seg-btn.active {{ background: #FFF; color: #0F172A; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }}
    .modal-overlay {{
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      z-index: 40;
      display: none;
      align-items: flex-end;
    }}
    .modal-overlay.open {{ display: flex; }}
    .sheet {{
      background: #FFF;
      width: 100%;
      max-height: 85%;
      border-radius: 24px 24px 0 0;
      padding: 16px;
      overflow-y: auto;
    }}
    .toast {{
      position: absolute;
      top: 46px;
      left: 50%;
      transform: translateX(-50%);
      background: #0F172A;
      color: #FFF;
      font-size: 11.5px;
      font-weight: 600;
      padding: 7px 14px;
      border-radius: 99px;
      z-index: 50;
      display: none;
      white-space: nowrap;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }}
  </style>
</head>
<body>
  <div class="phone">
    <div class="screen">
      <div id="toast" class="toast"></div>

      <div class="status-bar">
        <span>9:41</span>
        <div class="island"></div>
        <span style="font-size:11px; color:#059669;">5G</span>
      </div>

      <header class="app-header">
        <div>
          <div class="brand-title">MacroBatch</div>
          <div class="brand-sub" id="header-sub">20 repas • 72 kg</div>
        </div>
        <div class="header-actions">
          <div class="p-switch">
            <button class="p-btn" onclick="setPeople(1)">1P</button>
            <button class="p-btn active" onclick="setPeople(2)">2P</button>
            <button class="p-btn" onclick="setPeople(4)">4P</button>
          </div>
          <button class="icon-btn" onclick="openSettings()" aria-label="Préférences">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/><line x1="14" x2="14" y1="11" y2="17"/><line x1="8" x2="8" y1="4" y2="10"/><line x1="16" x2="16" y1="18" y2="24"/></svg>
          </button>
        </div>
      </header>

      <div id="main-scroll" class="scroll-area"></div>

      <nav class="bottom-nav">
        <button class="nav-btn active" id="nav-catalog" onclick="setTab('catalog')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/></svg>
          <span>Catalogue</span>
        </button>
        <button class="nav-btn" id="nav-menu" onclick="setTab('menu')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          <span>Semaine</span>
        </button>
        <button class="nav-btn" id="nav-cart" onclick="setTab('cart')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span>Courses</span>
        </button>
        <button class="nav-btn" id="nav-prep" onclick="setTab('prep')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.8a4.41 4.41 0 1 1 5-7.6 4.42 4.42 0 0 1 6 0 4.43 4.43 0 1 1 5 7.6"/><path d="M6 17h12a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2Z"/></svg>
          <span>Préparation</span>
        </button>
      </nav>

      <!-- Hidden Native Camera / Photo Input -->
      <input type="file" id="cam-input" accept="image/*" capture="environment" onchange="handleRealPhoto(this)" style="display:none;" />

      <!-- Detail / Settings Modal Sheet -->
      <div id="modal" class="modal-overlay" onclick="closeModal()">
        <div id="sheet" class="sheet" onclick="event.stopPropagation()"></div>
      </div>
    </div>
  </div>

  <script>
    var RECIPES = {json.dumps(recipes, ensure_ascii=False)};
    var IMGS = {json.dumps(img_map)};
    var STEP_IMGS = {json.dumps(step_thumbs)};
    var BATCH_STEPS = {json.dumps(batch_steps, ensure_ascii=False)};
    var DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    var SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

    var FRIDGE_PRESETS = [
      {{ id: 'poulet', label: 'Filets de poulet', match: ['poulet', 'dinde'] }},
      {{ id: 'oeufs', label: 'Œufs frais', match: ['œuf', 'oeuf'] }},
      {{ id: 'skyr', label: 'Skyr / Yaourt grec', match: ['skyr', 'yaourt', 'fromage blanc'] }},
      {{ id: 'brocoli', label: 'Brocolis', match: ['brocoli'] }},
      {{ id: 'courgette', label: 'Courgettes', match: ['courgette'] }},
      {{ id: 'carotte', label: 'Carottes', match: ['carotte'] }},
      {{ id: 'feta', label: 'Feta / Halloumi', match: ['feta', 'halloumi', 'chèvre'] }},
      {{ id: 'tofu', label: 'Tofu ferme', match: ['tofu'] }},
      {{ id: 'citron', label: 'Citrons jaunes / verts', match: ['citron'] }}
    ];

    var PANTRY_PRESETS = [
      {{ id: 'riz', label: 'Riz basmati / thaï', match: ['riz'] }},
      {{ id: 'quinoa', label: 'Quinoa / Boulgour', match: ['quinoa', 'boulgour', 'semoule', 'blé'] }},
      {{ id: 'lentilles', label: 'Lentilles corail', match: ['lentille'] }},
      {{ id: 'pois_chiches', label: 'Pois chiches', match: ['pois chiche', 'haricot'] }},
      {{ id: 'patate_douce', label: 'Patates douces', match: ['patate douce', 'pomme de terre'] }},
      {{ id: 'lait_coco', label: 'Lait de coco', match: ['coco'] }},
      {{ id: 'cacahuete', label: 'Beurre de cacahuète', match: ['cacahuète', 'sésame', 'tahin'] }},
      {{ id: 'tomate', label: 'Tomates concassées', match: ['tomate', 'passata'] }},
      {{ id: 'oignon', label: 'Oignons & Ail', match: ['oignon', 'ail', 'échalote'] }}
    ];

    var ALL_PRESETS = FRIDGE_PRESETS.concat(PANTRY_PRESETS);

    var state = {{
      tab: 'catalog',
      prepMode: 'batch',
      people: 2,
      weight: 72,
      protProfile: 130,
      diet: 'omni',
      budget: 'std',
      search: '',
      cat: 'all',
      slots: ['d_greek', 'd_dal', 'd_tofu_satay', 'd_chimi', 'd_tiger'],
      swapIdx: null,
      checked: {{}},
      deductPantry: true,
      doneSteps: {{}},
      inStockIds: [],
      tempStockIds: [],
      customTerms: [],
      tempCustomTerms: [],
      scanZone: 'fridge',
      scanPhotoUrl: null,
      visionSummary: null,
      visionMode: null,
      visionApiKey: '',
      showKeyBox: false,
      analyzing: false
    }};

    function getStockMatches(r, stockIds, cTerms) {{
      var ids = stockIds || state.inStockIds;
      var terms = cTerms || state.customTerms;
      if ((!ids || !ids.length) && (!terms || !terms.length)) return [];
      var active = ALL_PRESETS.filter(function(p) {{ return ids.indexOf(p.id) !== -1; }});
      var matched = [];
      r.ingredients.forEach(function(ing) {{
        if (ing.isPantry) return;
        var low = ing.name.toLowerCase();
        var hit = active.find(function(p) {{
          return p.match.some(function(kw) {{ return low.indexOf(kw) !== -1; }});
        }});
        if (hit && matched.indexOf(hit.label) === -1) matched.push(hit.label);
        terms.forEach(function(t) {{
          var cl = t.trim().toLowerCase();
          if (cl.length >= 2 && (low.indexOf(cl) !== -1 || cl.indexOf(low) !== -1)) {{
            if (matched.indexOf(t) === -1) matched.push(t);
          }}
        }});
      }});
      return matched;
    }}

    function isIngInStock(ingName) {{
      var low = ingName.toLowerCase();
      var hitPreset = ALL_PRESETS.filter(function(p) {{ return state.inStockIds.indexOf(p.id) !== -1; }}).some(function(p) {{
        return p.match.some(function(kw) {{ return low.indexOf(kw) !== -1; }});
      }});
      if (hitPreset) return true;
      return state.customTerms.some(function(t) {{
        var cl = t.trim().toLowerCase();
        return cl.length >= 2 && (low.indexOf(cl) !== -1 || cl.indexOf(low) !== -1);
      }});
    }}

    function toast(msg) {{
      var el = document.getElementById('toast');
      el.textContent = msg;
      el.style.display = 'block';
      clearTimeout(window._t);
      window._t = setTimeout(function() {{ el.style.display = 'none'; }}, 2400);
    }}

    function getProt(r) {{
      return Math.round(((r.prot && r.prot[state.protProfile]) || 60) * (state.weight / 72));
    }}

    function fmtQty(qty, unit) {{
      var q = Math.round(qty);
      if (unit === 'g' && q >= 1000) return (q / 1000).toFixed(1).replace('.', ',') + ' kg';
      if (unit === 'ml' && q >= 1000) return (q / 1000).toFixed(1).replace('.', ',') + ' L';
      return q + ' ' + unit;
    }}

    function setPeople(p) {{
      state.people = p;
      document.querySelectorAll('.p-btn').forEach(function(b, i) {{
        b.classList.toggle('active', [1,2,4][i] === p);
      }});
      document.getElementById('header-sub').textContent = (p * 10) + ' repas • ' + state.weight + ' kg';
      toast('Portions : ' + p + (p > 1 ? ' personnes' : ' personne'));
      render();
    }}

    function setTab(t) {{
      state.tab = t;
      ['catalog', 'menu', 'cart', 'prep'].forEach(function(k) {{
        document.getElementById('nav-' + k).classList.toggle('active', k === t);
      }});
      document.getElementById('main-scroll').scrollTop = 0;
      render();
    }}

    function assignDay(dayIdx, id) {{
      state.slots[dayIdx] = id;
      state.swapIdx = null;
      var r = RECIPES.find(function(x) {{ return x.id === id; }});
      toast((r ? r.shortName : 'Plat') + ' programmé pour ' + DAYS[dayIdx]);
      closeModal();
      render();
    }}

    function closeModal() {{
      document.getElementById('modal').classList.remove('open');
    }}

    function openScanner(zone) {{
      if (zone) state.scanZone = zone;
      if (!document.getElementById('modal').classList.contains('open')) {{
        state.tempStockIds = state.inStockIds.slice();
        state.tempCustomTerms = state.customTerms.slice();
      }}
      var presets = state.scanZone === 'fridge' ? FRIDGE_PRESETS : PANTRY_PRESETS;
      var totalCnt = state.tempStockIds.length + state.tempCustomTerms.length;

      var html = '<div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:1px solid #F1F5F9; margin-bottom:10px;">' +
        '<div><div style="font-size:10px; font-weight:800; color:#059669; text-transform:uppercase;">Analyse Vision IA • Zéro gaspillage</div>' +
        '<strong style="font-size:15px;">Scanner Frigo & Placard</strong></div>' +
        '<div style="display:flex; gap:6px; align-items:center;">' +
        '<button onclick="state.showKeyBox=!state.showKeyBox; openScanner();" style="padding:4px 9px; border-radius:99px; border:none; background:#F1F5F9; font-size:10.5px; font-weight:700; color:#475569; cursor:pointer;">' + (state.visionApiKey ? 'Clé IA active' : 'Clé API') + '</button>' +
        '<button onclick="closeModal()" style="width:28px; height:28px; border-radius:99px; border:none; background:#F1F5F9; font-weight:700; cursor:pointer;">✕</button></div></div>';

      if (state.showKeyBox) {{
        html += '<div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:9px; margin-bottom:10px;">' +
          '<div style="font-size:10.5px; font-weight:700; color:#334155; margin-bottom:5px;">Clé API Vision (Gemini AI Studio ou OpenAI sk-...) — Optionnel</div>' +
          '<input type="password" value="' + state.visionApiKey + '" oninput="state.visionApiKey=this.value" placeholder="Collez votre clé Gemini ou OpenAI..." style="width:100%; padding:7px 9px; border-radius:8px; border:1px solid #CBD5E1; font-size:11.5px; margin-bottom:4px;"/>' +
          '<div style="font-size:10px; color:#64748B;">Sans clé, l\\'analyse visuelle colorimétrique locale fonctionne directement.</div></div>';
      }}

      html += '<div class="seg-ctrl" style="margin-bottom:10px;">' +
        '<button class="seg-btn ' + (state.scanZone === 'fridge' ? 'active' : '') + '" onclick="openScanner(\\'fridge\\')">Frigo (Frais & Légumes)</button>' +
        '<button class="seg-btn ' + (state.scanZone === 'pantry' ? 'active' : '') + '" onclick="openScanner(\\'pantry\\')">Placard (Sec & Épicerie)</button></div>';

      if (state.scanPhotoUrl) {{
        html += '<div style="position:relative; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#0F172A; margin-bottom:10px;">' +
          '<img src="' + state.scanPhotoUrl + '" style="width:100%; height:100%; object-fit:cover;"/>' +
          '<span style="position:absolute; top:8px; left:8px; background:rgba(15,23,42,0.85); color:#FFF; font-size:10px; font-weight:700; padding:3px 8px; border-radius:99px;">' + (state.visionMode || 'Vision IA') + '</span>' +
          '<button onclick="document.getElementById(\\'cam-input\\').click()" style="position:absolute; bottom:8px; right:8px; background:rgba(255,255,255,0.95); color:#0F172A; border:none; padding:5px 10px; border-radius:99px; font-size:11px; font-weight:700; cursor:pointer;">Reprendre photo</button></div>';
      }} else {{
        html += '<div style="background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:14px; padding:11px; margin-bottom:10px; text-align:center;">' +
          '<div style="font-size:11.5px; font-weight:600; color:#475569; margin-bottom:8px;">Prenez en photo votre ' + (state.scanZone === 'fridge' ? 'frigo' : 'placard') + ' ou dictez vos restes à voix haute (« poulet, courgettes, skyr, riz... ») :</div>' +
          '<div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">' +
          '<button onclick="document.getElementById(\\'cam-input\\').click()" style="background:#0F172A; color:#FFF; border:none; padding:8px 11px; border-radius:10px; font-size:11.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF5A36" stroke-width="2.3"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>Photo IA</button>' +
          '<button onclick="toggleVoiceDictation()" style="background:' + (state.listeningVoice ? '#FF5A36' : '#FFF') + '; color:' + (state.listeningVoice ? '#FFF' : '#0F172A') + '; border:1px solid ' + (state.listeningVoice ? '#FF5A36' : '#CBD5E1') + '; padding:8px 11px; border-radius:10px; font-size:11.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>' + (state.listeningVoice ? 'Arrêter' : 'Dicter au micro') + '</button>' +
          '<button onclick="simulatePhotoScan()" style="background:#FFF; color:#475569; border:1px solid #E2E8F0; padding:8px 10px; border-radius:10px; font-size:11.5px; font-weight:700; cursor:pointer;">Exemple</button></div></div>';
      }}

      if (state.listeningVoice) {{
        html += '<div style="background:#FFF1EE; border:1px solid #FECDD3; color:#FF5A36; border-radius:12px; padding:9px; text-align:center; font-size:11.5px; font-weight:700; margin-bottom:10px;">Écoute vocale active — énoncez vos ingrédients...' +
          (state.voiceTranscript ? '<div style="font-size:11px; color:#334155; font-style:italic; margin-top:4px;">« ' + state.voiceTranscript + ' »</div>' : '') + '</div>';
      }} else if (state.analyzing) {{
        html += '<div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:9px; text-align:center; font-size:11.5px; font-weight:700; margin-bottom:10px;">Analyse Vision IA de la photo en cours...</div>';
      }} else if (state.visionSummary) {{
        html += '<div style="background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; border-radius:12px; padding:8px 10px; font-size:11.5px; font-weight:600; margin-bottom:10px;">' + state.visionSummary + '</div>';
      }}

      // Custom ingredient input
      html += '<div style="display:flex; gap:6px; margin-bottom:8px;">' +
        '<input id="custom-ing-inp" placeholder="Ou tapez une phrase / ingrédient (ex: poulet, saumon...)" onkeydown="if(event.key===\\'Enter\\') addCustomIng()" style="flex:1; padding:7px 10px; border-radius:10px; border:1px solid #E2E8F0; background:#F8FAFC; font-size:11.5px; outline:none;"/>' +
        '<button onclick="addCustomIng()" style="padding:7px 11px; border-radius:10px; border:none; background:#0F172A; color:#FFF; font-size:11.5px; font-weight:700; cursor:pointer;">Ajouter</button></div>';

      if (state.tempCustomTerms.length) {{
        html += '<div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px;">';
        state.tempCustomTerms.forEach(function(t, idx) {{
          html += '<span style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; padding:3px 8px; border-radius:99px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:5px;">' + t +
            '<button onclick="state.tempCustomTerms.splice(' + idx + ',1); openScanner();" style="border:none; background:none; color:#065F46; font-weight:800; cursor:pointer;">✕</button></span>';
        }});
        html += '</div>';
      }}

      html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
        '<span style="font-size:10.5px; font-weight:800; color:#64748B; text-transform:uppercase;">Ingrédients détectés (' + totalCnt + ')</span>' +
        (totalCnt ? '<button onclick="state.tempStockIds=[]; state.tempCustomTerms=[]; state.scanPhotoUrl=null; state.visionSummary=null; openScanner();" style="border:none; background:none; font-size:11px; font-weight:700; color:#64748B; cursor:pointer;">Tout décocher</button>' : '') +
        '</div><div style="display:grid; grid-template-columns:repeat(2,1fr); gap:6px; margin-bottom:12px;">';

      presets.forEach(function(item) {{
        var sel = state.tempStockIds.indexOf(item.id) !== -1;
        html += '<button onclick="toggleTempStock(\\'' + item.id + '\\')" style="display:flex; align-items:center; gap:7px; padding:8px 9px; border-radius:11px; border:1px solid ' + (sel ? '#059669' : '#E2E8F0') + '; background:' + (sel ? '#ECFDF5' : '#FFF') + '; color:' + (sel ? '#065F46' : '#334155') + '; font-size:11.5px; font-weight:700; text-align:left; cursor:pointer;">' +
          '<span style="width:15px; height:15px; border-radius:4px; border:1.5px solid ' + (sel ? '#059669' : '#CBD5E1') + '; background:' + (sel ? '#059669' : '#FFF') + '; color:#FFF; display:inline-flex; align-items:center; justify-content:center; font-size:10px; flex-shrink:0;">' + (sel ? '✓' : '') + '</span>' +
          '<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + item.label + '</span></button>';
      }});

      html += '</div><div style="display:flex; flex-direction:column; gap:7px;">' +
        '<button onclick="applyStock(false)" style="width:100%; padding:11px; border-radius:12px; border:none; background:#0F172A; color:#FFF; font-size:12.5px; font-weight:700; cursor:pointer;">Trier le catalogue & déduire des courses (' + totalCnt + ')</button>' +
        (totalCnt ? '<button onclick="applyStock(true)" style="width:100%; padding:10px; border-radius:12px; border:1px solid #A7F3D0; background:#ECFDF5; color:#065F46; font-size:12px; font-weight:700; cursor:pointer;">Composer automatiquement mes 5 plats avec ce stock</button>' : '') +
        '</div>';

      document.getElementById('sheet').innerHTML = html;
      document.getElementById('modal').classList.add('open');
    }}

    function parseNaturalSentence(rawText) {{
      var low = (rawText || '').toLowerCase();
      var foundIds = [];
      var foundLabels = [];
      ALL_PRESETS.forEach(function(p) {{
        if (p.match.some(function(kw) {{ return low.indexOf(kw) !== -1; }})) {{
          foundIds.push(p.id);
          foundLabels.push(p.label);
        }}
      }});
      var extraVocab = ['saumon', 'thon', 'cabillaud', 'crevette', 'boeuf', 'bœuf', 'steak', 'poivron', 'épinard', 'epinard', 'champignon', 'avocat', 'pâtes', 'pates', 'haricots verts', 'mozzarella'];
      var extraFound = [];
      extraVocab.forEach(function(w) {{
        if (low.indexOf(w) !== -1) {{
          var cap = w.charAt(0).toUpperCase() + w.slice(1);
          if (extraFound.indexOf(cap) === -1) extraFound.push(cap);
        }}
      }});
      foundIds.forEach(function(id) {{
        if (state.tempStockIds.indexOf(id) === -1) state.tempStockIds.push(id);
      }});
      extraFound.forEach(function(c) {{
        if (state.tempCustomTerms.indexOf(c) === -1) state.tempCustomTerms.push(c);
      }});
      var tot = foundIds.length + extraFound.length;
      if (tot > 0) {{
        state.visionMode = 'Dictée Vocale';
        state.visionSummary = 'Dictée analysée (' + tot + ') : ' + foundLabels.concat(extraFound).join(', ');
        toast(tot + ' ingrédients détectés par la voix');
      }}
      return tot;
    }}

    function toggleVoiceDictation() {{
      if (state.listeningVoice) {{
        if (window._rec && window._rec.stop) window._rec.stop();
        state.listeningVoice = false;
        openScanner();
        return;
      }}
      var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {{
        var sample = state.scanZone === 'fridge'
          ? 'Il me reste des filets de poulet, du skyr, des œufs, des courgettes et un brocoli'
          : 'J\\'ai du riz basmati, des lentilles corail, du lait de coco et des patates douces';
        state.voiceTranscript = sample;
        parseNaturalSentence(sample);
        openScanner();
        return;
      }}
      try {{
        var rec = new SpeechRec();
        rec.lang = 'fr-FR';
        rec.continuous = false;
        rec.interimResults = true;
        window._rec = rec;
        state.listeningVoice = true;
        state.voiceTranscript = 'Parlez maintenant : « Il me reste du poulet, des courgettes, du riz... »';
        openScanner();
        var latest = '';
        rec.onresult = function(ev) {{
          var t = '';
          for (var i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript + ' ';
          latest = t.trim();
          state.voiceTranscript = latest;
          openScanner();
        }};
        rec.onerror = function() {{
          state.listeningVoice = false;
          var sample = state.scanZone === 'fridge'
            ? 'Il me reste des filets de poulet, du skyr, des œufs et des courgettes'
            : 'J\\'ai du riz basmati, des lentilles corail et du lait de coco';
          state.voiceTranscript = sample;
          parseNaturalSentence(sample);
          openScanner();
        }};
        rec.onend = function() {{
          state.listeningVoice = false;
          if (latest) parseNaturalSentence(latest);
          openScanner();
        }};
        rec.start();
      }} catch (e) {{
        state.listeningVoice = false;
        openScanner();
      }}
    }}

    function addCustomIng() {{
      var inp = document.getElementById('custom-ing-inp');
      if (!inp) return;
      var v = inp.value.trim();
      if (v) {{
        var cnt = parseNaturalSentence(v);
        if (cnt === 0 && state.tempCustomTerms.indexOf(v) === -1) {{
          state.tempCustomTerms.push(v);
        }}
      }}
      openScanner();
    }}

    function toggleTempStock(id) {{
      var idx = state.tempStockIds.indexOf(id);
      if (idx === -1) state.tempStockIds.push(id);
      else state.tempStockIds.splice(idx, 1);
      openScanner();
    }}

    function handleRealPhoto(input) {{
      var file = input.files && input.files[0];
      if (!file) return;
      state.analyzing = true;
      state.visionSummary = null;
      openScanner();

      var reader = new FileReader();
      reader.onload = function() {{
        var img = new Image();
        img.onload = function() {{
          var maxD = 800, w = img.width, h = img.height;
          if (w > maxD || h > maxD) {{
            if (w > h) {{ h = Math.round(h * maxD / w); w = maxD; }}
            else {{ w = Math.round(w * maxD / h); h = maxD; }}
          }}
          var cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          var ctx = cv.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = cv.toDataURL('image/jpeg', 0.76);
          state.scanPhotoUrl = dataUrl;

          var gCnt = 0, wCnt = 0, bCnt = 0, eCnt = 0, tot = 0;
          try {{
            var d = ctx.getImageData(0, 0, w, h).data;
            for (var i = 0; i < d.length; i += 64) {{
              var r = d[i], g = d[i+1], b = d[i+2];
              tot++;
              if (g > r * 1.12 && g > b * 1.12 && g > 55) gCnt++;
              if (r > g * 1.18 && r > b * 1.3 && r > 90) wCnt++;
              if (r > 195 && g > 195 && b > 185) bCnt++;
              if (r > 95 && g > 70 && b < 90 && Math.abs(r - g) < 55) eCnt++;
            }}
          }} catch(e) {{}}

          var key = (state.visionApiKey || '').trim();
          var rawB64 = dataUrl.replace(/^data:image\\/[a-zA-Z0-9+.-]+;base64,/, '');

          if (key && key.indexOf('sk-') !== 0) {{
            // Direct Gemini Vision call
            var prompt = 'Analyse cette photo de ' + (state.scanZone === 'fridge' ? 'frigo' : 'placard') + ' et renvoie uniquement un JSON {{"detectedPresetIds":["poulet","skyr"],"customIngredients":[],"summary":"..."}} parmi: ' + ALL_PRESETS.map(function(p){{return p.id;}}).join(', ');
            fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key), {{
              method: 'POST',
              headers: {{'Content-Type': 'application/json'}},
              body: JSON.stringify({{
                contents: [{{ parts: [{{ text: prompt }}, {{ inline_data: {{ mime_type: 'image/jpeg', data: rawB64 }} }}] }}],
                generationConfig: {{ response_mime_type: 'application/json' }}
              }})
            }}).then(function(r){{ return r.json(); }}).then(function(res){{
              var txt = res && res.candidates && res.candidates[0] && res.candidates[0].content && res.candidates[0].content.parts[0].text;
              var parsed = JSON.parse(txt);
              (parsed.detectedPresetIds || []).forEach(function(id){{ if (state.tempStockIds.indexOf(id)===-1) state.tempStockIds.push(id); }});
              (parsed.customIngredients || []).forEach(function(c){{ if (state.tempCustomTerms.indexOf(c)===-1) state.tempCustomTerms.push(c); }});
              state.visionMode = 'Gemini Vision';
              state.visionSummary = parsed.summary || 'Analyse Gemini Vision terminée.';
              state.analyzing = false;
              openScanner();
            }}).catch(function(){{
              applyLocalColorAnalysis(gCnt/Math.max(1,tot), wCnt/Math.max(1,tot), bCnt/Math.max(1,tot), eCnt/Math.max(1,tot));
            }});
          }} else {{
            applyLocalColorAnalysis(gCnt/Math.max(1,tot), wCnt/Math.max(1,tot), bCnt/Math.max(1,tot), eCnt/Math.max(1,tot));
          }}
        }};
        img.src = reader.result;
      }};
      reader.readAsDataURL(file);
      input.value = '';
    }}

    function applyLocalColorAnalysis(gr, wr, br, er) {{
      var found = [];
      if (state.scanZone === 'fridge') {{
        if (br > 0.1) found.push('skyr', 'oeufs');
        if (gr > 0.06) found.push('brocoli', 'courgette');
        else found.push('courgette');
        if (wr > 0.1) found.push('poulet', 'carotte');
        else found.push('poulet');
      }} else {{
        found.push('riz', 'lentilles', 'patate_douce');
        if (br > 0.12) found.push('lait_coco');
        if (er > 0.12) found.push('oignon', 'pois_chiches');
      }}
      found.forEach(function(id) {{
        if (state.tempStockIds.indexOf(id) === -1) state.tempStockIds.push(id);
      }});
      state.visionMode = 'Vision Locale';
      state.visionSummary = 'Photo analysée (' + found.length + ' ingrédients détectés sur vos étagères).';
      state.analyzing = false;
      toast('Photo analysée avec succès');
      openScanner();
    }}

    function simulatePhotoScan() {{
      var defaults = state.scanZone === 'fridge'
        ? ['poulet', 'oeufs', 'skyr', 'brocoli', 'courgette']
        : ['riz', 'lentilles', 'patate_douce', 'lait_coco', 'oignon'];
      defaults.forEach(function(id) {{
        if (state.tempStockIds.indexOf(id) === -1) state.tempStockIds.push(id);
      }});
      state.visionMode = 'Photo Test';
      state.visionSummary = state.scanZone === 'fridge'
        ? 'Détecté au frigo : Filets de poulet, Œufs frais, Skyr, Brocolis, Courgettes.'
        : 'Détecté au placard : Riz basmati, Lentilles corail, Patates douces, Lait de coco, Oignons.';
      toast('Photo analysée : ' + defaults.length + ' ingrédients détectés');
      openScanner();
    }}

    function applyStock(autoFill) {{
      state.inStockIds = state.tempStockIds.slice();
      state.customTerms = state.tempCustomTerms.slice();
      var total = state.inStockIds.length + state.customTerms.length;
      if (total === 0 && state.cat === 'stock') state.cat = 'all';

      if (autoFill && total > 0) {{
        var compat = RECIPES.filter(function(r) {{
          if (state.diet === 'vege' && r.diet !== 'vege' && r.diet !== 'both') return false;
          if (state.diet === 'pesco' && r.diet === 'omni') return false;
          return true;
        }});
        compat.sort(function(a, b) {{
          return getStockMatches(b, state.inStockIds, state.customTerms).length - getStockMatches(a, state.inStockIds, state.customTerms).length;
        }});
        var top5 = compat.slice(0, 5).map(function(r) {{ return r.id; }});
        if (top5.length === 5) state.slots = top5;
        closeModal();
        toast('5 plats composés avec votre stock frigo & placard');
        render();
        return;
      }}

      closeModal();
      toast(total > 0
        ? total + ' ingrédients en stock : catalogue trié & courses déduites'
        : 'Stock réinitialisé');
      render();
    }}

    function openRecipe(id) {{
      var r = RECIPES.find(function(x) {{ return x.id === id; }});
      if (!r) return;
      var html = '<div style="position:relative; aspect-ratio:16/10; border-radius:16px; overflow:hidden; margin-bottom:12px;">' +
        '<img src="' + (IMGS[r.imgKey] || '') + '" style="width:100%; height:100%; object-fit:cover;"/>' +
        '<button onclick="closeModal()" style="position:absolute; top:10px; right:10px; width:30px; height:30px; border-radius:99px; border:none; background:rgba(255,255,255,0.92); font-weight:700; cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="font-size:11px; font-weight:700; color:#94A3B8; text-transform:uppercase;">' + r.categoryLabel + ' • ' + r.prepTime + '</div>' +
        '<h3 style="font-size:17px; font-weight:800; margin:3px 0 6px 0;">' + r.name + '</h3>' +
        '<p style="font-size:12px; color:#475569; line-height:1.45; margin-bottom:12px;">' + r.desc + '</p>' +
        '<div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px; padding:10px; margin-bottom:12px;">' +
        '<div style="font-size:11.5px; font-weight:700; color:#475569; margin-bottom:6px;">Programmer pour un jour :</div>' +
        '<div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px;">';
      SHORT.forEach(function(d, idx) {{
        var cur = state.slots[idx] === r.id;
        html += '<button onclick="assignDay(' + idx + ', \\'' + r.id + '\\')" style="padding:8px 0; border-radius:10px; font-size:12px; font-weight:700; border:1px solid ' + (cur ? '#059669' : '#E2E8F0') + '; background:' + (cur ? '#059669' : '#FFF') + '; color:' + (cur ? '#FFF' : '#334155') + '; cursor:pointer;">' + d + '</button>';
      }});
      html += '</div></div>' +
        '<div style="font-size:11px; font-weight:800; color:#64748B; text-transform:uppercase; margin-bottom:6px;">Ingrédients (' + (state.people * 2) + ' portions)</div>' +
        '<div style="border:1px solid #F1F5F9; border-radius:14px; padding:0 10px;">';
      r.ingredients.forEach(function(ing) {{
        var inSt = !ing.isPantry && isIngInStock(ing.name);
        html += '<div style="display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #F8FAFC; font-size:12px;">' +
          '<span>' + ing.name + (inSt ? ' <strong style="color:#059669; font-size:10.5px;">(En stock)</strong>' : '') + '</span><strong>' + fmtQty(ing.qty * state.people * 2, ing.unit) + '</strong></div>';
      }});
      html += '</div>';
      document.getElementById('sheet').innerHTML = html;
      document.getElementById('modal').classList.add('open');
    }}

    function openSettings() {{
      var mult = state.protProfile === 110 ? 1.5 : state.protProfile === 160 ? 2.2 : 1.8;
      var target = Math.round(state.weight * mult);
      var html = '<div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:1px solid #F1F5F9; margin-bottom:12px;">' +
        '<div><strong style="font-size:16px;">Préférences</strong><div style="font-size:12px; color:#64748B;">Cible : ' + target + 'g prot/jour</div></div>' +
        '<button onclick="closeModal()" style="width:30px; height:30px; border-radius:99px; border:none; background:#F1F5F9; font-weight:700; cursor:pointer;">✕</button></div>' +
        '<div style="font-size:12px; font-weight:700; margin-bottom:6px;">Profil d\\'activité</div>' +
        '<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:12px;">';
      [{{id:110, n:'Actif', m:'1.5g/kg'}}, {{id:130, n:'Sportif', m:'1.8g/kg'}}, {{id:160, n:'Athlète', m:'2.2g/kg'}}].forEach(function(p) {{
        var act = state.protProfile === p.id;
        html += '<button onclick="state.protProfile=' + p.id + '; openSettings(); render();" style="padding:10px 8px; border-radius:12px; text-align:left; border:1px solid ' + (act ? '#0F172A' : '#E2E8F0') + '; background:' + (act ? '#0F172A' : '#F8FAFC') + '; color:' + (act ? '#FFF' : '#334155') + '; cursor:pointer;">' +
          '<strong style="display:block; font-size:12px;">' + p.n + '</strong><span style="font-size:11px; opacity:0.8;">' + p.m + '</span></button>';
      }});
      html += '</div>' +
        '<div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px; padding:10px; margin-bottom:12px;">' +
        '<div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:8px;"><span>Poids de corps</span><span>' + state.weight + ' kg</span></div>' +
        '<input type="range" min="45" max="120" value="' + state.weight + '" oninput="state.weight=Number(this.value); document.getElementById(\\'header-sub\\').textContent=(state.people*10)+\\' repas • \\'+state.weight+\\' kg\\'; openSettings(); render();" style="width:100%; accent-color:#FF5A36;"/></div>' +
        '<div style="font-size:12px; font-weight:700; margin-bottom:6px;">Régime alimentaire</div>' +
        '<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:14px;">';
      [{{id:'omni', n:'Omnivore'}}, {{id:'vege', n:'Végétarien'}}, {{id:'pesco', n:'Pescatarien'}}].forEach(function(d) {{
        var act = state.diet === d.id;
        html += '<button onclick="state.diet=\\'' + d.id + '\\'; state.cat=\\'all\\'; openSettings(); render();" style="padding:8px; border-radius:10px; font-size:11.5px; font-weight:700; border:1px solid ' + (act ? '#0F172A' : '#E2E8F0') + '; background:' + (act ? '#0F172A' : '#F8FAFC') + '; color:' + (act ? '#FFF' : '#334155') + '; cursor:pointer;">' + d.n + '</button>';
      }});
      html += '</div>' +
        '<div style="font-size:12px; font-weight:700; margin-bottom:6px;">Budget par portion</div>' +
        '<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:14px;">';
      [{{id:'eco', n:'Malin', s:'< 2,50€'}}, {{id:'std', n:'Équilibré', s:'~2,85€'}}, {{id:'gourmet', n:'Gourmet', s:'~3,40€'}}].forEach(function(b) {{
        var act = state.budget === b.id;
        html += '<button onclick="state.budget=\\'' + b.id + '\\'; openSettings(); render();" style="padding:8px 6px; border-radius:10px; text-align:center; border:1px solid ' + (act ? '#059669' : '#E2E8F0') + '; background:' + (act ? '#059669' : '#F8FAFC') + '; color:' + (act ? '#FFF' : '#334155') + '; cursor:pointer;">' +
          '<strong style="display:block; font-size:11.5px;">' + b.n + '</strong><span style="font-size:10.5px; opacity:0.85;">' + b.s + '</span></button>';
      }});
      html += '</div><button onclick="closeModal()" style="width:100%; padding:11px; border-radius:14px; border:none; background:#0F172A; color:#FFF; font-size:13px; font-weight:700; cursor:pointer;">Appliquer</button>';
      document.getElementById('sheet').innerHTML = html;
      document.getElementById('modal').classList.add('open');
    }}

    function render() {{
      var container = document.getElementById('main-scroll');
      var activeDishes = state.slots.map(function(id) {{ return RECIPES.find(function(r) {{ return r.id === id; }}); }}).filter(Boolean);
      var totalStock = state.inStockIds.length + state.customTerms.length;

      if (state.tab === 'catalog') {{
        var html = '';
        if (state.swapIdx !== null) {{
          html += '<div style="background:#0F172A; color:#FFF; border-radius:14px; padding:10px 12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">' +
            '<div style="font-size:12px;">Remplacement : <strong>' + DAYS[state.swapIdx] + '</strong></div>' +
            '<button onclick="state.swapIdx=null; render();" style="background:rgba(255,255,255,0.18); color:#FFF; border:none; padding:5px 10px; border-radius:99px; font-size:11px; font-weight:700; cursor:pointer;">Annuler</button></div>';
        }}

        // Scanner Frigo & Placard bar right at the top of the Catalogue
        var hasStock = totalStock > 0;
        html += '<div style="background:' + (hasStock ? '#ECFDF5' : '#FFF') + '; border:1px solid ' + (hasStock ? '#A7F3D0' : '#E2E8F0') + '; border-radius:16px; padding:10px 12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
          '<div style="min-width:0;"><div style="font-size:12.5px; font-weight:800; color:' + (hasStock ? '#065F46' : '#0F172A') + ';">' +
          (hasStock ? totalStock + ' ingrédient' + (totalStock > 1 ? 's' : '') + ' en stock (Frigo & Placard)' : 'Cuisiner avec votre frigo & placard') +
          '</div><div style="font-size:11px; color:' + (hasStock ? '#047857' : '#64748B') + '; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' +
          (hasStock ? 'Plats triés par anti-gaspi • Déduit des courses' : 'Photo Vision IA pour prioriser les plats') +
          '</div></div>' +
          '<button onclick="openScanner()" style="background:' + (hasStock ? '#059669' : '#0F172A') + '; color:#FFF; border:none; padding:7px 11px; border-radius:10px; font-size:11.5px; font-weight:700; cursor:pointer; flex-shrink:0; display:flex; align-items:center; gap:5px;">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>' +
          (hasStock ? 'Modifier' : 'Scanner') + '</button></div>';

        html += '<div class="search-wrap"><svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<input class="search-input" placeholder="Rechercher un plat, ingrédient..." value="' + state.search + '" oninput="state.search=this.value; render();"/></div>';

        var cats = [{{id:'all', l:'Tout'}}];
        if (hasStock) cats.push({{id:'stock', l:'Avec mon stock'}});
        if (state.diet === 'omni') cats.push({{id:'volaille', l:'Volailles'}}, {{id:'boeuf', l:'Bœuf 5%'}});
        if (state.diet !== 'vege') cats.push({{id:'poisson', l:'Poisson'}});
        cats.push({{id:'vege_all', l:'Végétarien'}}, {{id:'eco', l:'Moins de 2,50€'}});

        html += '<div class="chips">';
        cats.forEach(function(c) {{
          html += '<button class="chip ' + (state.cat === c.id ? 'active' : '') + '" onclick="state.cat=\\'' + c.id + '\\'; render();">' + c.l + '</button>';
        }});
        html += '</div>';

        var list = RECIPES.filter(function(r) {{
          if (state.diet === 'vege' && r.diet !== 'vege' && r.diet !== 'both') return false;
          if (state.diet === 'pesco' && r.diet === 'omni') return false;
          if (state.cat === 'stock' && getStockMatches(r).length === 0) return false;
          if (state.cat === 'eco' && !r.isEco && r.cost[state.budget] > 2.5) return false;
          if (state.cat === 'vege_all' && r.diet !== 'vege' && r.diet !== 'both') return false;
          if (state.cat !== 'all' && state.cat !== 'stock' && state.cat !== 'eco' && state.cat !== 'vege_all' && r.category !== state.cat) return false;
          if (state.search.trim()) {{
            var q = state.search.toLowerCase();
            return r.name.toLowerCase().indexOf(q) !== -1 || r.shortName.toLowerCase().indexOf(q) !== -1;
          }}
          return true;
        }});

        if (hasStock) {{
          list.sort(function(a, b) {{
            return getStockMatches(b).length - getStockMatches(a).length;
          }});
        }}

        list.forEach(function(r) {{
          var sIdx = state.slots.indexOf(r.id);
          var isAdded = sIdx !== -1;
          var matches = getStockMatches(r);
          var btnCls = state.swapIdx !== null ? 'coral' : (isAdded ? 'secondary' : '');
          var btnTxt = state.swapIdx !== null ? 'Choisir' : (isAdded ? 'Modifier jour' : '+ Ajouter');
          html += '<div class="card" onclick="openRecipe(\\'' + r.id + '\\')">' +
            '<div class="card-img-wrap"><img class="card-img" src="' + (IMGS[r.imgKey] || '') + '" loading="lazy"/>' +
            '<div class="badge-time">' + r.prepTime + (matches.length ? ' • <span style="color:#059669;">' + matches.length + ' en stock</span>' : '') + '</div>' +
            (isAdded ? '<div class="badge-added">' + SHORT[sIdx] + '</div>' : '') +
            '</div><div class="card-body"><div class="card-cat">' + r.categoryLabel + '</div>' +
            '<div class="card-title">' + r.name + '</div>' +
            (matches.length ? '<div style="font-size:11px; font-weight:600; color:#059669; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Utilise votre stock : ' + matches.join(', ') + '</div>' : '') +
            '<div class="card-footer"><div class="tags"><span class="tag-prot">' + getProt(r) + 'g prot</span>' +
            '<span class="tag-price">' + r.cost[state.budget].toFixed(2).replace('.', ',') + ' €</span></div>' +
            '<button class="btn-add ' + btnCls + '" onclick="event.stopPropagation(); ' + (state.swapIdx !== null ? 'assignDay(state.swapIdx, \\'' + r.id + '\\'); setTab(\\'menu\\');' : 'openRecipe(\\'' + r.id + '\\');') + '">' + btnTxt + '</button>' +
            '</div></div></div>';
        }});
        container.innerHTML = html;
      }}

      else if (state.tab === 'menu') {{
        var avgP = Math.round(activeDishes.reduce(function(a, d) {{ return a + getProt(d); }}, 0) / activeDishes.length);
        var avgC = (activeDishes.reduce(function(a, d) {{ return a + d.cost[state.budget]; }}, 0) / activeDishes.length).toFixed(2).replace('.', ',');
        var html = '<div class="summary-card">' +
          '<div style="font-size:11px; color:#94A3B8;">Synthèse de votre semaine</div>' +
          '<div style="font-size:17px; font-weight:800; margin-top:2px;">' + (state.people * 10) + ' portions programmées</div>' +
          '<div class="summary-grid">' +
          '<div><div style="font-size:10px; color:#94A3B8;">Protéines / j</div><strong style="color:#FF5A36; font-size:15px;">' + (avgP * 2) + 'g</strong></div>' +
          '<div><div style="font-size:10px; color:#94A3B8;">Coût / repas</div><strong style="color:#34D399; font-size:15px;">' + avgC + ' €</strong></div>' +
          '<div><div style="font-size:10px; color:#94A3B8;">Prep batch</div><strong style="font-size:15px;">1h20</strong></div>' +
          '</div></div>';

        activeDishes.forEach(function(d, idx) {{
          html += '<div class="day-row" onclick="openRecipe(\\'' + d.id + '\\')">' +
            '<img class="day-thumb" src="' + (IMGS[d.imgKey] || '') + '"/>' +
            '<div style="flex:1; min-width:0;">' +
            '<div style="font-size:10.5px; font-weight:800; color:#FF5A36; text-transform:uppercase;">' + DAYS[idx] + '</div>' +
            '<div style="font-size:13.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + d.shortName + '</div>' +
            '<div style="font-size:11.5px; color:#64748B;">' + getProt(d) + 'g prot • ' + d.cost[state.budget].toFixed(2).replace('.', ',') + ' €</div></div>' +
            '<button onclick="event.stopPropagation(); state.swapIdx=' + idx + '; setTab(\\'catalog\\');" style="border:none; background:#F1F5F9; padding:7px 10px; border-radius:10px; font-size:11.5px; font-weight:700; color:#334155; cursor:pointer;">Remplacer</button></div>';
        }});
        container.innerHTML = html;
      }}

      else if (state.tab === 'cart') {{
        var map = {{}};
        var order = ['legumes', 'boucherie', 'cremerie', 'epicerie', 'placard'];
        var labels = {{legumes:'Fruits & Légumes', boucherie:'Boucherie & Poissonnerie', cremerie:'Produits Frais & Skyr', epicerie:'Épicerie & Féculents', placard:'Placard'}};
        activeDishes.forEach(function(d) {{
          d.ingredients.forEach(function(ing) {{
            if (state.deductPantry && ing.isPantry) return;
            var k = ing.aisle + '__' + ing.name;
            if (!map[k]) map[k] = {{name:ing.name, qty:0, unit:ing.unit, aisle:ing.aisle}};
            map[k].qty += ing.qty * state.people * 2;
          }});
        }});
        var html = '<div style="background:#FFF; border:1px solid #E2E8F0; border-radius:16px; padding:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
          '<div><strong style="font-size:14px;">Liste de courses</strong><div style="font-size:11.5px; color:#64748B;">Pour ' + state.people + ' pers.' + (totalStock ? ' • ' + totalStock + ' en stock' : '') + '</div></div>' +
          '<div style="display:flex; gap:5px;">' +
          '<button onclick="openScanner()" style="padding:6px 9px; border-radius:99px; font-size:11px; font-weight:700; border:1px solid #0F172A; background:#0F172A; color:#FFF; cursor:pointer;">Scan stock</button>' +
          '<button onclick="state.deductPantry=!state.deductPantry; render();" style="padding:6px 9px; border-radius:99px; font-size:11px; font-weight:700; border:1px solid #CBD5E1; background:' + (state.deductPantry ? '#ECFDF5' : '#F8FAFC') + '; color:' + (state.deductPantry ? '#059669' : '#475569') + '; cursor:pointer;">' + (state.deductPantry ? 'Placard déduit' : 'Tout') + '</button></div></div>';

        order.forEach(function(aisle) {{
          var items = Object.values(map).filter(function(i) {{ return i.aisle === aisle; }});
          if (!items.length) return;
          html += '<div class="aisle-card"><div class="aisle-head"><span>' + labels[aisle] + '</span><span>' + items.length + '</span></div>';
          items.forEach(function(it) {{
            var ckKey = aisle + '-' + it.name;
            var fromStock = isIngInStock(it.name);
            var chk = (state.checked[ckKey] !== undefined) ? !!state.checked[ckKey] : fromStock;
            html += '<div class="g-row" onclick="state.checked[\\'' + ckKey.replace(/'/g, "\\\\'") + '\\']=!' + chk + '; render();">' +
              '<div style="display:flex; align-items:center; min-width:0; padding-right:8px;">' +
              '<span class="chk-box ' + (chk ? 'checked' : '') + '">' + (chk ? '✓' : '') + '</span>' +
              '<div style="min-width:0;"><div style="' + (chk ? 'text-decoration:line-through; color:#94A3B8;' : '') + 'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + it.name + '</div>' +
              (fromStock ? '<div style="font-size:10px; font-weight:700; color:#059669;">Détecté dans votre stock</div>' : '') +
              '</div></div>' +
              '<strong style="font-size:12px; color:#475569; flex-shrink:0;">' + fmtQty(it.qty, it.unit) + '</strong></div>';
          }});
          html += '</div>';
        }});
        container.innerHTML = html;
      }}

      else if (state.tab === 'prep') {{
        var portions = state.people * 2;
        function groupIngs(dishes, aisles) {{
          var m = {{}};
          dishes.forEach(function(d) {{
            d.ingredients.forEach(function(i) {{
              if (aisles.indexOf(i.aisle) !== -1 && !i.isPantry) {{
                if (!m[i.name]) m[i.name] = {{name:i.name, qty:0, unit:i.unit}};
                m[i.name].qty += i.qty * portions;
              }}
            }});
          }});
          return Object.values(m).map(function(x) {{ return x.name + ' (' + fmtQty(x.qty, x.unit) + ')'; }});
        }}

        var ovenD = activeDishes.filter(function(d) {{ return d.cookMethod === 'four'; }});
        var simmerD = activeDishes.filter(function(d) {{ return d.cookMethod === 'mijote'; }});
        var panD = activeDishes.filter(function(d) {{ return d.cookMethod === 'poele' || d.cookMethod === 'minute'; }});

        var vegPills = groupIngs(activeDishes, ['legumes']);
        var protPills = groupIngs(activeDishes, ['boucherie']);
        var starchPills = groupIngs(activeDishes, ['epicerie']);
        var freshPills = groupIngs(activeDishes, ['cremerie']);

        var dynSteps = [];
        dynSteps.push({{
          step: 1,
          img: 'step1',
          duration: 12,
          station: ovenD.length ? 'Plan de travail & Préchauffage Four 200°C' : 'Plan de travail',
          title: 'Mise en place & découpe (' + activeDishes.length + ' plats)',
          badges: activeDishes.map(function(d, idx) {{ return SHORT[idx] + ' • ' + d.shortName; }}),
          pills: vegPills.slice(0, 3).concat(protPills.slice(0, 2)),
          desc: (ovenD.length ? 'Préchauffez le four à 200°C. ' : '') + 'Taillez les légumes (' + vegPills.slice(0, 3).join(', ') + ') et préparez les protéines de vos 5 recettes.'
        }});

        if (ovenD.length) {{
          var ovenPills = groupIngs(ovenD, ['boucherie', 'legumes']);
          dynSteps.push({{
            step: dynSteps.length + 1,
            img: 'step2',
            duration: 20,
            station: 'Four 200°C Chaleur tournante',
            title: 'Enfournement simultané (' + ovenD.length + (ovenD.length > 1 ? ' plats' : ' plat') + ')',
            badges: ovenD.map(function(d) {{ return d.shortName; }}),
            pills: ovenPills.slice(0, 4),
            desc: 'Disposez sur vos plaques : ' + ovenPills.slice(0, 4).join(', ') + '. Huilez légèrement, assaisonnez et enfournez 20 min.'
          }});
        }}

        dynSteps.push({{
          step: dynSteps.length + 1,
          img: 'step3',
          duration: 16,
          station: 'Plaques de cuisson (Feux doux/moyen)',
          title: simmerD.length ? 'Féculents & Mijotés (' + simmerD.map(function(d){{return d.shortName;}}).join(', ') + ')' : 'Cuisson groupée des Féculents & Céréales',
          badges: (simmerD.length ? simmerD : activeDishes).map(function(d) {{ return d.shortName; }}),
          pills: starchPills.slice(0, 4),
          desc: 'Lancez la cuisson des féculents et mijotés à couvert : ' + starchPills.slice(0, 4).join(', ') + ' pendant 15 à 18 minutes.'
        }});

        if (panD.length) {{
          var panPills = groupIngs(panD, ['boucherie', 'cremerie', 'legumes']);
          dynSteps.push({{
            step: dynSteps.length + 1,
            img: 'step5',
            duration: 14,
            station: 'Grande Poêle / Wok feu vif',
            title: 'Saisie vive à la poêle (' + panD.map(function(d){{return d.shortName;}}).join(', ') + ')',
            badges: panD.map(function(d) {{ return d.shortName; }}),
            pills: panPills.slice(0, 4),
            desc: 'Faites dorer à feu vif : ' + panPills.slice(0, 4).join(', ') + ' pendant 6 à 8 minutes pour caraméliser les sucs.'
          }});
        }}

        dynSteps.push({{
          step: dynSteps.length + 1,
          img: 'step6',
          duration: 8,
          station: 'Plan de travail (Sans cuisson)',
          title: 'Préparation à froid des Sauces & Garnitures',
          badges: activeDishes.map(function(d) {{ return d.shortName; }}),
          pills: freshPills.slice(0, 4),
          desc: 'Préparez vos bases fraîches (' + freshPills.slice(0, 3).join(', ') + ') dans des petits pots séparés.'
        }});

        dynSteps.push({{
          step: dynSteps.length + 1,
          img: 'step7',
          duration: 10,
          station: 'Dressage & Mise au frais',
          title: 'Assemblage des ' + (state.people * 10) + ' boîtes (Lun à Ven)',
          badges: activeDishes.map(function(d, idx) {{ return SHORT[idx] + ' : ' + d.shortName; }}),
          pills: [(state.people * 2) + ' portions / plat', (state.people * 10) + ' repas au total'],
          desc: 'Répartissez chaque plat en ' + (state.people * 2) + ' boîtes. Laissez tiédir avant de fermer et placer au frais.'
        }});

        var totalMin = dynSteps.reduce(function(a, s) {{ return a + s.duration; }}, 0);
        var doneCnt = dynSteps.filter(function(s) {{ return !!state.doneSteps[s.step]; }}).length;

        var html = '<div class="seg-ctrl">' +
          '<button class="seg-btn ' + (state.prepMode === 'batch' ? 'active' : '') + '" onclick="state.prepMode=\\'batch\\'; render();">Session Batch (' + totalMin + ' min)</button>' +
          '<button class="seg-btn ' + (state.prepMode === 'recipes' ? 'active' : '') + '" onclick="state.prepMode=\\'recipes\\'; render();">Fiches Recettes (5)</button></div>';

        if (state.prepMode === 'batch') {{
          var stations = [];
          activeDishes.forEach(function(d) {{ if (stations.indexOf(d.cookMethodLabel) === -1) stations.push(d.cookMethodLabel); }});
          html += '<div style="background:#FFF; border:1px solid #E2E8F0; border-radius:16px; padding:12px; margin-bottom:12px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<div><div style="font-size:10px; font-weight:800; color:#FF5A36; text-transform:uppercase;">Plan d\\'action sur-mesure</div>' +
            '<strong style="font-size:14px;">' + dynSteps.length + ' étapes pour vos 5 plats</strong></div>' +
            '<span style="font-size:11px; font-weight:700; background:#F1F5F9; padding:4px 9px; border-radius:99px;">' + doneCnt + '/' + dynSteps.length + '</span></div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:8px;">' +
            stations.map(function(st) {{ return '<span style="font-size:10.5px; font-weight:700; background:#FFF1EE; color:#FF5A36; padding:3px 8px; border-radius:6px;">' + st + '</span>'; }}).join('') +
            '</div></div>';

          dynSteps.forEach(function(st) {{
            var done = !!state.doneSteps[st.step];
            html += '<div class="card" style="cursor:default; opacity:' + (done ? '0.55' : '1') + ';">' +
              '<div style="position:relative; aspect-ratio:16/9; background:#0F172A;">' +
              '<img src="' + (STEP_IMGS[st.img] || '') + '" style="width:100%; height:100%; object-fit:cover;"/>' +
              '<div style="position:absolute; top:10px; left:10px; background:rgba(15,23,42,0.85); color:#FFF; font-size:11px; font-weight:700; padding:4px 9px; border-radius:99px;">Étape ' + st.step + '/' + dynSteps.length + ' • ' + st.duration + ' min</div></div>' +
              '<div class="card-body">' +
              '<div style="font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase;">' + st.station + '</div>' +
              '<div style="font-size:13.5px; font-weight:800; margin-top:2px;">' + st.title + '</div>' +
              '<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">' +
              st.badges.map(function(b) {{ return '<span style="font-size:10.5px; font-weight:700; background:#F1F5F9; color:#334155; padding:2px 7px; border-radius:5px;">' + b + '</span>'; }}).join('') +
              '</div>' +
              '<p style="font-size:12px; color:#475569; margin:7px 0 8px 0; line-height:1.4;">' + st.desc + '</p>' +
              '<div style="background:#F8FAFC; border:1px solid #F1F5F9; padding:7px; border-radius:10px; display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">' +
              st.pills.map(function(p) {{ return '<span style="font-size:10.5px; font-weight:600; background:#FFF; border:1px solid #E2E8F0; padding:2px 6px; border-radius:5px;">' + p + '</span>'; }}).join('') +
              '</div>' +
              '<button onclick="state.doneSteps[' + st.step + ']=!' + done + '; render();" style="width:100%; padding:9px; border-radius:10px; border:none; font-size:12px; font-weight:700; cursor:pointer; background:' + (done ? '#059669' : '#F1F5F9') + '; color:' + (done ? '#FFF' : '#0F172A') + ';">' + (done ? 'Étape terminée' : 'Marquer comme fait') + '</button></div></div>';
          }});
        }} else {{
          activeDishes.forEach(function(d, idx) {{
            html += '<div class="card" style="cursor:default;">' +
              '<div style="position:relative; aspect-ratio:16/9;"><img src="' + (IMGS[d.imgKey] || '') + '" style="width:100%; height:100%; object-fit:cover;"/>' +
              '<div style="position:absolute; top:10px; left:10px; background:rgba(15,23,42,0.85); color:#FFF; font-size:11px; font-weight:700; padding:4px 9px; border-radius:99px;">' + DAYS[idx] + '</div></div>' +
              '<div class="card-body"><div style="font-size:10.5px; font-weight:700; color:#94A3B8; text-transform:uppercase;">' + d.cookMethodLabel + ' • ' + (state.people*2) + ' portions</div>' +
              '<div style="font-size:14px; font-weight:800; margin:2px 0 8px 0;">' + d.name + '</div>' +
              '<div style="background:#ECFDF5; color:#065F46; padding:9px 11px; border-radius:12px; font-size:11.5px; line-height:1.4;"><strong>Conservation : </strong>' + d.assemblyTip + '</div></div></div>';
          }});
        }}
        container.innerHTML = html;
      }}
    }}

    render();
  </script>
</body>
</html>"""

out_path = os.path.join(brain_dir, 'MacroBatch_Clean_Mobile.html')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)
print('Wrote', out_path, os.path.getsize(out_path))
