import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update lucide imports
old_imports = """import {
  Check,
  RefreshCw,
  X,
  ShoppingBag,
  ChefHat,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Euro,
  Layers,
  BookOpen,
  Filter,
  CheckCircle2,
  ChevronRight,
  Utensils,
  Plus,
  Search,
  SlidersHorizontal,
  Info,
  CheckSquare,
  Square,
  Sparkle,
} from "lucide-react";"""

new_imports = """import {
  Check,
  RefreshCw,
  X,
  ShoppingBag,
  ChefHat,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Euro,
  Layers,
  BookOpen,
  Filter,
  CheckCircle2,
  ChevronRight,
  Utensils,
  Plus,
  Search,
  SlidersHorizontal,
  Info,
  CheckSquare,
  Square,
  Sparkle,
  Activity,
  Zap,
  Dumbbell,
  Leaf,
  Fish,
  Target,
} from "lucide-react";"""

assert old_imports in c, 'old_imports not found'
c = c.replace(old_imports, new_imports)

# 2. Toasts without emojis
c = c.replace('showToast("🍔 Plat Plaisir du Vendredi activé ! Ingrédients ajoutés aux courses.");', 'showToast("Plat plaisir du vendredi activé — Ingrédients ajoutés aux courses.");')
c = c.replace('showToast(`✅ ${recipe.shortName} ajouté au ${SLOT_SHORT_DAYS[slotIdx]} ! Ingrédients synchronisés aux courses.`);', 'showToast(`${recipe.shortName} ajouté au ${SLOT_SHORT_DAYS[slotIdx]} — synchronisé avec les courses.`);')

# 3. Configurator card header icon
old_cfg_icon = """                <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  🎯
                </div>"""
new_cfg_icon = """                <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF5A36]" />
                </div>"""
assert old_cfg_icon in c, 'old_cfg_icon not found'
c = c.replace(old_cfg_icon, new_cfg_icon)

# 4. Replier button
c = c.replace('Replier ✕', 'Replier')

# 5. Profile buttons with Lucide icons
old_profiles = """                {[
                  { id: 110, name: "Actif", icon: "🚶", mult: 1.5, sub: "Vie active, forme stable" },
                  { id: 130, name: "Sportif", icon: "⚡", mult: 1.8, sub: "Fitness, muscu (2-4x/sem)" },
                  { id: 160, name: "Athlète", icon: "🏋️", mult: 2.2, sub: "Intensif & récupération" },
                ].map((p) => {
                  const isSel = protProfile === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProtProfile(p.id as ProtProfile);
                        showToast(`Profil : ${p.name}`);
                      }}
                      className={`card-select p-3 rounded-2xl text-left border ${
                        isSel
                          ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{p.icon}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSel ? "bg-[#FF5A36] text-white" : "bg-slate-200 text-slate-700"}`}>
                          {p.mult}g/kg
                        </span>
                      </div>
                      <strong className="text-xs font-black block">{p.name}</strong>
                      <span className={`text-[9.5px] block mt-0.5 ${isSel ? "text-slate-300" : "text-slate-500"}`}>{p.sub}</span>
                    </button>
                  );
                })"""

new_profiles = """                {[
                  { id: 110, name: "Actif", icon: Activity, mult: 1.5, sub: "Vie active, forme stable" },
                  { id: 130, name: "Sportif", icon: Zap, mult: 1.8, sub: "Fitness, muscu (2-4x/sem)" },
                  { id: 160, name: "Athlète", icon: Dumbbell, mult: 2.2, sub: "Intensif & récupération" },
                ].map((p) => {
                  const isSel = protProfile === p.id;
                  const IconComp = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProtProfile(p.id as ProtProfile);
                        showToast(`Profil : ${p.name}`);
                      }}
                      className={`card-select p-3 rounded-2xl text-left border ${
                        isSel
                          ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSel ? "bg-[#FF5A36] text-white" : "bg-slate-200 text-slate-700"}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSel ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                          {p.mult}g/kg
                        </span>
                      </div>
                      <strong className="text-xs font-black block">{p.name}</strong>
                      <span className={`text-[9.5px] block mt-0.5 ${isSel ? "text-slate-300" : "text-slate-500"}`}>{p.sub}</span>
                    </button>
                  );
                })"""
assert old_profiles in c, 'old_profiles not found'
c = c.replace(old_profiles, new_profiles)

# 6. Diet buttons with Lucide icons
old_diet = """                  {[
                    { id: "omni", label: "🍖 Tout" },
                    { id: "vege", label: "🌱 Végé" },
                    { id: "pesco", label: "🐟 Pesco" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDietChange(d.id as DietMode)}
                      className={`btn-press py-2 text-center rounded-xl font-bold text-xs border ${
                        diet === d.id
                          ? "bg-[#0F172A] text-white border-[#0F172A]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))"""

new_diet = """                  {[
                    { id: "omni", label: "Omnivore", icon: Utensils },
                    { id: "vege", label: "Végétarien", icon: Leaf },
                    { id: "pesco", label: "Pescatarien", icon: Fish },
                  ].map((d) => {
                    const IconComp = d.icon;
                    const isSel = diet === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDietChange(d.id as DietMode)}
                        className={`btn-press py-2 px-1 text-center rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 ${
                          isSel
                            ? "bg-[#0F172A] text-white border-[#0F172A]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 ${isSel ? "text-[#FF5A36]" : "text-slate-500"}`} />
                        <span>{d.label}</span>
                      </button>
                    );
                  })"""
assert old_diet in c, 'old_diet not found'
c = c.replace(old_diet, new_diet)

# 7. Friday smash burger button
old_smash = """              <button
                type="button"
                onClick={handlePleasureToggle}
                className={`btn-press flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold ${
                  hasPleasureMeal
                    ? "bg-[#FFF0ED] text-[#FF5A36] border-[#FF5A36]/40"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                }`}
              >
                <span>🍔 Smash Burger du vendredi</span>
                <span className="text-[11px] font-black">{hasPleasureMeal ? "✓ Activé" : "+ Activer"}</span>
              </button>"""

new_smash = """              <button
                type="button"
                onClick={handlePleasureToggle}
                className={`btn-press flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold ${
                  hasPleasureMeal
                    ? "bg-[#FFF0ED] text-[#FF5A36] border-[#FF5A36]/40"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>Option plaisir du vendredi</span>
                <span className="text-[11px] font-black">{hasPleasureMeal ? "Activé" : "+ Activer"}</span>
              </button>"""
assert old_smash in c, 'old_smash not found'
c = c.replace(old_smash, new_smash)

# 8. Collapsed configurator bar
old_collapsed = """          <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold truncate">
              <span className="font-black text-[#0F172A] flex items-center gap-1">
                <span>🎯</span> {userWeightKg} kg • {protProfile === 110 ? "Actif" : protProfile === 130 ? "Sportif" : "Athlète"}
              </span>
              <span>•</span>
              <span className="text-[#059669] font-bold">~{targetMealProteinG}g prot/repas</span>
              <span>•</span>
              <span>{diet === "vege" ? "Végé 🌱" : diet === "pesco" ? "Pesco 🐟" : "Omnivore 🍖"}</span>
              <span>•</span>
              <span>{peopleCount} pers</span>
            </div>

            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="btn-press text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full shrink-0 ml-2"
            >
              Modifier
            </button>
          </div>"""

new_collapsed = """          <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold truncate">
              <span className="font-black text-[#0F172A] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>{userWeightKg} kg • {protProfile === 110 ? "Actif" : protProfile === 130 ? "Sportif" : "Athlète"}</span>
              </span>
              <span>•</span>
              <span className="text-[#059669] font-bold">~{targetMealProteinG}g prot/repas</span>
              <span>•</span>
              <span>{diet === "vege" ? "Végétarien" : diet === "pesco" ? "Pescatarien" : "Omnivore"}</span>
              <span>•</span>
              <span>{peopleCount} pers</span>
            </div>

            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="btn-press text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full shrink-0 ml-2"
            >
              Modifier
            </button>
          </div>"""
assert old_collapsed in c, 'old_collapsed not found'
c = c.replace(old_collapsed, new_collapsed)

# 9. Persistent week menu banner
c = c.replace('{protProfile === 110 ? "🚶 Profil Actif" : protProfile === 130 ? "🏃 Profil Sportif" : "🏋️ Profil Athlète"}',
              '{protProfile === 110 ? "Profil Actif" : protProfile === 130 ? "Profil Sportif" : "Profil Athlète"}')

# 10. Filter matching text & cross
c = c.replace('{filterOnlyMatching ? "✓ Filtrées selon vos choix" : "Afficher les 30 recettes"}',
              '{filterOnlyMatching ? "Recettes adaptées à vos critères" : "Afficher toutes les recettes"}')

# 11. Category chips without emojis
old_cat_chips = """              {[
                { id: "all", label: `Tous (${filteredCatalog.length})` },
                ...(diet === "omni"
                  ? [
                      { id: "volaille", label: "🍗 Volailles" },
                      { id: "boeuf", label: "🥩 Bœuf 5%" },
                    ]
                  : []),
                ...(diet !== "vege"
                  ? [{ id: "poisson", label: "🐟 Poissons" }]
                  : []),
                { id: "vege_aop", label: "🧀 Halloumi & AOP" },
                { id: "vege_tofu", label: "🌱 100% Végétal" },
                { id: "dal", label: "🍲 Dals & Légumes" },
                { id: "eco", label: "💰 Éco < 2,50€" },
                { id: "plaisir", label: "🍔 Plats Plaisir" },
              ].map((cat) => ("""

new_cat_chips = """              {[
                { id: "all", label: `Toutes (${filteredCatalog.length})` },
                ...(diet === "omni"
                  ? [
                      { id: "volaille", label: "Volailles" },
                      { id: "boeuf", label: "Bœuf 5%" },
                    ]
                  : []),
                ...(diet !== "vege"
                  ? [{ id: "poisson", label: "Poissons & Thon" }]
                  : []),
                { id: "vege_aop", label: "Halloumi & Fromages" },
                { id: "vege_tofu", label: "100% Végétal" },
                { id: "dal", label: "Dals & Légumineuses" },
                { id: "eco", label: "Éco (< 2,50€)" },
                { id: "plaisir", label: "Option Plaisir" },
              ].map((cat) => ("""
assert old_cat_chips in c, 'old_cat_chips not found'
c = c.replace(old_cat_chips, new_cat_chips)

# 12. Dish card protein badge
old_dish_prot = """                        <div className="flex gap-1.5">
                          <span className="bg-[#FF5A36] text-white text-[10.5px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <span>{protProfile === 110 ? "🚶" : protProfile === 130 ? "🏃" : "🏋️"}</span>
                            <span>{getDishProtein(dish)}g prot</span>
                          </span>"""

new_dish_prot = """                        <div className="flex gap-1.5">
                          <span className="bg-[#FF5A36] text-white text-[10.5px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>{getDishProtein(dish)}g prot</span>
                          </span>"""
assert old_dish_prot in c, 'old_dish_prot not found'
c = c.replace(old_dish_prot, new_dish_prot)

# 13. Whoop Nutrition Live Rings banner
c = c.replace('{protProfile === 110 ? "Actif 🚶" : protProfile === 130 ? "Sportif 🏃" : "Athlète 🏋️"}',
              '{protProfile === 110 ? "Actif" : protProfile === 130 ? "Sportif" : "Athlète"}')

# 14. Pantry deduct checkmark
c = c.replace('✓ {group.items.length} condiments & épices du placard déduits de votre panier',
              '{group.items.length} condiments & épices du placard déduits du panier')

# 15. Prep sub tabs
c = c.replace('📖 5 Fiches Recettes', 'Fiches Recettes')

# 16. Cook methods tag
old_flame = """                      <span
                        key={method}
                        className="bg-[#FFF0ED] text-[#FF5A36] text-xs font-black px-3 py-1 rounded-full border border-[#FF5A36]/30"
                      >
                        🔥 {method}
                      </span>"""
new_flame = """                      <span
                        key={method}
                        className="bg-[#FFF0ED] text-[#FF5A36] text-xs font-black px-3 py-1 rounded-full border border-[#FF5A36]/30 flex items-center gap-1"
                      >
                        <Flame className="w-3 h-3" />
                        <span>{method}</span>
                      </span>"""
assert old_flame in c, 'old_flame not found'
c = c.replace(old_flame, new_flame)

# 17. Step completed button
c = c.replace('{isDone ? "✓ Étape terminée" : "Marquer comme fait"}',
              '{isDone ? "Étape terminée" : "Marquer comme fait"}')

# 18. Recipe card day badge
old_day_badge = """                      <div className="absolute top-3 left-3 bg-[#0F172A]/80 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full">
                        📅 {SLOT_DAYS[idx]}
                      </div>"""
new_day_badge = """                      <div className="absolute top-3 left-3 bg-[#0F172A]/80 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        <span>{SLOT_DAYS[idx]}</span>
                      </div>"""
assert old_day_badge in c, 'old_day_badge not found'
c = c.replace(old_day_badge, new_day_badge)

# 19. Modal close cross
c = c.replace("""              <button
                type="button"
                onClick={() => setSelectedDishDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center font-bold text-slate-700 shadow-sm cursor-pointer"
              >
                ✕
              </button>""",
"""              <button
                type="button"
                onClick={() => setSelectedDishDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center font-bold text-slate-700 shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>""")

# 20. Clear search cross
c = c.replace("""                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-black"
                  >
                    ✕
                  </button>""",
"""                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>""")

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Done cleaning emojis in page.tsx!')
