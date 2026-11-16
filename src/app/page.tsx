"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen,
  Calendar,
  ShoppingBag,
  ChefHat,
  SlidersHorizontal,
  Search,
  X,
  Check,
  Plus,
  RefreshCw,
  Clock,
  Activity,
  Zap,
  Dumbbell,
  Leaf,
  Fish,
  Utensils,
  Camera,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  ArrowLeft,
  Minus,
  Home,
  Receipt,
  Heart,
  Share2,
  Wallet,
  Sparkles,
} from "lucide-react";
import { RECIPE_DATABASE, Recipe, SupermarketAisle } from "@/data/recipeDatabase";

type TabKey = "home" | "menu" | "cart" | "prep";
type DietMode = "omni" | "vege" | "pesco";
type ProtProfile = 110 | 130 | 160;
type BudgetTier = "eco" | "std" | "gourmet";
type PrepSubMode = "batch" | "recipes";
type SupermarketKey = "lidl" | "leclerc" | "intermarche" | "auchan" | "carrefour" | "monoprix";
type SkillLevel = "facile" | "normal" | "avance";

const SUPERMARKET_CONFIG: Record<SupermarketKey, { label: string; mult: number }> = {
  lidl: { label: "Lidl", mult: 0.85 },
  leclerc: { label: "E.Leclerc", mult: 0.94 },
  intermarche: { label: "Intermarché", mult: 1.0 },
  auchan: { label: "Auchan", mult: 1.02 },
  carrefour: { label: "Carrefour", mult: 1.06 },
  monoprix: { label: "Monoprix", mult: 1.22 },
};

const AVOID_OPTIONS = [
  { id: "lactose", label: "Sans lactose" },
  { id: "porc", label: "Sans porc" },
  { id: "fruits_mer", label: "Sans fruits de mer" },
  { id: "noix", label: "Sans noix" },
];

const DAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

const AISLE_LABELS: Record<SupermarketAisle, string> = {
  boucherie: "Boucherie & Poissonnerie",
  legumes: "Fruits & Légumes",
  cremerie: "Produits Frais & Skyr",
  epicerie: "Épicerie & Féculents",
  placard: "Placard & Condiments",
};

const AISLE_ORDER: SupermarketAisle[] = [
  "legumes",
  "boucherie",
  "cremerie",
  "epicerie",
  "placard",
];

// Typical staples detected when scanning fridge or pantry (aligned with /api/scan-stock)
const FRIDGE_SCAN_PRESETS = [
  { id: "poulet", label: "Filets de poulet", keywords: ["poulet", "dinde", "volaille"] },
  { id: "oeufs", label: "Œufs frais", keywords: ["œuf", "oeuf"] },
  { id: "skyr", label: "Skyr / Yaourt grec", keywords: ["skyr", "yaourt", "fromage blanc"] },
  { id: "brocoli", label: "Brocolis", keywords: ["brocoli"] },
  { id: "courgette", label: "Courgettes", keywords: ["courgette", "concombre"] },
  { id: "carotte", label: "Carottes", keywords: ["carotte"] },
  { id: "feta", label: "Feta / Halloumi", keywords: ["feta", "halloumi", "chèvre", "cheddar"] },
  { id: "tofu", label: "Tofu ferme", keywords: ["tofu"] },
  { id: "citron", label: "Citrons jaunes / verts", keywords: ["citron"] },
];

const PANTRY_SCAN_PRESETS = [
  { id: "riz", label: "Riz basmati / thaï", keywords: ["riz"] },
  { id: "quinoa", label: "Quinoa / Boulgour", keywords: ["quinoa", "ébly", "boulgour", "semoule"] },
  { id: "lentilles", label: "Lentilles corail", keywords: ["lentille"] },
  { id: "pois_chiches", label: "Pois chiches", keywords: ["pois chiche", "haricot"] },
  { id: "patate_douce", label: "Patates douces", keywords: ["patate douce", "pomme de terre"] },
  { id: "lait_coco", label: "Lait de coco", keywords: ["coco"] },
  { id: "cacahuete", label: "Beurre de cacahuète", keywords: ["cacahuète", "sésame", "tahini"] },
  { id: "tomate", label: "Tomates concassées", keywords: ["tomate", "passata"] },
  { id: "oignon", label: "Oignons & Ail", keywords: ["oignon", "ail", "échalote"] },
];

interface DynamicBatchStep {
  stepNumber: number;
  title: string;
  station: string;
  durationMin: number;
  image: string;
  dishBadges: string[];
  ingredientPills: string[];
  description: string;
}

export default function MacroBatchApp() {
  // Navigation & UI state
  const [tab, setTab] = useState<TabKey>("home");
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [prepMode, setPrepMode] = useState<PrepSubMode>("batch");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [swapSlotIndex, setSwapSlotIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Fridge / Pantry / Receipt Camera & Vision AI Scanner State (3-Step Zest Flow)
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanStep, setScanStep] = useState<1 | 2 | 3>(1);
  const [scanIntent, setScanIntent] = useState<"now" | "week">("week");
  const [scanZone, setScanZone] = useState<"frigo" | "placard" | "ticket">("frigo");
  const [scanPhotoPreview, setScanPhotoPreview] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [visionSummary, setVisionSummary] = useState<string | null>(null);
  const [visionMode, setVisionMode] = useState<string | null>(null);
  const [visionApiKey, setVisionApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [tempDetectedIds, setTempDetectedIds] = useState<string[]>([]);
  const [inStockIds, setInStockIds] = useState<string[]>([]);
  const [tempCustomTerms, setTempCustomTerms] = useState<string[]>([]);
  const [customStockTerms, setCustomStockTerms] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState<string>("");
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const speechRecRef = useRef<unknown>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [tab]);

  // User profile & preferences (tucked cleanly in settings)
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [slotPeopleCounts, setSlotPeopleCounts] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [protProfile, setProtProfile] = useState<ProtProfile>(130);
  const [diet, setDiet] = useState<DietMode>("omni");
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("std");

  const effectiveSlotPeople = useMemo(
    () => slotPeopleCounts.map((v) => v ?? peopleCount),
    [slotPeopleCounts, peopleCount]
  );
  const totalWeeklyPortions = useMemo(
    () => effectiveSlotPeople.reduce((acc, p) => acc + p * 2, 0),
    [effectiveSlotPeople]
  );
  const hasCustomDayPeople = slotPeopleCounts.some((v) => v !== null);

  const updateDayPeopleCount = (dayIdx: number, delta: number) => {
    setSlotPeopleCounts((prev) => {
      const next = [...prev];
      const current = next[dayIdx] ?? peopleCount;
      const updated = Math.max(1, Math.min(12, current + delta));
      next[dayIdx] = updated === peopleCount ? null : updated;
      return next;
    });
  };

  // Catalog filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Weekly menu slots (5 days, 2 meals/day per person)
  const [weekSlots, setWeekSlots] = useState<string[]>([
    "d_greek",
    "d_dal",
    "d_tofu_satay",
    "d_chimi",
    "d_tiger",
  ]);

  // Grocery & Prep check state
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});
  const [deductPantry, setDeductPantry] = useState<boolean>(true);
  const [doneSteps, setDoneSteps] = useState<Record<number, boolean>>({});

  // Yuma-inspired features: Weekly budget, favorites, custom cart items, quick 3-idea swap
  const [weeklyBudget, setWeeklyBudget] = useState<number>(65);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [customCartItems, setCustomCartItems] = useState<
    { id: string; name: string; checked: boolean }[]
  >([]);
  const [newCartItemText, setNewCartItemText] = useState<string>("");
  const [hideCheckedCart, setHideCheckedCart] = useState<boolean>(false);
  const [quickSwapDayIdx, setQuickSwapDayIdx] = useState<number | null>(null);
  const [supermarket, setSupermarket] = useState<SupermarketKey>("leclerc");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("facile");
  const [avoidList, setAvoidList] = useState<string[]>([]);
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0);
  const [nextWeekSlots, setNextWeekSlots] = useState<string[]>(() =>
    RECIPE_DATABASE.slice(5, 10).map((r) => r.id)
  );
  const [skippedDays, setSkippedDays] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("macrobatch_v2_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.peopleCount) setPeopleCount(parsed.peopleCount);
        if (Array.isArray(parsed.slotPeopleCounts) && parsed.slotPeopleCounts.length === 5) {
          setSlotPeopleCounts(parsed.slotPeopleCounts);
        }
        if (parsed.weightKg) setWeightKg(parsed.weightKg);
        if (parsed.protProfile) setProtProfile(parsed.protProfile);
        if (parsed.diet) setDiet(parsed.diet);
        if (parsed.budgetTier) setBudgetTier(parsed.budgetTier);
        if (typeof parsed.weeklyBudget === "number") setWeeklyBudget(parsed.weeklyBudget);
        if (parsed.supermarket && parsed.supermarket in SUPERMARKET_CONFIG) {
          setSupermarket(parsed.supermarket);
        }
        if (parsed.skillLevel) setSkillLevel(parsed.skillLevel);
        if (Array.isArray(parsed.avoidList)) setAvoidList(parsed.avoidList);
        if (Array.isArray(parsed.weekSlots) && parsed.weekSlots.length === 5) {
          setWeekSlots(parsed.weekSlots);
        }
        if (Array.isArray(parsed.nextWeekSlots) && parsed.nextWeekSlots.length === 5) {
          setNextWeekSlots(parsed.nextWeekSlots);
        }
        if (Array.isArray(parsed.skippedDays) && parsed.skippedDays.length === 5) {
          setSkippedDays(parsed.skippedDays);
        }
        if (Array.isArray(parsed.inStockIds)) setInStockIds(parsed.inStockIds);
        if (Array.isArray(parsed.customStockTerms)) setCustomStockTerms(parsed.customStockTerms);
        if (Array.isArray(parsed.favoriteIds)) setFavoriteIds(parsed.favoriteIds);
        if (Array.isArray(parsed.customCartItems)) setCustomCartItems(parsed.customCartItems);
        if (typeof parsed.visionApiKey === "string") setVisionApiKey(parsed.visionApiKey);
        if (parsed.checkedGroceries) setCheckedGroceries(parsed.checkedGroceries);
        if (parsed.doneSteps) setDoneSteps(parsed.doneSteps);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "macrobatch_v2_state",
        JSON.stringify({
          peopleCount,
          slotPeopleCounts,
          weightKg,
          protProfile,
          diet,
          budgetTier,
          weeklyBudget,
          supermarket,
          skillLevel,
          avoidList,
          weekSlots,
          nextWeekSlots,
          skippedDays,
          inStockIds,
          customStockTerms,
          favoriteIds,
          customCartItems,
          visionApiKey,
          checkedGroceries,
          doneSteps,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [
    peopleCount,
    slotPeopleCounts,
    weightKg,
    protProfile,
    diet,
    budgetTier,
    weeklyBudget,
    supermarket,
    skillLevel,
    avoidList,
    weekSlots,
    nextWeekSlots,
    skippedDays,
    inStockIds,
    customStockTerms,
    favoriteIds,
    customCartItems,
    visionApiKey,
    checkedGroceries,
    doneSteps,
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  // All presets combined
  const allStockPresets = useMemo(
    () => [...FRIDGE_SCAN_PRESETS, ...PANTRY_SCAN_PRESETS],
    []
  );

  const totalStockCount = inStockIds.length + customStockTerms.length;
  const totalTempStockCount = tempDetectedIds.length + tempCustomTerms.length;

  // Check if a single ingredient name matches what the user has in stock (presets + custom terms)
  const isIngredientInStock = (
    ingName: string,
    stockIds = inStockIds,
    customTerms = customStockTerms
  ): boolean => {
    if (stockIds.length === 0 && customTerms.length === 0) return false;
    const lower = ingName.toLowerCase();
    const matchPreset = stockIds.some((id) => {
      const preset = allStockPresets.find((p) => p.id === id);
      if (!preset) return false;
      return preset.keywords.some((kw) => lower.includes(kw));
    });
    if (matchPreset) return true;
    return customTerms.some((term) => {
      const clean = term.trim().toLowerCase();
      return clean.length >= 2 && (lower.includes(clean) || clean.includes(lower));
    });
  };

  // Count how many ingredients of a recipe match the user's scanned fridge/pantry
  const getRecipeStockMatches = (
    recipe: Recipe,
    stockIds = inStockIds,
    customTerms = customStockTerms
  ): string[] => {
    if (stockIds.length === 0 && customTerms.length === 0) return [];
    const matchedNames: string[] = [];
    recipe.ingredients.forEach((ing) => {
      if (ing.isPantry) return;
      if (isIngredientInStock(ing.name, stockIds, customTerms)) {
        matchedNames.push(ing.name);
      }
    });
    return matchedNames;
  };

  // Nutrition calculations
  const profileMult = protProfile === 110 ? 1.5 : protProfile === 160 ? 2.2 : 1.8;
  const targetDailyProtG = Math.round(weightKg * profileMult);

  const getDishProtein = (recipe: Recipe) => {
    const base = recipe.prot[protProfile] || 60;
    return Math.round(base * (weightKg / 72));
  };

  const currentWeekSlots = weekOffset === 0 ? weekSlots : nextWeekSlots;

  // Active dishes for the 5 days
  const activeDishes = useMemo(() => {
    return currentWeekSlots
      .map((id) => RECIPE_DATABASE.find((r) => r.id === id))
      .filter((r): r is Recipe => Boolean(r));
  }, [currentWeekSlots]);

  const avgProtPerMeal = useMemo(() => {
    if (activeDishes.length === 0) return 0;
    const sum = activeDishes.reduce((acc, d) => acc + getDishProtein(d), 0);
    return Math.round(sum / activeDishes.length);
  }, [activeDishes, protProfile, weightKg]);

  const supermarketMult = SUPERMARKET_CONFIG[supermarket].mult;

  const avgCostPerMeal = useMemo(() => {
    if (activeDishes.length === 0) return 0;
    const sum = activeDishes.reduce((acc, d) => acc + d.cost[budgetTier] * supermarketMult, 0);
    return sum / activeDishes.length;
  }, [activeDishes, budgetTier, supermarketMult]);

  const estimatedWeeklyCost = useMemo(() => {
    return activeDishes.reduce((acc, dish, idx) => {
      if (skippedDays[idx]) return acc;
      const portions = (effectiveSlotPeople[idx] ?? peopleCount) * 2;
      return acc + dish.cost[budgetTier] * supermarketMult * portions;
    }, 0);
  }, [activeDishes, effectiveSlotPeople, peopleCount, budgetTier, supermarketMult, skippedDays]);

  const matchesUserConstraints = (recipe: Recipe, targetDiet: DietMode = diet, targetAvoid: string[] = avoidList): boolean => {
    if (targetDiet === "vege" && recipe.diet !== "vege" && recipe.diet !== "both") return false;
    if (targetDiet === "pesco" && recipe.diet === "omni") return false;

    if (targetAvoid.length === 0) return true;
    const textBlob = `${recipe.name} ${recipe.shortName} ${recipe.ingredients.map((i) => i.name).join(" ")}`.toLowerCase();

    if (targetAvoid.includes("lactose")) {
      const dairyTerms = ["skyr", "yaourt", "feta", "mozzarella", "parmesan", "fromage", "crème", "creme", "halloumi", "cheddar", "chèvre", "chevre", "burrata", "ricotta"];
      const hasDairy = dairyTerms.some((t) => textBlob.includes(t)) || (textBlob.includes("lait") && !textBlob.includes("lait de coco"));
      if (hasDairy) return false;
    }
    if (targetAvoid.includes("porc")) {
      if (["porc", "lardon", "jambon", "chorizo", "bacon", "saucisse"].some((t) => textBlob.includes(t))) {
        return false;
      }
    }
    if (targetAvoid.includes("fruits_mer")) {
      if (["crevette", "moule", "calamar", "crustacé", "gambas", "saint-jacques"].some((t) => textBlob.includes(t))) {
        return false;
      }
    }
    if (targetAvoid.includes("noix")) {
      if (["noix", "amande", "cacahuète", "cacahuete", "satay", "cajou", "noisette", "pistache"].some((t) => textBlob.includes(t))) {
        return false;
      }
    }
    return true;
  };

  const generateSmartWeekMenu = (targetOffset: 0 | 1 = weekOffset) => {
    let pool = RECIPE_DATABASE.filter((r) => matchesUserConstraints(r));
    if (pool.length < 5) {
      pool = RECIPE_DATABASE.filter((r) => {
        if (diet === "vege" && r.diet !== "vege" && r.diet !== "both") return false;
        if (diet === "pesco" && r.diet === "omni") return false;
        return true;
      });
    }
    if (pool.length === 0) return;

    // Shuffle pool with slight preference for favorites and stock matches
    const scored = [...pool].sort((a, b) => {
      const aBoost = getRecipeStockMatches(a).length * 0.4 + (favoriteIds.includes(a.id) ? 0.3 : 0);
      const bBoost = getRecipeStockMatches(b).length * 0.4 + (favoriteIds.includes(b.id) ? 0.3 : 0);
      return Math.random() - 0.5 + (bBoost - aBoost) * 0.25;
    });

    // Pick 5 varied dishes (preferring distinct categories)
    const chosen: Recipe[] = [];
    const usedCategories = new Set<string>();
    for (const r of scored) {
      if (chosen.length >= 5) break;
      if (!usedCategories.has(r.category)) {
        chosen.push(r);
        usedCategories.add(r.category);
      }
    }
    for (const r of scored) {
      if (chosen.length >= 5) break;
      if (!chosen.some((c) => c.id === r.id)) {
        chosen.push(r);
      }
    }
    while (chosen.length < 5) {
      chosen.push(scored[chosen.length % scored.length]);
    }

    // Optimize cost to fit within weeklyBudget by swapping the most expensive slots with cheaper compatible dishes
    const calcCost = (list: Recipe[]) =>
      list.reduce((acc, dish, idx) => {
        if (skippedDays[idx]) return acc;
        const portions = (effectiveSlotPeople[idx] ?? peopleCount) * 2;
        return acc + dish.cost[budgetTier] * supermarketMult * portions;
      }, 0);

    const cheapestPool = [...pool].sort((a, b) => a.cost[budgetTier] - b.cost[budgetTier]);
    let guard = 0;
    while (calcCost(chosen) > weeklyBudget && guard < 15) {
      guard++;
      // Find most expensive active slot
      let maxIdx = -1;
      let maxSlotCost = -1;
      chosen.forEach((dish, idx) => {
        if (skippedDays[idx]) return;
        const portions = (effectiveSlotPeople[idx] ?? peopleCount) * 2;
        const slotCost = dish.cost[budgetTier] * supermarketMult * portions;
        if (slotCost > maxSlotCost) {
          maxSlotCost = slotCost;
          maxIdx = idx;
        }
      });
      if (maxIdx === -1) break;

      const replacement = cheapestPool.find(
        (cand) =>
          !chosen.some((c) => c.id === cand.id) &&
          cand.cost[budgetTier] < chosen[maxIdx].cost[budgetTier]
      );
      if (!replacement) break;
      chosen[maxIdx] = replacement;
    }

    const nextIds = chosen.map((r) => r.id);
    if (targetOffset === 0) setWeekSlots(nextIds);
    else setNextWeekSlots(nextIds);

    const finalCost = Math.round(calcCost(chosen));
    showToast(`Menu composé : ~${finalCost} € (budget ${weeklyBudget} €)`);
  };

  const toggleFavorite = (recipeId: string) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(recipeId);
      const next = exists ? prev.filter((id) => id !== recipeId) : [...prev, recipeId];
      showToast(exists ? "Retiré des favoris" : "Ajouté aux favoris");
      return next;
    });
  };

  const quickSwapOptions = useMemo(() => {
    if (quickSwapDayIdx === null) return [];
    const currentId = currentWeekSlots[quickSwapDayIdx];
    const pool = RECIPE_DATABASE.filter((r) => {
      if (r.id === currentId) return false;
      return matchesUserConstraints(r);
    }).sort((a, b) => {
      // Prioritize not already in week, then favorites/stock, then budget
      const aInWeek = currentWeekSlots.includes(a.id) ? 1 : 0;
      const bInWeek = currentWeekSlots.includes(b.id) ? 1 : 0;
      if (aInWeek !== bInWeek) return aInWeek - bInWeek;
      const aScore =
        getRecipeStockMatches(a).length * 2 + (favoriteIds.includes(a.id) ? 1 : 0);
      const bScore =
        getRecipeStockMatches(b).length * 2 + (favoriteIds.includes(b.id) ? 1 : 0);
      if (bScore !== aScore) return bScore - aScore;
      return a.cost[budgetTier] - b.cost[budgetTier];
    });
    return pool.slice(0, 3);
  }, [quickSwapDayIdx, currentWeekSlots, diet, avoidList, budgetTier, favoriteIds, inStockIds, customStockTerms]);

  const addCustomCartItem = () => {
    const trimmed = newCartItemText.trim();
    if (!trimmed) return;
    setCustomCartItems((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, name: trimmed, checked: false },
    ]);
    setNewCartItemText("");
  };

  const formatQty = (qty: number, unit: string) => {
    const rounded = Math.round(qty);
    if (unit === "g" && rounded >= 1000) {
      return `${(rounded / 1000).toFixed(1).replace(".", ",")} kg`;
    }
    if (unit === "ml" && rounded >= 1000) {
      return `${(rounded / 1000).toFixed(1).replace(".", ",")} L`;
    }
    return `${rounded} ${unit}`;
  };

  // ================================================================
  // DYNAMIC BATCH PREPARATION ENGINE (ADAPTED TO THE 5 SELECTED DISHES)
  // ================================================================
  const dynamicBatchTimeline = useMemo<DynamicBatchStep[]>(() => {
    const steps: DynamicBatchStep[] = [];

    const ovenDishes = activeDishes.filter((d) => d.cookMethod === "four");
    const simmerDishes = activeDishes.filter((d) => d.cookMethod === "mijote");
    const panDishes = activeDishes.filter((d) => d.cookMethod === "poele");
    const minuteDishes = activeDishes.filter((d) => d.cookMethod === "minute");

    const getGroupIngredients = (dishes: Recipe[], aisles: SupermarketAisle[]) => {
      const map = new Map<string, { name: string; qty: number; unit: string }>();
      activeDishes.forEach((d, dayIdx) => {
        if (!dishes.includes(d)) return;
        const dishPortions = (effectiveSlotPeople[dayIdx] ?? peopleCount) * 2;
        d.ingredients
          .filter((i) => aisles.includes(i.aisle) && !i.isPantry)
          .forEach((i) => {
            const prev = map.get(i.name);
            if (prev) prev.qty += i.qty * dishPortions;
            else map.set(i.name, { name: i.name, qty: i.qty * dishPortions, unit: i.unit });
          });
      });
      return Array.from(map.values()).map((x) => `${x.name} (${formatQty(x.qty, x.unit)})`);
    };

    const allVegPills = getGroupIngredients(activeDishes, ["legumes"]);
    const allProtPills = getGroupIngredients(activeDishes, ["boucherie"]);
    const allStarchPills = getGroupIngredients(activeDishes, ["epicerie"]);
    const allFreshPills = getGroupIngredients(activeDishes, ["cremerie"]);

    steps.push({
      stepNumber: 1,
      title: `Mise en place & découpe (${activeDishes.length} plats)`,
      station: ovenDishes.length > 0 ? "Plan de travail & Préchauffage Four 200°C" : "Plan de travail",
      durationMin: 12,
      image: "/steps/step1_a.jpg",
      dishBadges: activeDishes.map((d, idx) => `${DAYS_SHORT[idx]} • ${d.shortName}`),
      ingredientPills: [...allVegPills.slice(0, 4), ...allProtPills.slice(0, 2)],
      description:
        ovenDishes.length > 0
          ? `Préchauffez le four à 200°C. Taillez les légumes (${allVegPills
              .slice(0, 3)
              .join(", ")}) et préparez les protéines pour vos ${activeDishes.length} recettes de la semaine.`
          : `Taillez l'ensemble des légumes frais (${allVegPills
              .slice(0, 3)
              .join(", ")}) et préparez vos protéines sur le plan de travail.`,
    });

    if (ovenDishes.length > 0) {
      const ovenIngredients = getGroupIngredients(ovenDishes, ["boucherie", "legumes"]);
      steps.push({
        stepNumber: steps.length + 1,
        title: `Enfournement simultané (${ovenDishes.length} ${ovenDishes.length > 1 ? "plats" : "plat"} au four)`,
        station: "Four 200°C Chaleur tournante",
        durationMin: 20,
        image: "/steps/step2_a.jpg",
        dishBadges: ovenDishes.map((d) => d.shortName),
        ingredientPills: ovenIngredients.slice(0, 5),
        description: `Disposez sur vos plaques : ${ovenIngredients
          .slice(0, 4)
          .join(", ")}. Arrosez d'un filet d'huile d'olive, assaisonnez et enfournez pour 20 à 25 minutes jusqu'à belle coloration.`,
      });
    }

    const starchAndSimmerDishes = simmerDishes.length > 0 ? simmerDishes : activeDishes;
    steps.push({
      stepNumber: steps.length + 1,
      title:
        simmerDishes.length > 0
          ? `Lancement des Féculents & Mijotés (${simmerDishes.map((d) => d.shortName).join(", ")})`
          : "Cuisson groupée des Féculents & Céréales",
      station: "Plaques de cuisson (Feux doux/moyen)",
      durationMin: 16,
      image: "/steps/step3_a.jpg",
      dishBadges: starchAndSimmerDishes.map((d) => d.shortName),
      ingredientPills: allStarchPills.slice(0, 5),
      description:
        simmerDishes.length > 0
          ? `Lancez la cuisson des bases céréalières et laissez mijoter à couvert : ${allStarchPills
              .slice(0, 4)
              .join(", ")} pendant 15 à 18 minutes.`
          : `Lancez en parallèle vos féculents de la semaine (${allStarchPills
              .slice(0, 4)
              .join(", ")}) dans l'eau bouillante salée puis égouttez.`,
    });

    const activePanOrMinute = [...panDishes, ...minuteDishes];
    if (activePanOrMinute.length > 0) {
      const panPills = getGroupIngredients(activePanOrMinute, ["boucherie", "cremerie", "legumes"]);
      steps.push({
        stepNumber: steps.length + 1,
        title: `Saisie vive à la poêle (${activePanOrMinute.map((d) => d.shortName).join(", ")})`,
        station: "Grande Poêle / Wok feu vif",
        durationMin: 14,
        image: "/steps/step5_a.jpg",
        dishBadges: activePanOrMinute.map((d) => d.shortName),
        ingredientPills: panPills.slice(0, 5),
        description: `Faites dorer à feu vif : ${panPills
          .slice(0, 4)
          .join(", ")} pendant 6 à 8 minutes par fournée pour caraméliser les sucs tout en gardant le cœur moelleux.`,
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      title: "Préparation à froid des Sauces & Garnitures",
      station: "Plan de travail (Sans cuisson)",
      durationMin: 8,
      image: "/steps/step6_a.jpg",
      dishBadges: activeDishes.map((d) => d.shortName),
      ingredientPills: allFreshPills.slice(0, 5),
      description: `Préparez les sauces fraîches et bases laitières (${allFreshPills
        .slice(0, 4)
        .join(", ")}) dans des petits contenants hermétiques séparés pour préserver le croquant au réchauffage.`,
    });

    steps.push({
      stepNumber: steps.length + 1,
      title: `Assemblage des ${totalWeeklyPortions} boîtes (Lundi à Vendredi)`,
      station: "Dressage & Mise au frais",
      durationMin: 10,
      image: "/steps/step7_a.jpg",
      dishBadges: activeDishes.map(
        (d, idx) =>
          `${DAYS_FULL[idx]} (${(effectiveSlotPeople[idx] ?? peopleCount) * 2} port.) : ${d.shortName}`
      ),
      ingredientPills: [`${totalWeeklyPortions} repas au total`],
      description: `Répartissez chaque recette selon vos convives : ${activeDishes
        .map(
          (d, i) =>
            `${DAYS_SHORT[i]} ${d.shortName} (${(effectiveSlotPeople[i] ?? peopleCount) * 2} port.)`
        )
        .join(" • ")}. Laissez tiédir 15 min avant de fermer les couvercles.`,
    });

    return steps;
  }, [activeDishes, peopleCount, effectiveSlotPeople, totalWeeklyPortions]);

  const totalBatchMinutes = useMemo(() => {
    return dynamicBatchTimeline.reduce((acc, s) => acc + s.durationMin, 0);
  }, [dynamicBatchTimeline]);

  // Diet & avoidList change handlers (auto-adapt active menus)
  const sanitizeSlotsForConstraints = (slots: string[], nextDiet: DietMode, nextAvoid: string[]) => {
    const compatible = RECIPE_DATABASE.filter((r) => matchesUserConstraints(r, nextDiet, nextAvoid));
    if (compatible.length === 0) return slots;
    return slots.map((id, idx) => {
      const r = RECIPE_DATABASE.find((item) => item.id === id);
      if (r && matchesUserConstraints(r, nextDiet, nextAvoid)) return id;
      const fallback = compatible[idx % compatible.length];
      return fallback.id;
    });
  };

  const handleDietChange = (nextDiet: DietMode) => {
    setDiet(nextDiet);
    setCategoryFilter("all");
    setWeekSlots((prev) => sanitizeSlotsForConstraints(prev, nextDiet, avoidList));
    setNextWeekSlots((prev) => sanitizeSlotsForConstraints(prev, nextDiet, avoidList));
    showToast(
      `Régime : ${nextDiet === "vege" ? "Végétarien" : nextDiet === "pesco" ? "Pescatarien" : "Omnivore"}`
    );
  };

  const toggleAvoidOption = (optId: string) => {
    const nextAvoid = avoidList.includes(optId)
      ? avoidList.filter((x) => x !== optId)
      : [...avoidList, optId];
    setAvoidList(nextAvoid);
    setWeekSlots((prev) => sanitizeSlotsForConstraints(prev, diet, nextAvoid));
    setNextWeekSlots((prev) => sanitizeSlotsForConstraints(prev, diet, nextAvoid));
  };

  // Filtered AND Sorted catalog recipes (prioritizing recipes using scanned fridge/pantry items)
  const filteredCatalog = useMemo(() => {
    const filtered = RECIPE_DATABASE.filter((r) => {
      if (!matchesUserConstraints(r)) return false;

      if (categoryFilter === "anti_gaspi") {
        return getRecipeStockMatches(r).length > 0;
      }
      if (categoryFilter === "eco" && !r.isEco && r.cost[budgetTier] > 2.5) return false;
      if (categoryFilter === "vege_all" && r.diet !== "vege" && r.diet !== "both") return false;
      if (
        categoryFilter !== "all" &&
        categoryFilter !== "eco" &&
        categoryFilter !== "vege_all" &&
        categoryFilter !== "anti_gaspi" &&
        r.category !== categoryFilter
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.shortName.toLowerCase().includes(q) ||
          r.desc.toLowerCase().includes(q)
        );
      }
      return true;
    });

    // When user has scanned fridge/pantry items, sort recipes with the most stock matches first
    if (totalStockCount > 0) {
      return [...filtered].sort(
        (a, b) => getRecipeStockMatches(b).length - getRecipeStockMatches(a).length
      );
    }
    return filtered;
  }, [diet, avoidList, categoryFilter, searchQuery, budgetTier, inStockIds, customStockTerms, totalStockCount]);

  const assignToDay = (dayIdx: number, recipe: Recipe) => {
    const updater = (prev: string[]) => {
      const next = [...prev];
      next[dayIdx] = recipe.id;
      return next;
    };
    if (weekOffset === 0) setWeekSlots(updater);
    else setNextWeekSlots(updater);
    setSkippedDays((prev) => {
      if (!prev[dayIdx]) return prev;
      const next = [...prev];
      next[dayIdx] = false;
      return next;
    });
    setSwapSlotIndex(null);
    showToast(`${recipe.shortName} programmé pour ${DAYS_FULL[dayIdx]}`);
  };

  const quickAddRecipe = (recipe: Recipe) => {
    if (swapSlotIndex !== null) {
      assignToDay(swapSlotIndex, recipe);
      setIsCatalogOpen(false);
      setTab("menu");
      return;
    }
    setSelectedRecipe(recipe);
  };

  // Aggregated dynamic grocery list with itemized & aisle-level pricing
  const groceryByAisle = useMemo(() => {
    const map = new Map<
      string,
      { name: string; qty: number; unit: string; aisle: SupermarketAisle; isPantry: boolean; estPrice: number }
    >();

    activeDishes.forEach((dish, dayIdx) => {
      if (skippedDays[dayIdx]) return;
      const portionsPerDish = (effectiveSlotPeople[dayIdx] ?? peopleCount) * 2;
      dish.ingredients.forEach((ing) => {
        if (deductPantry && ing.isPantry) return;
        const key = `${ing.aisle}__${ing.name}__${ing.unit}`;
        const existing = map.get(key);
        const addedQty = ing.qty * portionsPerDish;
        const addedPrice = (ing.pricePerPortion || 0) * portionsPerDish * supermarketMult;
        if (existing) {
          existing.qty += addedQty;
          existing.estPrice += addedPrice;
        } else {
          map.set(key, {
            name: ing.name,
            qty: addedQty,
            unit: ing.unit,
            aisle: ing.aisle,
            isPantry: Boolean(ing.isPantry),
            estPrice: addedPrice,
          });
        }
      });
    });

    return AISLE_ORDER.map((aisle) => {
      const items = Array.from(map.values())
        .filter((i) => i.aisle === aisle)
        .sort((a, b) => a.name.localeCompare(b.name));
      const aisleTotal = items.reduce((sum, i) => sum + i.estPrice, 0);
      return { aisle, label: AISLE_LABELS[aisle], items, aisleTotal };
    }).filter((g) => g.items.length > 0);
  }, [activeDishes, peopleCount, effectiveSlotPeople, deductPantry, skippedDays, supermarketMult]);

  const shareGroceryList = async () => {
    const lines: string[] = [
      `Liste de courses MacroBatch (~${estimatedWeeklyCost.toFixed(0)} € pour ${totalWeeklyPortions} portions)`,
      "",
    ];
    groceryByAisle.forEach((group) => {
      const remaining = group.items.filter(
        (item) => !checkedGroceries[`${group.aisle}-${item.name}`]
      );
      if (remaining.length === 0) return;
      lines.push(`• ${group.label.toUpperCase()}`);
      remaining.forEach((item) => {
        lines.push(`  - ${item.name} (${formatQty(item.qty, item.unit)})`);
      });
      lines.push("");
    });
    const remainingCustom = customCartItems.filter((c) => !c.checked);
    if (remainingCustom.length > 0) {
      lines.push("• ARTICLES PERSO");
      remainingCustom.forEach((c) => lines.push(`  - ${c.name}`));
    }
    const text = lines.join("\n").trim();
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Liste de courses MacroBatch", text });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showToast("Liste de courses copiée !");
        return;
      }
    } catch {
      // User cancelled share or clipboard blocked
    }
  };

  // ================================================================
  // FRIDGE & PANTRY PHOTO SCANNER LOGIC (VISION AI + CATALOG PRIORITY + GROCERY DEDUCTION)
  // ================================================================
  const openScannerModal = (
    zone: "frigo" | "placard" | "ticket" = "frigo",
    initialStep: 1 | 2 | 3 = 1
  ) => {
    setScanZone(zone);
    setScanStep(initialStep);
    setIsAnalyzingPhoto(false);
    setTempDetectedIds(inStockIds);
    setTempCustomTerms(customStockTerms);
    setIsScannerOpen(true);
  };

  // Compress image on canvas & extract RGB color ratios for local fallback + fast Vision API upload
  const processImageFile = async (
    file: File
  ): Promise<{
    dataUrl: string;
    colorStats: { greenRatio: number; warmRatio: number; brightRatio: number; earthyRatio: number };
  }> => {
    const drawSourceToCanvas = (source: CanvasImageSource, srcW: number, srcH: number) => {
      const maxDim = 800;
      let w = srcW;
      let h = srcH;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      let greenCount = 0;
      let warmCount = 0;
      let brightCount = 0;
      let earthyCount = 0;
      let totalSampled = 1;

      if (ctx) {
        ctx.drawImage(source, 0, 0, w, h);
        try {
          const imgData = ctx.getImageData(0, 0, w, h).data;
          const step = 16;
          totalSampled = 0;
          for (let i = 0; i < imgData.length; i += 4 * step) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            totalSampled++;
            if (g > r * 1.12 && g > b * 1.12 && g > 55) greenCount++;
            if (r > g * 1.18 && r > b * 1.3 && r > 90) warmCount++;
            if (r > 195 && g > 195 && b > 185) brightCount++;
            if (r > 95 && g > 70 && b < 90 && Math.abs(r - g) < 55) earthyCount++;
          }
        } catch {
          // Ignore pixel read error
        }
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      return {
        dataUrl,
        colorStats: {
          greenRatio: Number((greenCount / Math.max(1, totalSampled)).toFixed(3)),
          warmRatio: Number((warmCount / Math.max(1, totalSampled)).toFixed(3)),
          brightRatio: Number((brightCount / Math.max(1, totalSampled)).toFixed(3)),
          earthyRatio: Number((earthyCount / Math.max(1, totalSampled)).toFixed(3)),
        },
      };
    };

    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        const result = drawSourceToCanvas(bitmap, bitmap.width, bitmap.height);
        bitmap.close();
        return result;
      } catch {
        // Fallback to FileReader + HTMLImageElement below
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Erreur lecture fichier"));
      reader.onload = () => {
        const img = new window.Image();
        img.onerror = () => reject(new Error("Erreur chargement image"));
        img.onload = () => resolve(drawSourceToCanvas(img, img.width, img.height));
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingPhoto(true);
    setVisionSummary(null);

    try {
      const { dataUrl, colorStats } = await processImageFile(file);
      setScanPhotoPreview(dataUrl);

      const response = await fetch("/api/scan-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: "image/jpeg",
          zone:
            scanZone === "ticket"
              ? "receipt"
              : scanZone === "frigo"
              ? "fridge"
              : "pantry",
          apiKey: visionApiKey,
          colorStats,
          fileName: file.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const detectedIds: string[] = Array.isArray(data.detectedPresetIds)
          ? data.detectedPresetIds
          : [];
        const customItems: string[] = Array.isArray(data.customIngredients)
          ? data.customIngredients
          : [];
        setTempDetectedIds((prev) => Array.from(new Set([...prev, ...detectedIds])));
        if (customItems.length > 0) {
          setTempCustomTerms((prev) => Array.from(new Set([...prev, ...customItems])));
        }
        setVisionMode(data.mode || "local-vision");
        setVisionSummary(
          data.summary ||
            `${detectedIds.length + customItems.length} ingrédients identifiés sur la photo.`
        );
        if (data.warning) {
          showToast("IA indisponible — mode local utilisé");
        } else {
          showToast(
            `${detectedIds.length + customItems.length} ingrédient(s) détecté(s)`
          );
        }
        setScanStep(2);
      } else {
        const errData = await response.json().catch(() => ({}));
        setVisionSummary(errData?.error || `Erreur serveur (${response.status})`);
        showToast("Erreur lors de l'analyse IA");
      }
    } catch {
      setVisionSummary("Impossible de lire cette photo. Réessayez avec une autre image.");
      showToast("Erreur lors du traitement de la photo");
    } finally {
      setIsAnalyzingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const simulateDetectionForZone = (zone: "frigo" | "placard" | "ticket") => {
    setScanZone(zone);
    setIsAnalyzingPhoto(true);
    setTimeout(() => {
      setIsAnalyzingPhoto(false);
      const defaults =
        zone === "frigo"
          ? ["skyr", "poulet", "brocoli", "courgette", "oeufs"]
          : zone === "ticket"
          ? ["poulet", "riz", "tomate", "feta", "citron"]
          : ["riz", "quinoa", "lentilles", "lait_coco", "patate_douce"];
      setTempDetectedIds((prev) => Array.from(new Set([...prev, ...defaults])));
      setVisionMode("demo");
      setVisionSummary(
        zone === "frigo"
          ? "Exemple frigo : Poulet, Skyr, Œufs, Brocolis, Courgettes."
          : zone === "ticket"
          ? "Exemple ticket : Poulet, Riz, Tomates, Feta, Citrons."
          : "Exemple placard : Riz, Quinoa, Lentilles corail, Lait de coco, Patates douces."
      );
      setScanStep(2);
    }, 450);
  };

  const toggleTempDetected = (id: string) => {
    setTempDetectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Parse a spoken or typed natural French sentence ("il me reste du poulet, des courgettes, du skyr et du saumon")
  const parseNaturalSentenceToStock = (rawText: string) => {
    const lower = rawText.toLowerCase();
    const matchedPresetIds: string[] = [];
    const matchedLabels: string[] = [];

    allStockPresets.forEach((preset) => {
      if (preset.keywords.some((kw) => lower.includes(kw))) {
        matchedPresetIds.push(preset.id);
        matchedLabels.push(preset.label);
      }
    });

    // Extra culinary vocabulary not in the 18 presets
    const extraVocab = [
      "saumon",
      "thon",
      "cabillaud",
      "crevette",
      "boeuf",
      "bœuf",
      "steak",
      "poivron",
      "épinard",
      "epinard",
      "champignon",
      "avocat",
      "pâtes",
      "pates",
      "haricots verts",
      "mozzarella",
      "parmesan",
      "lardon",
      "jambon",
    ];
    const extraFound: string[] = [];
    extraVocab.forEach((word) => {
      if (lower.includes(word)) {
        const cap = word.charAt(0).toUpperCase() + word.slice(1);
        const alreadyCovered = allStockPresets.some((p) =>
          p.keywords.some((kw) => kw.includes(word) || word.includes(kw))
        );
        if (!alreadyCovered && !extraFound.includes(cap)) {
          extraFound.push(cap);
        }
      }
    });

    if (matchedPresetIds.length > 0) {
      setTempDetectedIds((prev) => Array.from(new Set([...prev, ...matchedPresetIds])));
    }
    if (extraFound.length > 0) {
      setTempCustomTerms((prev) => Array.from(new Set([...prev, ...extraFound])));
    }

    const totalFound = matchedPresetIds.length + extraFound.length;
    if (totalFound > 0) {
      setVisionMode("voice");
      setVisionSummary(
        `Dictée analysée (${totalFound}) : ${[...matchedLabels, ...extraFound].join(", ")}`
      );
      showToast(`${totalFound} ingrédient${totalFound > 1 ? "s" : ""} détecté${totalFound > 1 ? "s" : ""} par la voix`);
    }
    return totalFound;
  };

  // Start / Stop native browser SpeechRecognition (0€ cost, instant)
  const toggleVoiceDictation = () => {
    if (isListeningVoice) {
      const rec = speechRecRef.current as { stop?: () => void } | null;
      if (rec && typeof rec.stop === "function") rec.stop();
      setIsListeningVoice(false);
      return;
    }

    const win = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : {};
    const SpeechRecCtor = (win.SpeechRecognition || win.webkitSpeechRecognition) as
      | (new () => {
          lang: string;
          continuous: boolean;
          interimResults: boolean;
          onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
          onerror: (() => void) | null;
          onend: (() => void) | null;
          start: () => void;
          stop: () => void;
        })
      | undefined;

    if (!SpeechRecCtor) {
      // Fallback simulation if browser doesn't expose Web Speech API or mic in sandbox
      const samplePhrase =
        scanZone === "frigo"
          ? "Il me reste des filets de poulet, du skyr, des œufs, des courgettes et un brocoli"
          : "J'ai du riz basmati, des lentilles corail, du lait de coco et des patates douces";
      setVoiceTranscript(samplePhrase);
      parseNaturalSentenceToStock(samplePhrase);
      return;
    }

    try {
      const recognition = new SpeechRecCtor();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = true;
      speechRecRef.current = recognition;
      setIsListeningVoice(true);
      setVoiceTranscript("Parlez maintenant : « Il me reste du poulet, des courgettes, du riz... »");

      let latestText = "";
      recognition.onresult = (event) => {
        let txt = "";
        for (let i = 0; i < event.results.length; i++) {
          txt += event.results[i][0].transcript + " ";
        }
        latestText = txt.trim();
        setVoiceTranscript(latestText);
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        const fallbackPhrase =
          scanZone === "frigo"
            ? "Il me reste du poulet, du skyr, des œufs et des brocolis"
            : "J'ai du riz basmati, des lentilles corail et du lait de coco";
        setVoiceTranscript(fallbackPhrase);
        parseNaturalSentenceToStock(fallbackPhrase);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
        if (latestText) {
          parseNaturalSentenceToStock(latestText);
        }
      };

      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  const addCustomIngredientTerm = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    // Check if the user typed a natural sentence or multiple ingredients
    const foundCount = parseNaturalSentenceToStock(trimmed);
    if (foundCount === 0 && !tempCustomTerms.includes(trimmed)) {
      setTempCustomTerms((prev) => [...prev, trimmed]);
    }
    setCustomInput("");
  };

  const removeCustomIngredientTerm = (term: string) => {
    setTempCustomTerms((prev) => prev.filter((t) => t !== term));
  };

  // Apply detected stock: 1) Prioritize matching dishes in Catalog (or auto-fill week), 2) Auto-check groceries
  const applyScannedStock = (autoFillWeek: boolean) => {
    setInStockIds(tempDetectedIds);
    setCustomStockTerms(tempCustomTerms);

    // Automatically check off matching items in the grocery list
    const nextChecked: Record<string, boolean> = { ...checkedGroceries };
    groceryByAisle.forEach((g) => {
      g.items.forEach((item) => {
        if (isIngredientInStock(item.name, tempDetectedIds, tempCustomTerms)) {
          nextChecked[`${g.aisle}-${item.name}`] = true;
        }
      });
    });
    setCheckedGroceries(nextChecked);

    if (autoFillWeek && (tempDetectedIds.length > 0 || tempCustomTerms.length > 0)) {
      // Pick top 5 compatible dishes that use the most ingredients from the user's fridge/pantry
      const compatible = RECIPE_DATABASE.filter((r) => {
        if (diet === "vege" && r.diet !== "vege" && r.diet !== "both") return false;
        if (diet === "pesco" && r.diet === "omni") return false;
        return true;
      }).sort(
        (a, b) =>
          getRecipeStockMatches(b, tempDetectedIds, tempCustomTerms).length -
          getRecipeStockMatches(a, tempDetectedIds, tempCustomTerms).length
      );

      const top5 = compatible.slice(0, 5).map((r) => r.id);
      if (top5.length === 5) {
        setWeekSlots(top5);
      }
      setIsScannerOpen(false);
      showToast("Semaine composée avec les ingrédients de votre frigo/placard");
      return;
    }

    setIsScannerOpen(false);
    setIsCatalogOpen(true);
    showToast("Catalogue trié en priorité selon votre stock");
  };

  const totalCheckedCount = Object.values(checkedGroceries).filter(Boolean).length;
  const totalGroceryCount = groceryByAisle.reduce((acc, g) => acc + g.items.length, 0);
  const doneStepsCount = dynamicBatchTimeline.filter((s) => doneSteps[s.stepNumber]).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-28">
      {/* Subtle Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Mobile-First App Container */}
      <div className="max-w-[440px] mx-auto min-h-screen bg-[#FAF8F5] relative">
        {/* Warm Minimalist Sticky Header */}
        <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EDE8E0] px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight leading-none text-[#1C1917]">
              {tab === "home" ? "Salut !" : "MacroBatch"}
            </h1>
            <p className="text-xs font-medium text-[#78716C] mt-0.5">
              {tab === "home"
                ? "Qu’est-ce qu’on cuisine ?"
                : `${totalWeeklyPortions} portions • ~${avgCostPerMeal.toFixed(2).replace(".", ",")} € / repas`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Préférences"
              className="tap-scale h-9 px-3 rounded-full bg-white border border-[#E7E2DA] flex items-center gap-1.5 text-xs font-bold text-[#1C1917] hover:bg-stone-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{SUPERMARKET_CONFIG[supermarket].label}</span>
            </button>
          </div>
        </header>

        {/* ================================================================
            TAB 0: ACCUEIL (YUMABATCH — CLAIR, CHALEUREUX, SANS FRICTION)
            ================================================================ */}
        {tab === "home" && (
          <main className="px-4 pt-4 space-y-5">
            {/* Warm Lemon-Yellow Hero Card */}
            <section className="bg-[#FEF3C7] border border-[#F5B731]/35 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#92400E] bg-[#FDE68A]/70 px-2.5 py-0.5 rounded-full">
                  Menus & Courses chiffrées
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1C1917] leading-tight pt-1">
                  Ta semaine prête en 10 sec
                </h2>
                <p className="text-xs text-[#78350F]/85 leading-relaxed">
                  {skippedDays.filter((s) => !s).length} dîners prévus pour {peopleCount} pers. •{" "}
                  <strong className="font-mono-tabular">~{estimatedWeeklyCost.toFixed(0)} €</strong> estimés chez {SUPERMARKET_CONFIG[supermarket].label}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    generateSmartWeekMenu();
                    setTab("menu");
                  }}
                  className="tap-scale py-3 px-3 rounded-2xl bg-[#141414] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#FCD34D]" />
                  <span>Générer mon menu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("menu")}
                  className="tap-scale py-3 px-3 rounded-2xl bg-white text-[#1C1917] border border-[#E7E2DA] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#92400E]" />
                  <span>Voir la semaine</span>
                </button>
              </div>
            </section>

            {/* Aujourd'hui (Plat du jour) */}
            {activeDishes[0] && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Aujourd’hui
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTab("menu")}
                    className="text-xs font-bold text-[#92400E] hover:underline cursor-pointer"
                  >
                    Voir la semaine →
                  </button>
                </div>

                <article
                  onClick={() => setSelectedRecipe(activeDishes[0])}
                  className="bg-white rounded-3xl overflow-hidden border border-[#EDE8E0] shadow-xs flex items-center gap-3.5 p-3 cursor-pointer tap-scale"
                >
                  <img
                    src={activeDishes[0].image}
                    alt={activeDishes[0].shortName}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                      Lundi • {effectiveSlotPeople[0] ?? peopleCount} pers.
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#1C1917] truncate mt-0.5">
                      {activeDishes[0].shortName}
                    </h4>
                    <p className="text-xs text-[#78716C] mt-0.5 font-mono-tabular">
                      {getDishProtein(activeDishes[0])}g prot • {activeDishes[0].cookMethodLabel}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#78716C] shrink-0 mr-1" />
                </article>
              </section>
            )}

            {/* Carrousel horizontal d'inspirations (style Zest / Jow) */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                  {totalStockCount > 0 ? "Idées avec ton stock" : "Inspirations du moment"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCatalogOpen(true)}
                  className="text-xs font-bold text-[#92400E] hover:underline cursor-pointer"
                >
                  Tout voir →
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
                {filteredCatalog.slice(0, 6).map((recipe) => {
                  const matches = getRecipeStockMatches(recipe);
                  const isFav = favoriteIds.includes(recipe.id);
                  return (
                    <article
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="w-40 shrink-0 snap-start bg-white rounded-3xl overflow-hidden border border-[#EDE8E0] shadow-2xs cursor-pointer tap-scale"
                    >
                      <div className="relative aspect-[4/3] bg-stone-100">
                        <img
                          src={recipe.image}
                          alt={recipe.shortName}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {matches.length > 0 && (
                          <span className="absolute top-2 left-2 bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {matches.length} en stock
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipe.id);
                          }}
                          aria-label="Favori"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isFav ? "fill-[#FF5A36] text-[#FF5A36]" : "text-[#141414]"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs font-bold text-[#141414] truncate">
                          {recipe.shortName}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 font-mono-tabular">
                          {getDishProtein(recipe)}g prot • {(recipe.cost[budgetTier] * supermarketMult).toFixed(2).replace(".", ",")} €
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Accès rapides Courses & Batch */}
            <section className="space-y-2.5">
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Prêt pour la semaine
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTab("cart")}
                  className="tap-scale bg-white rounded-3xl border border-[#EDE8E0] p-4 text-left space-y-2 shadow-2xs cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-2xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#141414] block">
                      Mes courses
                    </strong>
                    <span className="text-xs text-stone-500 font-mono-tabular">
                      {Math.max(0, totalGroceryCount - totalCheckedCount)} articles • ~{estimatedWeeklyCost.toFixed(0)} €
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("prep")}
                  className="tap-scale bg-white rounded-3xl border border-[#EDE8E0] p-4 text-left space-y-2 shadow-2xs cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-2xl bg-[#141414] text-[#F5B731] flex items-center justify-center">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#141414] block">
                      Cuisiner
                    </strong>
                    <span className="text-xs text-stone-500 font-mono-tabular">
                      Batch {totalBatchMinutes} min • {dynamicBatchTimeline.length} étapes
                    </span>
                  </div>
                </button>
              </div>
            </section>
          </main>
        )}

        {/* ================================================================
            TAB 1: SEMAINE (YUMA + BATCH — CLAIR & IMMÉDIAT)
            ================================================================ */}
        {tab === "menu" && (
          <main className="px-4 pt-4 space-y-5">

            {/* Yuma-Style Week Switcher (Cette semaine / Semaine prochaine) */}
            <div className="bg-white border border-[#EDE8E0] rounded-2xl p-1.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
                aria-label="Semaine en cours"
                className="w-8 h-8 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#141414] disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-xs font-extrabold text-[#141414] block">
                  {weekOffset === 0 ? "Cette semaine" : "Semaine prochaine"}
                </span>
                <span className="text-[10px] font-semibold text-stone-500">
                  {skippedDays.filter((s) => !s).length} dîners prévus • {SUPERMARKET_CONFIG[supermarket].label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setWeekOffset(1)}
                disabled={weekOffset === 1}
                aria-label="Semaine prochaine"
                className="w-8 h-8 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#141414] disabled:opacity-30 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Yuma-Inspired Weekly Budget Gauge */}
            <div className="bg-white border border-[#EDE8E0] rounded-3xl p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hover:text-[#141414] block text-left cursor-pointer"
                    >
                      Budget {SUPERMARKET_CONFIG[supermarket].label} ▾
                    </button>
                    <div className="flex items-baseline gap-1.5">
                      <strong className="text-base font-extrabold text-[#141414] font-mono-tabular">
                        ~{estimatedWeeklyCost.toFixed(0)} €
                      </strong>
                      <span className="text-xs text-stone-500 font-mono-tabular">
                        / {weeklyBudget} € cible
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setWeeklyBudget((b) => Math.max(20, b - 5))}
                    className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#EDE8E0] text-xs font-extrabold text-[#141414] cursor-pointer"
                    aria-label="Réduire budget"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeeklyBudget((b) => Math.min(200, b + 5))}
                    className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#EDE8E0] text-xs font-extrabold text-[#141414] cursor-pointer"
                    aria-label="Augmenter budget"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#EDE8E0]/60">
                <div
                  className={`h-full rounded-full transition-all ${
                    estimatedWeeklyCost <= weeklyBudget
                      ? "bg-[#059669]"
                      : estimatedWeeklyCost <= weeklyBudget * 1.15
                      ? "bg-[#F5B731]"
                      : "bg-[#FF5A36]"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((estimatedWeeklyCost / Math.max(1, weeklyBudget)) * 100))}%`,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => generateSmartWeekMenu()}
                className="tap-scale w-full py-2 rounded-2xl bg-[#FAF8F5] hover:bg-[#FEF3C7]/60 border border-[#EDE8E0] text-xs font-bold text-[#141414] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Composer un menu sous {weeklyBudget} €</span>
              </button>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#1C1917]">
                Au menu
              </h2>
              {hasCustomDayPeople && (
                <button
                  type="button"
                  onClick={() => {
                    setSlotPeopleCounts([null, null, null, null, null]);
                    showToast(`Tous les jours remis à ${peopleCount} pers.`);
                  }}
                  className="text-xs font-bold text-[#D97706] cursor-pointer"
                >
                  Remettre à {peopleCount}P
                </button>
              )}
            </div>

            {/* Large Photo-First Dish Cards */}
            <div className="space-y-4">
              {activeDishes.map((dish, idx) => {
                const isSkipped = Boolean(skippedDays[idx]);
                if (isSkipped) {
                  return (
                    <div
                      key={`skipped-${idx}`}
                      className="bg-white/70 border border-dashed border-[#D6D0C4] rounded-3xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-extrabold text-[#141414] block">
                          {DAYS_FULL[idx]} • Pas de cuisine ce soir
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Ingrédients déduits de vos courses et du budget
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSkippedDays((prev) =>
                            prev.map((s, i) => (i === idx ? false : s))
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-[#141414] text-white text-xs font-bold cursor-pointer"
                      >
                        Réactiver
                      </button>
                    </div>
                  );
                }

                const stockUsed = getRecipeStockMatches(dish);
                const dayPeople = effectiveSlotPeople[idx] ?? peopleCount;
                const isCustomDay =
                  slotPeopleCounts[idx] !== null && slotPeopleCounts[idx] !== peopleCount;
                const isFav = favoriteIds.includes(dish.id);
                return (
                  <article
                    key={`${dish.id}-${idx}`}
                    onClick={() => setSelectedRecipe(dish)}
                    className="bg-white rounded-3xl overflow-hidden border border-[#EDE8E0] shadow-xs cursor-pointer"
                  >
                    <div className="relative aspect-[16/9] bg-stone-100">
                      <img
                        src={dish.image}
                        alt={dish.shortName}
                        loading={idx > 1 ? "lazy" : "eager"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15 pointer-events-none" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-white/95 backdrop-blur-xs text-[#1C1917] text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                          {DAYS_FULL[idx]}
                        </span>
                        {isCustomDay && (
                          <span className="bg-[#F5B731] text-[#141414] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                            {dayPeople > peopleCount ? "Invités" : "Ajusté"}
                          </span>
                        )}
                        {stockUsed.length > 0 && (
                          <span className="bg-[#059669] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                            Frigo
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(dish.id);
                          }}
                          aria-label="Favori"
                          className="tap-scale w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav ? "fill-[#FF5A36] text-[#FF5A36]" : "text-[#141414]"
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickSwapDayIdx(idx);
                          }}
                          className="tap-scale bg-white/95 backdrop-blur-xs text-[#141414] text-xs font-bold px-3 py-1.5 rounded-full shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Échanger</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-serif text-lg font-bold text-[#1C1917] truncate leading-snug">
                          {dish.shortName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-[#78716C] font-mono-tabular">
                            {getDishProtein(dish)}g prot • {(dish.cost[budgetTier] * supermarketMult).toFixed(2).replace(".", ",")} € / part
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSkippedDays((prev) =>
                                prev.map((s, i) => (i === idx ? true : s))
                              );
                            }}
                            className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 underline cursor-pointer"
                          >
                            Sauter
                          </button>
                        </div>
                      </div>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 bg-[#FAF8F5] border border-[#EDE8E0] rounded-full p-0.5 shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => updateDayPeopleCount(idx, -1)}
                          disabled={dayPeople <= 1}
                          className="tap-scale w-7 h-7 rounded-full bg-white text-[#1C1917] font-extrabold flex items-center justify-center shadow-2xs disabled:opacity-35 cursor-pointer"
                          aria-label={`Réduire convives ${DAYS_FULL[idx]}`}
                        >
                          −
                        </button>
                        <span className="min-w-[30px] text-center text-xs font-extrabold text-[#1C1917] font-mono-tabular">
                          {dayPeople}P
                        </span>
                        <button
                          type="button"
                          onClick={() => updateDayPeopleCount(idx, 1)}
                          disabled={dayPeople >= 12}
                          className="tap-scale w-7 h-7 rounded-full bg-white text-[#1C1917] font-extrabold flex items-center justify-center shadow-2xs disabled:opacity-35 cursor-pointer"
                          aria-label={`Ajouter convives ${DAYS_FULL[idx]}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Primary CTA at end of menu */}
            <button
              type="button"
              onClick={() => setTab("cart")}
              className="tap-scale w-full py-3.5 rounded-2xl bg-[#141414] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Faire mes courses ({Math.max(0, totalGroceryCount - totalCheckedCount)} articles)</span>
              <ArrowRight className="w-4 h-4 text-[#F5B731]" />
            </button>
          </main>
        )}

        {/* ================================================================
            TAB 3: COURSES (AVEC SYNCHRO DU STOCK SCANNÉ)
            ================================================================ */}
        {tab === "cart" && (
          <main className="px-4 pt-4 space-y-4">
            {/* Grocery List Header (Budget + Share + Deductions) */}
            <div className="bg-white rounded-3xl p-4 border border-[#EDE8E0] space-y-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#141414]">
                    Reste à acheter ({Math.max(0, totalGroceryCount - totalCheckedCount)})
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5 font-mono-tabular">
                    ~{estimatedWeeklyCost.toFixed(0)} € estimés / {weeklyBudget} € budget • {totalCheckedCount} en stock ou cochés
                  </p>
                </div>
                <button
                  type="button"
                  onClick={shareGroceryList}
                  className="tap-scale px-3 py-1.5 rounded-full bg-[#141414] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#F5B731]" />
                  <span>Partager</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => openScannerModal("frigo")}
                  className="tap-scale px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeductPantry((prev) => !prev)}
                  className={`tap-scale px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                    deductPantry
                      ? "bg-[#ECFDF5] text-[#059669] border-[#059669]/30"
                      : "bg-[#FAF8F5] text-stone-600 border-[#EDE8E0]"
                  }`}
                >
                  {deductPantry ? "Épices déduites" : "Avec épices"}
                </button>
                <button
                  type="button"
                  onClick={() => setHideCheckedCart((prev) => !prev)}
                  className={`tap-scale px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                    hideCheckedCart
                      ? "bg-[#141414] text-white border-[#141414]"
                      : "bg-[#FAF8F5] text-stone-600 border-[#EDE8E0]"
                  }`}
                >
                  {hideCheckedCart ? "Voir tout" : "Masquer cochés"}
                </button>
              </div>

              {/* Barre de progression caddie */}
              <div className="h-1.5 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#EDE8E0]/60">
                <div
                  className="h-full rounded-full bg-[#059669] transition-all"
                  style={{
                    width: `${totalGroceryCount > 0 ? Math.min(100, Math.round((totalCheckedCount / totalGroceryCount) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Add Custom Grocery Item (Yuma-inspired) */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCartItemText}
                onChange={(e) => setNewCartItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCartItem();
                  }
                }}
                placeholder="Ajouter un article perso (café, sopalin...)"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#EDE8E0] text-xs text-[#141414] placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
              />
              <button
                type="button"
                onClick={addCustomCartItem}
                aria-label="Ajouter article"
                className="tap-scale px-4 py-2.5 rounded-2xl bg-[#141414] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-[#F5B731]" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* Custom Personal Items Section */}
            {customCartItems.length > 0 && (
              <section className="bg-white rounded-3xl border border-[#EDE8E0] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#FEF3C7]/45 border-b border-[#EDE8E0] flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#92400E]">
                    Articles perso
                  </h3>
                  <span className="text-xs font-bold text-[#92400E]">
                    {customCartItems.length}
                  </span>
                </div>
                <div className="divide-y divide-[#EDE8E0]/60">
                  {customCartItems
                    .filter((item) => !hideCheckedCart || !item.checked)
                    .map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setCustomCartItems((prev) =>
                            prev.map((c) =>
                              c.id === item.id ? { ...c, checked: !c.checked } : c
                            )
                          )
                        }
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            item.checked
                              ? "bg-[#059669] border-[#059669] text-white"
                              : "border-stone-300 bg-white"
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span
                          className={`text-sm font-medium truncate ${
                            item.checked ? "line-through text-stone-400" : "text-[#141414]"
                          }`}
                        >
                          {item.name}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomCartItems((prev) => prev.filter((c) => c.id !== item.id))
                        }
                        aria-label="Supprimer article"
                        className="w-7 h-7 rounded-full text-stone-400 hover:text-stone-700 flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="space-y-4">
              {groceryByAisle.map((group) => {
                const visibleItems = hideCheckedCart
                  ? group.items.filter((item) => !checkedGroceries[`${group.aisle}-${item.name}`])
                  : group.items;
                if (visibleItems.length === 0) return null;
                return (
                <section
                  key={group.aisle}
                  className="bg-white rounded-3xl border border-[#EDE8E0] overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#EDE8E0] flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                      {group.label}
                    </h3>
                    <div className="flex items-center gap-2">
                      {group.aisleTotal > 0 && (
                        <span className="text-xs font-extrabold text-[#141414] font-mono-tabular">
                          ~{group.aisleTotal.toFixed(2).replace(".", ",")} €
                        </span>
                      )}
                      <span className="text-xs font-bold text-stone-400">
                        {visibleItems.length}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-[#EDE8E0]/60">
                    {visibleItems.map((item) => {
                      const key = `${group.aisle}-${item.name}`;
                      const isChecked = Boolean(checkedGroceries[key]);
                      const fromStock = isIngredientInStock(item.name);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setCheckedGroceries((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAF8F5] cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? "bg-[#059669] border-[#059669] text-white"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <span
                                className={`text-sm font-medium block truncate ${
                                  isChecked
                                    ? "line-through text-stone-400"
                                    : "text-[#141414]"
                                }`}
                              >
                                {item.name}
                              </span>
                              {fromStock && (
                                <span className="text-[10px] font-bold text-[#059669] block">
                                  Détecté dans votre stock
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-stone-700 font-mono-tabular block">
                              {formatQty(item.qty, item.unit)}
                            </span>
                            {item.estPrice > 0 && (
                              <span className="text-[11px] font-semibold text-stone-400 font-mono-tabular block">
                                ~{item.estPrice.toFixed(2).replace(".", ",")} €
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
                );
              })}
            </div>
          </main>
        )}

        {/* ================================================================
            TAB 4: PRÉPARATION DYNAMIQUE (ADAPTÉE AUX 5 PLATS CHOISIS)
            ================================================================ */}
        {tab === "prep" && (
          <main className="px-4 pt-4 space-y-4">
            <div className="bg-[#EDE8E0]/70 p-1 rounded-2xl flex">
              <button
                type="button"
                onClick={() => setPrepMode("batch")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  prepMode === "batch"
                    ? "bg-white text-[#141414] shadow-2xs"
                    : "text-stone-600"
                }`}
              >
                Session Batch ({totalBatchMinutes} min)
              </button>
              <button
                type="button"
                onClick={() => setPrepMode("recipes")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  prepMode === "recipes"
                    ? "bg-white text-[#141414] shadow-2xs"
                    : "text-stone-600"
                }`}
              >
                Fiches Recettes ({activeDishes.length})
              </button>
            </div>

            {prepMode === "batch" ? (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-4 border border-[#EDE8E0] space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#92400E] block">
                        Plan d&apos;action sur-mesure
                      </span>
                      <h2 className="font-serif text-lg font-bold text-[#141414]">
                        {dynamicBatchTimeline.length} étapes pour vos plats
                      </h2>
                    </div>
                    <span className="text-xs font-extrabold bg-[#FEF3C7] text-[#92400E] px-2.5 py-1 rounded-full font-mono-tabular">
                      {doneStepsCount} / {dynamicBatchTimeline.length}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#EDE8E0]/60">
                    <div
                      className="h-full rounded-full bg-[#059669] transition-all"
                      style={{
                        width: `${dynamicBatchTimeline.length > 0 ? Math.min(100, Math.round((doneStepsCount / dynamicBatchTimeline.length) * 100)) : 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set(activeDishes.map((d) => d.cookMethodLabel))).map(
                      (station) => (
                        <span
                          key={station}
                          className="text-[11px] font-bold bg-[#FEF3C7]/70 text-[#92400E] px-2.5 py-1 rounded-lg"
                        >
                          {station}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {dynamicBatchTimeline.map((step) => {
                  const isDone = Boolean(doneSteps[step.stepNumber]);
                  return (
                    <article
                      key={step.stepNumber}
                      className={`bg-white rounded-3xl overflow-hidden border border-[#EDE8E0] transition-opacity ${
                        isDone ? "opacity-55" : ""
                      }`}
                    >
                      <div className="relative aspect-video bg-stone-900">
                        <img
                          src={step.image}
                          alt={step.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#141414]/85 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#F5B731]" />
                          <span>
                            Étape {step.stepNumber}/{dynamicBatchTimeline.length} •{" "}
                            {step.durationMin} min
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                            {step.station}
                          </span>
                          <h3 className="font-serif text-base font-bold text-[#141414] mt-0.5">
                            {step.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {step.dishBadges.map((b, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-bold bg-[#FAF8F5] border border-[#EDE8E0] text-stone-700 px-2 py-0.5 rounded-md"
                            >
                              {b}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed">
                          {step.description}
                        </p>

                        {step.ingredientPills.length > 0 && (
                          <div className="bg-[#FAF8F5] rounded-2xl p-2.5 border border-[#EDE8E0] flex flex-wrap gap-1.5">
                            {step.ingredientPills.map((pill, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-semibold bg-white text-[#141414] px-2 py-0.5 rounded-md border border-[#EDE8E0] font-mono-tabular"
                              >
                                {pill}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setDoneSteps((prev) => ({
                              ...prev,
                              [step.stepNumber]: !prev[step.stepNumber],
                            }))
                          }
                          className={`tap-scale w-full py-3 rounded-2xl text-xs font-bold cursor-pointer ${
                            isDone
                              ? "bg-[#059669] text-white"
                              : "bg-[#141414] text-white"
                          }`}
                        >
                          {isDone ? "Étape terminée ✓" : "Marquer comme fait"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {activeDishes.map((dish, idx) => {
                  const dayPeople = effectiveSlotPeople[idx] ?? peopleCount;
                  const dayPortions = dayPeople * 2;
                  return (
                  <article
                    key={`${dish.id}-${idx}`}
                    className="bg-white rounded-3xl overflow-hidden border border-[#EDE8E0]"
                  >
                    <div className="relative aspect-video bg-stone-100">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#141414]/85 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {DAYS_FULL[idx]} • {dayPeople}P
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-stone-400">
                          {dish.cookMethodLabel} • {dayPortions} portions ({dayPeople} pers.)
                        </span>
                        <h3 className="font-serif text-base font-bold text-[#141414] mt-0.5">
                          {dish.name}
                        </h3>
                      </div>

                      <div className="bg-[#FAF8F5] rounded-2xl p-3 space-y-1.5 border border-[#EDE8E0]">
                        {dish.ingredients.map((ing, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-stone-700">{ing.name}</span>
                            <strong className="font-bold text-[#141414] font-mono-tabular">
                              {formatQty(ing.qty * dayPortions, ing.unit)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#ECFDF5] text-[#065F46] text-xs p-3 rounded-2xl leading-relaxed">
                        <strong className="font-bold block mb-0.5">
                          Conservation & réchauffage
                        </strong>
                        {dish.assemblyTip}
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            )}
          </main>
        )}

        {/* ================================================================
            BOTTOM TAB BAR (ACCUEIL • SEMAINE • COURSES • CUISINER)
            ================================================================ */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE8E0] px-2 pt-2 pb-safe grid grid-cols-4 items-center">
          {[
            { id: "home", label: "Accueil", icon: Home, badge: 0 },
            { id: "menu", label: "Semaine", icon: Calendar, badge: 0 },
            {
              id: "cart",
              label: "Courses",
              icon: ShoppingBag,
              badge: Math.max(
                0,
                totalGroceryCount -
                  Object.values(checkedGroceries).filter(Boolean).length
              ),
            },
            {
              id: "prep",
              label: "Cuisiner",
              icon: ChefHat,
              badge: Math.max(0, dynamicBatchTimeline.length - doneStepsCount),
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as TabKey)}
                className={`tap-scale relative flex flex-col items-center gap-1 py-1 rounded-xl cursor-pointer transition-colors ${
                  isActive ? "text-[#141414]" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.4]" : ""}`} />
                  {item.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center leading-none ${
                        isActive
                          ? "bg-[#F5B731] text-[#141414]"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================================================================
          CATALOGUE DRAWER MODAL (OUVERT QUAND ON CHANGE UN PLAT)
          ================================================================ */}
      {isCatalogOpen && (
        <div
          onClick={() => {
            setIsCatalogOpen(false);
            setSwapSlotIndex(null);
          }}
          className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-end sm:items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F8F9FA] w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl p-4 pb-safe space-y-3 shadow-2xl h-[88vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 shrink-0">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5A36] block">
                  {swapSlotIndex !== null
                    ? `Remplacer ${DAYS_FULL[swapSlotIndex]}`
                    : "Catalogue recettes"}
                </span>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Choisir un plat
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCatalogOpen(false);
                  setSwapSlotIndex(null);
                }}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un plat, ingrédient..."
                className="w-full pl-10 pr-9 py-2.5 bg-white rounded-2xl border border-slate-200 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clean Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
              {[
                { id: "all", label: "Tout" },
                ...(totalStockCount > 0
                  ? [{ id: "anti_gaspi", label: "Avec mon stock" }]
                  : []),
                ...(diet === "omni"
                  ? [
                      { id: "volaille", label: "Volailles" },
                      { id: "boeuf", label: "Bœuf 5%" },
                    ]
                  : []),
                ...(diet !== "vege" ? [{ id: "poisson", label: "Poisson" }] : []),
                { id: "vege_all", label: "Végétarien" },
                { id: "eco", label: "Moins de 2,50€" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`tap-scale px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer border transition-colors ${
                    categoryFilter === cat.id
                      ? "bg-[#0F172A] text-white border-[#0F172A]"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scrollable Recipe List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
              {filteredCatalog.map((recipe) => {
                const slotIdx = weekSlots.indexOf(recipe.id);
                const isAdded = slotIdx !== -1;
                const prot = getDishProtein(recipe);
                const cost = recipe.cost[budgetTier].toFixed(2).replace(".", ",");
                const stockMatches = getRecipeStockMatches(recipe);

                return (
                  <div
                    key={recipe.id}
                    onClick={() => quickAddRecipe(recipe)}
                    className="bg-white rounded-2xl p-2.5 border border-slate-200/80 flex items-center gap-3 cursor-pointer tap-scale"
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      loading="lazy"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {stockMatches.length > 0 && (
                          <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-1.5 py-0.5 rounded">
                            {stockMatches.length} en stock
                          </span>
                        )}
                        {isAdded && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {DAYS_SHORT[slotIdx]}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-[#0F172A] truncate">
                        {recipe.shortName}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono-tabular">
                        {prot}g prot • {cost} € • {recipe.cookMethodLabel}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-[#FF5A36] text-white text-xs font-bold shrink-0">
                      Choisir
                    </span>
                  </div>
                );
              })}

              {filteredCatalog.length === 0 && (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">
                    Aucune recette trouvée.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          FRIDGE / PANTRY / RECEIPT 3-STEP SCANNER MODAL SHEET (ZEST STYLE)
          ================================================================ */}
      {isScannerOpen && (
        <div
          onClick={() => setIsScannerOpen(false)}
          className="fixed inset-0 z-50 bg-[#141414]/60 backdrop-blur-xs flex items-end sm:items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header with Step Indicator */}
            <div className="flex items-center justify-between border-b border-[#EDE8E0] pb-3">
              <div className="flex items-center gap-2.5">
                {scanStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setScanStep(scanStep === 3 ? 2 : 1)}
                    aria-label="Étape précédente"
                    className="w-8 h-8 rounded-full bg-white border border-[#EDE8E0] flex items-center justify-center text-[#141414] cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] mb-1">
                    Étape {scanStep} / 3
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#141414] leading-tight">
                    {scanStep === 1
                      ? "Scanner mon stock"
                      : scanStep === 2
                      ? "Vérifie ce qu’on a trouvé"
                      : "On cuisine quoi ?"}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput((prev) => !prev)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#EDE8E0] text-[11px] font-bold text-stone-600 cursor-pointer"
                >
                  {visionApiKey ? "Clé IA active" : "Clé API"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(false)}
                  aria-label="Fermer"
                  className="w-8 h-8 rounded-full bg-white border border-[#EDE8E0] flex items-center justify-center text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showApiKeyInput && (
              <div className="bg-white border border-[#EDE8E0] rounded-2xl p-3 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 block">
                  Clé API Vision (Gemini AI Studio ou OpenAI sk-...) — Optionnel
                </label>
                <input
                  type="password"
                  value={visionApiKey}
                  onChange={(e) => setVisionApiKey(e.target.value)}
                  placeholder="Collez votre clé Gemini ou OpenAI pour l'analyse cloud..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE8E0] text-xs text-[#141414] focus:outline-none focus:border-stone-400"
                />
                <p className="text-[10px] text-stone-500">
                  Sans clé, l&apos;application utilise l&apos;API serveur ou l&apos;analyse locale.
                </p>
              </div>
            )}

            {/* Hidden Native Camera & Gallery Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* ============================================================
                STEP 1: ZONE & PHOTO / VOICE CAPTURE
                ============================================================ */}
            {scanStep === 1 && (
              <div className="space-y-4">
                {/* Zone Switcher: Frigo | Placard | Ticket de caisse */}
                <div className="bg-[#EDE8E0]/70 p-1 rounded-2xl grid grid-cols-3 gap-1">
                  {[
                    { id: "frigo" as const, label: "Frigo" },
                    { id: "placard" as const, label: "Placard" },
                    { id: "ticket" as const, label: "Ticket" },
                  ].map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setScanZone(z.id)}
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        scanZone === z.id
                          ? "bg-white text-[#141414] shadow-2xs"
                          : "text-stone-500 hover:text-[#141414]"
                      }`}
                    >
                      {z.id === "ticket" && <Receipt className="w-3.5 h-3.5" />}
                      <span>{z.label}</span>
                    </button>
                  ))}
                </div>

                {/* Upload / Camera Area */}
                {scanPhotoPreview ? (
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-900 border border-[#EDE8E0]">
                    <img
                      src={scanPhotoPreview}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        visionMode === "gemini-vision" || visionMode === "openai-vision"
                          ? "bg-[#059669]/90"
                          : "bg-amber-600/90"
                      }`}
                    >
                      {visionMode === "gemini-vision"
                        ? "Gemini Vision"
                        : visionMode === "openai-vision"
                        ? "OpenAI Vision"
                        : "Vision Locale"}
                    </div>
                    <div className="absolute bottom-3 right-3 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="bg-white/95 text-[#141414] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
                      >
                        Galerie
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/95 text-[#141414] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
                      >
                        Reprendre
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-[#EDE8E0] rounded-3xl p-5 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center mx-auto">
                      {scanZone === "ticket" ? (
                        <Receipt className="w-6 h-6" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#141414]">
                        {scanZone === "frigo"
                          ? "Prenez votre frigo en photo"
                          : scanZone === "ticket"
                          ? "Scannez votre ticket de caisse"
                          : "Prenez votre placard en photo"}
                      </p>
                      <p className="text-xs text-stone-500">
                        {scanZone === "ticket"
                          ? "L’IA extrait automatiquement tous les produits alimentaires achetés."
                          : "L’IA repère vos ingrédients pour éviter le gaspillage et réduire vos courses."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="tap-scale w-full py-3.5 bg-[#141414] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Camera className="w-4 h-4 text-[#F5B731]" />
                      <span>Prendre une photo</span>
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="tap-scale py-2.5 bg-[#FAF8F5] border border-[#EDE8E0] text-[#141414] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                        <span>Galerie</span>
                      </button>
                      <button
                        type="button"
                        onClick={toggleVoiceDictation}
                        className={`tap-scale py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isListeningVoice
                            ? "bg-[#F5B731] text-[#141414] border-[#F5B731]"
                            : "bg-[#FAF8F5] text-[#141414] border-[#EDE8E0]"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isListeningVoice ? "Stop" : "Micro"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateDetectionForZone(scanZone)}
                        className="tap-scale py-2.5 bg-[#FAF8F5] border border-[#EDE8E0] text-stone-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Exemple</span>
                      </button>
                    </div>
                  </div>
                )}

                {isListeningVoice && (
                  <div className="bg-[#FEF3C7] border border-[#F5B731]/50 rounded-2xl px-3.5 py-2.5 text-center">
                    <p className="text-xs font-bold text-[#92400E]">
                      Écoute vocale active — énoncez vos ingrédients...
                    </p>
                    {voiceTranscript && (
                      <p className="text-[11px] font-medium text-stone-700 mt-1 italic">
                        « {voiceTranscript} »
                      </p>
                    )}
                  </div>
                )}

                {isAnalyzingPhoto && (
                  <div className="bg-white rounded-2xl p-4 text-center border border-[#EDE8E0]">
                    <p className="text-xs font-bold text-[#141414]">
                      Analyse Vision IA en cours...
                    </p>
                  </div>
                )}

                {totalTempStockCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setScanStep(2)}
                    className="tap-scale w-full py-3.5 bg-[#141414] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Voir mon stock ({totalTempStockCount})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setScanStep(2)}
                    className="w-full py-2.5 text-xs font-bold text-stone-500 hover:text-[#141414] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Saisir ou cocher manuellement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* ============================================================
                STEP 2: VERIFY & ADJUST DETECTED INGREDIENTS
                ============================================================ */}
            {scanStep === 2 && (
              <div className="space-y-4">
                {visionSummary && !isAnalyzingPhoto && (
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 border ${
                      visionMode === "gemini-vision" || visionMode === "openai-vision"
                        ? "bg-[#ECFDF5] border-[#059669]/25 text-[#065F46]"
                        : "bg-[#FEF3C7] border-[#F5B731]/40 text-[#92400E]"
                    }`}
                  >
                    <p className="text-xs font-semibold">{visionSummary}</p>
                  </div>
                )}

                {/* Quick Custom Ingredient Input */}
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomIngredientTerm();
                        }
                      }}
                      placeholder="Ajouter un ingrédient (ex: saumon, poivron...)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#EDE8E0] text-xs text-[#141414] placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
                    />
                    <button
                      type="button"
                      onClick={addCustomIngredientTerm}
                      className="px-3.5 py-2.5 rounded-xl bg-[#141414] text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      Ajouter
                    </button>
                  </div>

                  {tempCustomTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tempCustomTerms.map((term) => (
                        <span
                          key={term}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F5B731]/40 text-xs font-bold"
                        >
                          <span>{term}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomIngredientTerm(term)}
                            className="text-[#92400E] hover:text-[#141414] cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2-Column Preset Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">
                      Ingrédients sélectionnés ({totalTempStockCount})
                    </span>
                    {totalTempStockCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempDetectedIds([]);
                          setTempCustomTerms([]);
                          setVisionSummary(null);
                        }}
                        className="text-[11px] font-bold text-stone-500 hover:text-[#141414] cursor-pointer"
                      >
                        Tout décocher
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-[38vh] overflow-y-auto pr-0.5">
                    {(scanZone === "frigo"
                      ? FRIDGE_SCAN_PRESETS
                      : scanZone === "placard"
                      ? PANTRY_SCAN_PRESETS
                      : allStockPresets
                    ).map((preset) => {
                      const isSel = tempDetectedIds.includes(preset.id);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => toggleTempDetected(preset.id)}
                          className={`px-3 py-2.5 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-colors ${
                            isSel
                              ? "bg-[#FEF3C7]/70 border-[#F5B731] text-[#141414]"
                              : "bg-white border-[#EDE8E0] text-stone-700"
                          }`}
                        >
                          <span className="text-xs font-bold truncate pr-1.5">{preset.label}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSel
                                ? "bg-[#141414] border-[#141414] text-white"
                                : "border-stone-300 bg-white"
                            }`}
                          >
                            {isSel && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setScanStep(3)}
                  className="tap-scale w-full py-3.5 bg-[#141414] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>C’est bon, continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ============================================================
                STEP 3: PEOPLE COUNT & COOKING INTENT
                ============================================================ */}
            {scanStep === 3 && (
              <div className="space-y-4">
                {/* People Count Stepper */}
                <div className="bg-white border border-[#EDE8E0] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#141414] block">
                      Pour combien de personnes ?
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Adapte automatiquement les quantités
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPeopleCount((p) => Math.max(1, p - 1))}
                      aria-label="Moins de personnes"
                      className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EDE8E0] flex items-center justify-center text-[#141414] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-extrabold text-[#141414] font-mono-tabular">
                      {peopleCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPeopleCount((p) => Math.min(12, p + 1))}
                      aria-label="Plus de personnes"
                      className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EDE8E0] flex items-center justify-center text-[#141414] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Intent Selector */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-700 block">
                    Que souhaitez-vous préparer ?
                  </span>

                  <button
                    type="button"
                    onClick={() => setScanIntent("now")}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      scanIntent === "now"
                        ? "bg-[#FEF3C7]/70 border-[#F5B731] shadow-2xs"
                        : "bg-white border-[#EDE8E0]"
                    }`}
                  >
                    <div className="pr-3">
                      <span className="text-sm font-extrabold text-[#141414] block">
                        Maintenant (1 recette)
                      </span>
                      <span className="text-xs text-stone-600">
                        Trouve le meilleur plat avec ce que vous avez déjà sous la main.
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        scanIntent === "now"
                          ? "bg-[#141414] border-[#141414] text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {scanIntent === "now" && <Check className="w-3 h-3" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScanIntent("week")}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      scanIntent === "week"
                        ? "bg-[#FEF3C7]/70 border-[#F5B731] shadow-2xs"
                        : "bg-white border-[#EDE8E0]"
                    }`}
                  >
                    <div className="pr-3">
                      <span className="text-sm font-extrabold text-[#141414] block">
                        Planifier ma semaine (5 plats)
                      </span>
                      <span className="text-xs text-stone-600">
                        Compose vos 5 dîners et déduit automatiquement vos courses.
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        scanIntent === "week"
                          ? "bg-[#141414] border-[#141414] text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {scanIntent === "week" && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                </div>

                {/* Final Action CTA */}
                <button
                  type="button"
                  onClick={() => {
                    if (scanIntent === "week") {
                      applyScannedStock(true);
                      setTab("menu");
                      return;
                    }
                    setInStockIds(tempDetectedIds);
                    setCustomStockTerms(tempCustomTerms);
                    setIsScannerOpen(false);
                    const compatible = RECIPE_DATABASE.filter((r) => {
                      if (diet === "vege" && r.diet !== "vege" && r.diet !== "both") return false;
                      if (diet === "pesco" && r.diet === "omni") return false;
                      return true;
                    }).sort(
                      (a, b) =>
                        getRecipeStockMatches(b, tempDetectedIds, tempCustomTerms).length -
                        getRecipeStockMatches(a, tempDetectedIds, tempCustomTerms).length
                    );
                    if (compatible.length > 0) {
                      setSelectedRecipe(compatible[0]);
                      showToast(`Recette idéale : ${compatible[0].shortName}`);
                    } else {
                      setIsCatalogOpen(true);
                    }
                  }}
                  className="tap-scale w-full py-3.5 bg-[#141414] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Trouver mes recettes</span>
                  <ArrowRight className="w-4 h-4 text-[#F5B731]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          YUMA-STYLE 3-IDEA QUICK SWAP MODAL
          ================================================================ */}
      {quickSwapDayIdx !== null && (
        <div
          onClick={() => setQuickSwapDayIdx(null)}
          className="fixed inset-0 z-50 bg-[#141414]/60 backdrop-blur-xs flex items-end sm:items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EDE8E0] pb-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>3 idées au même budget</span>
                </span>
                <h2 className="font-serif text-lg font-bold text-[#141414]">
                  Échanger {DAYS_FULL[quickSwapDayIdx]}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setQuickSwapDayIdx(null)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full bg-white border border-[#EDE8E0] flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {quickSwapOptions.map((option) => {
                const stockMatches = getRecipeStockMatches(option);
                const isFav = favoriteIds.includes(option.id);
                return (
                  <div
                    key={option.id}
                    className="bg-white border border-[#EDE8E0] rounded-2xl p-3 flex items-center gap-3 shadow-2xs"
                  >
                    <img
                      src={option.image}
                      alt={option.shortName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[#141414] truncate">
                          {option.shortName}
                        </h3>
                        {isFav && (
                          <Heart className="w-3.5 h-3.5 fill-[#FF5A36] text-[#FF5A36] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-mono-tabular">
                        {getDishProtein(option)}g prot • {option.cost[budgetTier].toFixed(2).replace(".", ",")} € / part
                      </p>
                      {stockMatches.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full">
                          {stockMatches.length} en stock
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        assignToDay(quickSwapDayIdx, option);
                        setQuickSwapDayIdx(null);
                      }}
                      className="tap-scale px-3.5 py-2 rounded-xl bg-[#141414] text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Choisir
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const slot = quickSwapDayIdx;
                setQuickSwapDayIdx(null);
                setSwapSlotIndex(slot);
                setIsCatalogOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-white border border-[#EDE8E0] text-xs font-bold text-[#141414] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span>Voir tout le catalogue</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
          RECIPE DETAIL MODAL SHEET
          ================================================================ */}
      {selectedRecipe && (
        <div
          onClick={() => setSelectedRecipe(null)}
          className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-end sm:items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto p-5 space-y-4 shadow-2xl"
          >
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => toggleFavorite(selectedRecipe.id)}
                aria-label="Ajouter aux favoris"
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-sm cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favoriteIds.includes(selectedRecipe.id)
                      ? "fill-[#FF5A36] text-[#FF5A36]"
                      : "text-[#141414]"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-slate-700 shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-400">
                {selectedRecipe.categoryLabel} • {selectedRecipe.cookMethodLabel}
              </span>
              <h3 className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                {selectedRecipe.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {selectedRecipe.desc}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-600 block">
                Programmer pour un jour de la semaine :
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {DAYS_SHORT.map((day, dIdx) => {
                  const isCurrent = currentWeekSlots[dIdx] === selectedRecipe.id;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        assignToDay(dIdx, selectedRecipe);
                        setSelectedRecipe(null);
                      }}
                      className={`tap-scale py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        isCurrent
                          ? "bg-[#059669] text-white border-[#059669]"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl text-center">
              <div>
                <strong className="block text-sm font-extrabold text-[#FF5A36] font-mono-tabular">
                  {getDishProtein(selectedRecipe)}g
                </strong>
                <span className="text-[11px] text-slate-500">Protéines</span>
              </div>
              <div>
                <strong className="block text-sm font-extrabold font-mono-tabular">
                  {selectedRecipe.carbs}g
                </strong>
                <span className="text-[11px] text-slate-500">Glucides</span>
              </div>
              <div>
                <strong className="block text-sm font-extrabold font-mono-tabular">
                  {selectedRecipe.fat}g
                </strong>
                <span className="text-[11px] text-slate-500">Lipides</span>
              </div>
              <div>
                <strong className="block text-sm font-extrabold text-[#059669] font-mono-tabular">
                  {selectedRecipe.cost[budgetTier].toFixed(2).replace(".", ",")} €
                </strong>
                <span className="text-[11px] text-slate-500">Par part</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ingrédients ({peopleCount * 2} portions)
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl px-3">
                {selectedRecipe.ingredients.map((ing, i) => {
                  const hasIt = isIngredientInStock(ing.name);
                  return (
                    <div key={i} className="py-2 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">{ing.name}</span>
                        {hasIt && (
                          <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-1.5 py-0.5 rounded">
                            En stock
                          </span>
                        )}
                      </div>
                      <strong className="font-bold text-[#0F172A] font-mono-tabular">
                        {formatQty(ing.qty * peopleCount * 2, ing.unit)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          SETTINGS DRAWER (YUMA + NUTRITION PREFERENCES)
          ================================================================ */}
      {isSettingsOpen && (
        <div
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 z-50 bg-[#141414]/60 backdrop-blur-xs flex items-end sm:items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl p-5 pb-safe space-y-5 shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EDE8E0] pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#141414]">
                  Mon foyer & Préférences
                </h2>
                <p className="text-xs text-stone-500">
                  Calibre vos prix, vos menus et vos objectifs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full bg-white border border-[#EDE8E0] flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Supermarché (Yuma) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Votre supermarché (calibre l’estimation des prix)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SUPERMARKET_CONFIG) as SupermarketKey[]).map((key) => {
                  const active = supermarket === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSupermarket(key)}
                      className={`tap-scale py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer ${
                        active
                          ? "bg-[#141414] text-white border-[#141414]"
                          : "bg-white text-stone-700 border-[#EDE8E0]"
                      }`}
                    >
                      {SUPERMARKET_CONFIG[key].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget hebdo slider (Yuma) */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#EDE8E0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">Budget semaine cible</span>
                <span className="text-sm font-extrabold text-[#141414] font-mono-tabular">
                  {weeklyBudget} € / sem.
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={180}
                step={5}
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                className="w-full accent-[#141414] cursor-pointer"
              />
            </div>

            {/* Personnes par défaut */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Personnes par défaut (ajustable par jour dans Semaine)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPeopleCount(p);
                      showToast(`Défaut : ${p} ${p > 1 ? "personnes" : "personne"}`);
                    }}
                    className={`tap-scale py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      peopleCount === p
                        ? "bg-[#141414] text-white border-[#141414]"
                        : "bg-white text-stone-700 border-[#EDE8E0]"
                    }`}
                  >
                    {p} {p > 1 ? "personnes" : "personne"}
                  </button>
                ))}
              </div>
            </div>

            {/* Niveau en cuisine (Yuma) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Niveau de recette
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "facile" as const, label: "Facile" },
                  { id: "normal" as const, label: "Normal" },
                  { id: "avance" as const, label: "Avancé" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSkillLevel(lvl.id)}
                    className={`tap-scale py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      skillLevel === lvl.id
                        ? "bg-[#FEF3C7] text-[#92400E] border-[#F5B731]"
                        : "bg-white text-stone-700 border-[#EDE8E0]"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Régime alimentaire & Aliments à éviter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Régime alimentaire
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "omni", label: "Omnivore", icon: Utensils },
                  { id: "vege", label: "Végétarien", icon: Leaf },
                  { id: "pesco", label: "Pescatarien", icon: Fish },
                ].map((d) => {
                  const Icon = d.icon;
                  const active = diet === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDietChange(d.id as DietMode)}
                      className={`tap-scale py-2.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-[#141414] text-white border-[#141414]"
                          : "bg-white text-stone-700 border-[#EDE8E0]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {AVOID_OPTIONS.map((opt) => {
                  const active = avoidList.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleAvoidOption(opt.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer ${
                        active
                          ? "bg-[#FEF3C7] text-[#92400E] border-[#F5B731]"
                          : "bg-white text-stone-600 border-[#EDE8E0]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profil d'activité */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Profil d&apos;activité & Protéines
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 110, label: "Actif", mult: "1.5g/kg", icon: Activity },
                  { id: 130, label: "Sportif", mult: "1.8g/kg", icon: Zap },
                  { id: 160, label: "Athlète", mult: "2.2g/kg", icon: Dumbbell },
                ].map((p) => {
                  const Icon = p.icon;
                  const active = protProfile === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProtProfile(p.id as ProtProfile)}
                      className={`tap-scale p-3 rounded-2xl border text-left cursor-pointer ${
                        active
                          ? "bg-[#141414] text-white border-[#141414]"
                          : "bg-white text-stone-700 border-[#EDE8E0]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mb-1.5 ${
                          active ? "text-[#F5B731]" : "text-stone-500"
                        }`}
                      />
                      <strong className="text-xs font-bold block">{p.label}</strong>
                      <span
                        className={`text-[11px] ${
                          active ? "text-stone-300" : "text-stone-500"
                        }`}
                      >
                        {p.mult}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#EDE8E0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">Poids de corps</span>
                <span className="text-sm font-extrabold text-[#141414] font-mono-tabular">
                  {weightKg} kg • Cible {targetDailyProtG}g/j
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => Math.max(45, w - 1))}
                  className="tap-scale w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EDE8E0] font-bold text-base cursor-pointer"
                >
                  −
                </button>
                <input
                  type="range"
                  min={45}
                  max={120}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="flex-1 accent-[#141414] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => Math.min(120, w + 1))}
                  className="tap-scale w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EDE8E0] font-bold text-base cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  generateSmartWeekMenu();
                  setIsSettingsOpen(false);
                  setTab("menu");
                }}
                className="tap-scale py-3.5 bg-[#FEF3C7] text-[#92400E] border border-[#F5B731]/50 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Générer le menu</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="tap-scale py-3.5 bg-[#141414] text-white rounded-2xl text-xs font-extrabold cursor-pointer"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
