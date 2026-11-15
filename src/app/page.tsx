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
} from "lucide-react";
import { RECIPE_DATABASE, Recipe, SupermarketAisle } from "@/data/recipeDatabase";

type TabKey = "catalog" | "menu" | "cart" | "prep";
type DietMode = "omni" | "vege" | "pesco";
type ProtProfile = 110 | 130 | 160;
type BudgetTier = "eco" | "std" | "gourmet";
type PrepSubMode = "batch" | "recipes";

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
  const [tab, setTab] = useState<TabKey>("catalog");
  const [prepMode, setPrepMode] = useState<PrepSubMode>("batch");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [swapSlotIndex, setSwapSlotIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Fridge / Pantry Camera & Vision AI Scanner State (Catalog-First Zero Waste)
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanZone, setScanZone] = useState<"frigo" | "placard">("frigo");
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
  const speechRecRef = useRef<unknown>(null);

  // User profile & preferences (tucked cleanly in settings)
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [protProfile, setProtProfile] = useState<ProtProfile>(130);
  const [diet, setDiet] = useState<DietMode>("omni");
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("std");

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

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("macrobatch_v2_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.peopleCount) setPeopleCount(parsed.peopleCount);
        if (parsed.weightKg) setWeightKg(parsed.weightKg);
        if (parsed.protProfile) setProtProfile(parsed.protProfile);
        if (parsed.diet) setDiet(parsed.diet);
        if (parsed.budgetTier) setBudgetTier(parsed.budgetTier);
        if (Array.isArray(parsed.weekSlots) && parsed.weekSlots.length === 5) {
          setWeekSlots(parsed.weekSlots);
        }
        if (Array.isArray(parsed.inStockIds)) setInStockIds(parsed.inStockIds);
        if (Array.isArray(parsed.customStockTerms)) setCustomStockTerms(parsed.customStockTerms);
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
          weightKg,
          protProfile,
          diet,
          budgetTier,
          weekSlots,
          inStockIds,
          customStockTerms,
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
    weightKg,
    protProfile,
    diet,
    budgetTier,
    weekSlots,
    inStockIds,
    customStockTerms,
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

  // Active dishes for the 5 days
  const activeDishes = useMemo(() => {
    return weekSlots
      .map((id) => RECIPE_DATABASE.find((r) => r.id === id))
      .filter((r): r is Recipe => Boolean(r));
  }, [weekSlots]);

  const avgProtPerMeal = useMemo(() => {
    if (activeDishes.length === 0) return 0;
    const sum = activeDishes.reduce((acc, d) => acc + getDishProtein(d), 0);
    return Math.round(sum / activeDishes.length);
  }, [activeDishes, protProfile, weightKg]);

  const avgCostPerMeal = useMemo(() => {
    if (activeDishes.length === 0) return 0;
    const sum = activeDishes.reduce((acc, d) => acc + d.cost[budgetTier], 0);
    return sum / activeDishes.length;
  }, [activeDishes, budgetTier]);

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
    const portionsPerDish = peopleCount * 2;
    const steps: DynamicBatchStep[] = [];

    const ovenDishes = activeDishes.filter((d) => d.cookMethod === "four");
    const simmerDishes = activeDishes.filter((d) => d.cookMethod === "mijote");
    const panDishes = activeDishes.filter((d) => d.cookMethod === "poele");
    const minuteDishes = activeDishes.filter((d) => d.cookMethod === "minute");

    const getGroupIngredients = (dishes: Recipe[], aisles: SupermarketAisle[]) => {
      const map = new Map<string, { name: string; qty: number; unit: string }>();
      dishes.forEach((d) => {
        d.ingredients
          .filter((i) => aisles.includes(i.aisle) && !i.isPantry)
          .forEach((i) => {
            const prev = map.get(i.name);
            if (prev) prev.qty += i.qty * portionsPerDish;
            else map.set(i.name, { name: i.name, qty: i.qty * portionsPerDish, unit: i.unit });
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
      title: `Assemblage des ${peopleCount * 10} boîtes (Lundi à Vendredi)`,
      station: "Dressage & Mise au frais",
      durationMin: 10,
      image: "/steps/step7_a.jpg",
      dishBadges: activeDishes.map((d, idx) => `${DAYS_FULL[idx]} : ${d.shortName}`),
      ingredientPills: [`${peopleCount * 2} boîtes / recette`, `${peopleCount * 10} repas au total`],
      description: `Répartissez chaque recette en ${
        peopleCount * 2
      } portions égales : ${activeDishes
        .map((d, i) => `${DAYS_SHORT[i]} (${d.shortName})`)
        .join(" • ")}. Laissez tiédir 15 min avant de fermer les couvercles.`,
    });

    return steps;
  }, [activeDishes, peopleCount]);

  const totalBatchMinutes = useMemo(() => {
    return dynamicBatchTimeline.reduce((acc, s) => acc + s.durationMin, 0);
  }, [dynamicBatchTimeline]);

  // Diet change handler
  const handleDietChange = (nextDiet: DietMode) => {
    setDiet(nextDiet);
    setCategoryFilter("all");
    if (nextDiet === "vege") {
      setWeekSlots((prev) =>
        prev.map((id) => {
          const r = RECIPE_DATABASE.find((item) => item.id === id);
          if (!r || (r.diet !== "vege" && r.diet !== "both")) {
            return "d_halloumi";
          }
          return id;
        })
      );
    } else if (nextDiet === "pesco") {
      setWeekSlots((prev) =>
        prev.map((id) => {
          const r = RECIPE_DATABASE.find((item) => item.id === id);
          if (!r || r.diet === "omni") {
            return "d_thon_bowl";
          }
          return id;
        })
      );
    }
    showToast(
      `Régime : ${nextDiet === "vege" ? "Végétarien" : nextDiet === "pesco" ? "Pescatarien" : "Omnivore"}`
    );
  };

  // Filtered AND Sorted catalog recipes (prioritizing recipes using scanned fridge/pantry items)
  const filteredCatalog = useMemo(() => {
    const filtered = RECIPE_DATABASE.filter((r) => {
      if (diet === "vege" && r.diet !== "vege" && r.diet !== "both") return false;
      if (diet === "pesco" && r.diet === "omni") return false;

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
  }, [diet, categoryFilter, searchQuery, budgetTier, inStockIds, customStockTerms, totalStockCount]);

  const assignToDay = (dayIdx: number, recipe: Recipe) => {
    setWeekSlots((prev) => {
      const next = [...prev];
      next[dayIdx] = recipe.id;
      return next;
    });
    setSwapSlotIndex(null);
    showToast(`${recipe.shortName} programmé pour ${DAYS_FULL[dayIdx]}`);
  };

  const quickAddRecipe = (recipe: Recipe) => {
    if (swapSlotIndex !== null) {
      assignToDay(swapSlotIndex, recipe);
      setTab("menu");
      return;
    }
    setSelectedRecipe(recipe);
  };

  // Aggregated dynamic grocery list
  const groceryByAisle = useMemo(() => {
    const map = new Map<
      string,
      { name: string; qty: number; unit: string; aisle: SupermarketAisle; isPantry: boolean }
    >();

    const portionsPerDish = peopleCount * 2;

    activeDishes.forEach((dish) => {
      dish.ingredients.forEach((ing) => {
        if (deductPantry && ing.isPantry) return;
        const key = `${ing.aisle}__${ing.name}__${ing.unit}`;
        const existing = map.get(key);
        const addedQty = ing.qty * portionsPerDish;
        if (existing) {
          existing.qty += addedQty;
        } else {
          map.set(key, {
            name: ing.name,
            qty: addedQty,
            unit: ing.unit,
            aisle: ing.aisle,
            isPantry: Boolean(ing.isPantry),
          });
        }
      });
    });

    return AISLE_ORDER.map((aisle) => {
      const items = Array.from(map.values())
        .filter((i) => i.aisle === aisle)
        .sort((a, b) => a.name.localeCompare(b.name));
      return { aisle, label: AISLE_LABELS[aisle], items };
    }).filter((g) => g.items.length > 0);
  }, [activeDishes, peopleCount, deductPantry]);

  // ================================================================
  // FRIDGE & PANTRY PHOTO SCANNER LOGIC (VISION AI + CATALOG PRIORITY + GROCERY DEDUCTION)
  // ================================================================
  const openScannerModal = (zone: "frigo" | "placard") => {
    setScanZone(zone);
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
          zone: scanZone === "frigo" ? "fridge" : "pantry",
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
    }
  };

  const simulateDetectionForZone = (zone: "frigo" | "placard") => {
    setScanZone(zone);
    setIsAnalyzingPhoto(true);
    setTimeout(() => {
      setIsAnalyzingPhoto(false);
      const defaults =
        zone === "frigo"
          ? ["skyr", "poulet", "brocoli", "courgette", "oeufs"]
          : ["riz", "quinoa", "lentilles", "lait_coco", "patate_douce"];
      setTempDetectedIds((prev) => Array.from(new Set([...prev, ...defaults])));
      setVisionMode("demo");
      setVisionSummary(
        zone === "frigo"
          ? "Exemple frigo détecté : Poulet, Skyr, Œufs, Brocolis, Courgettes."
          : "Exemple placard détecté : Riz, Quinoa, Lentilles corail, Lait de coco, Patates douces."
      );
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
    setTab("catalog");
    showToast("Catalogue trié en priorité selon votre stock");
  };

  const totalCheckedCount = Object.values(checkedGroceries).filter(Boolean).length;
  const totalGroceryCount = groceryByAisle.reduce((acc, g) => acc + g.items.length, 0);
  const doneStepsCount = dynamicBatchTimeline.filter((s) => doneSteps[s.stepNumber]).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] pb-28">
      {/* Subtle Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Mobile-First App Container */}
      <div className="max-w-[440px] mx-auto min-h-screen bg-[#F8F9FA] relative">
        {/* Minimalist Sticky Header */}
        <header className="sticky top-0 z-30 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-slate-200/70 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight leading-none text-[#0F172A]">
              MacroBatch
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {peopleCount * 10} repas • {weightKg} kg •{" "}
              {budgetTier === "eco" ? "Malin" : budgetTier === "std" ? "Équilibré" : "Gourmet"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Compact Portion Selector (1P / 2P / 4P) */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-full">
              {[1, 2, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPeopleCount(p);
                    showToast(`Portions ajustées : ${p} ${p > 1 ? "personnes" : "personne"}`);
                  }}
                  className={`tap-scale px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    peopleCount === p
                      ? "bg-white text-[#0F172A] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p}P
                </button>
              ))}
            </div>

            {/* Discreet Settings Icon */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Préférences nutritionnelles"
              className="tap-scale w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ================================================================
            TAB 1: CATALOGUE (AVEC SCAN FRIGO / PLACARD DÈS L'ACCUEIL)
            ================================================================ */}
        {tab === "catalog" && (
          <main className="px-4 pt-3 space-y-3.5">
            {swapSlotIndex !== null && (
              <div className="bg-[#0F172A] text-white rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-300 block">Remplacement pour</span>
                  <strong className="font-bold text-sm">{DAYS_FULL[swapSlotIndex]}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setSwapSlotIndex(null)}
                  className="text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            )}

            {/* Compact Zero-Waste Fridge & Pantry Scanner Bar right at the top of Catalog */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                  <strong className="text-xs font-extrabold text-[#0F172A] block truncate">
                    {totalStockCount > 0
                      ? `${totalStockCount} ingrédient${totalStockCount > 1 ? "s" : ""} en stock détecté${totalStockCount > 1 ? "s" : ""}`
                      : "Cuisiner avec votre frigo & placard"}
                  </strong>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {totalStockCount > 0
                    ? "Plats triés en priorité pour zéro gaspillage"
                    : "Prenez une photo pour prioriser les plats et réduire les courses"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {totalStockCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInStockIds([]);
                      setCustomStockTerms([]);
                      setScanPhotoPreview(null);
                      setVisionSummary(null);
                      if (categoryFilter === "anti_gaspi") setCategoryFilter("all");
                      showToast("Filtre frigo/placard réinitialisé");
                    }}
                    className="tap-scale px-2.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openScannerModal("frigo")}
                  className="tap-scale px-3 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>{totalStockCount > 0 ? "Modifier" : "Scanner"}</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
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
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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
                  className={`tap-scale px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer border transition-colors ${
                    categoryFilter === cat.id
                      ? "bg-[#0F172A] text-white border-[#0F172A]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Recipe Feed */}
            <div className="space-y-4">
              {filteredCatalog.map((recipe) => {
                const slotIdx = weekSlots.indexOf(recipe.id);
                const isAdded = slotIdx !== -1;
                const prot = getDishProtein(recipe);
                const cost = recipe.cost[budgetTier].toFixed(2).replace(".", ",");
                const stockMatches = getRecipeStockMatches(recipe);

                return (
                  <article
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-white/95 backdrop-blur-xs text-[#0F172A] text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs">
                          {recipe.cookMethodLabel}
                        </span>
                        {stockMatches.length > 0 && (
                          <span className="bg-[#059669] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs">
                            {stockMatches.length} en stock
                          </span>
                        )}
                      </div>
                      {isAdded && (
                        <div className="absolute top-3 right-3 bg-[#0F172A] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-[#34D399]" />
                          <span>{DAYS_SHORT[slotIdx]}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {recipe.categoryLabel}
                        </span>
                        <h2 className="text-base font-bold text-[#0F172A] leading-snug mt-0.5">
                          {recipe.name}
                        </h2>
                        {stockMatches.length > 0 && (
                          <p className="text-[11px] font-semibold text-[#059669] mt-1 truncate">
                            Utilise votre stock : {stockMatches.join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="bg-[#FFF1EE] text-[#FF5A36] px-2.5 py-1 rounded-lg font-bold font-mono-tabular">
                            {prot}g prot
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold font-mono-tabular">
                            {cost} € / part
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            quickAddRecipe(recipe);
                          }}
                          className={`tap-scale px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                            swapSlotIndex !== null
                              ? "bg-[#FF5A36] text-white"
                              : isAdded
                              ? "bg-slate-100 text-slate-700"
                              : "bg-[#0F172A] text-white"
                          }`}
                        >
                          {swapSlotIndex !== null ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Choisir</span>
                            </>
                          ) : isAdded ? (
                            <span>Modifier jour</span>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ajouter</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredCatalog.length === 0 && (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                  <p className="text-sm font-semibold text-slate-600">
                    Aucune recette ne correspond à cette recherche.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                    className="mt-3 text-xs font-bold text-[#FF5A36] cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ================================================================
            TAB 2: SEMAINE (MON MENU)
            ================================================================ */}
        {tab === "menu" && (
          <main className="px-4 pt-3 space-y-4">
            <section className="bg-[#0F172A] text-white rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400 block">
                    Synthèse de votre semaine
                  </span>
                  <h2 className="text-lg font-extrabold mt-0.5">
                    {peopleCount * 10} portions programmées
                  </h2>
                </div>
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-slate-200">
                  Cible {targetDailyProtG}g/j
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block">Protéines / j</span>
                  <strong className="text-base font-extrabold text-[#FF5A36] font-mono-tabular">
                    {avgProtPerMeal * 2}g
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Coût / repas</span>
                  <strong className="text-base font-extrabold text-[#34D399] font-mono-tabular">
                    {avgCostPerMeal.toFixed(2).replace(".", ",")} €
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Session Batch</span>
                  <strong className="text-base font-extrabold text-white font-mono-tabular">
                    {totalBatchMinutes} min
                  </strong>
                </div>
              </div>
            </section>

            <div className="space-y-3">
              {activeDishes.map((dish, idx) => {
                const stockUsed = getRecipeStockMatches(dish);
                return (
                  <div
                    key={`${dish.id}-${idx}`}
                    onClick={() => setSelectedRecipe(dish)}
                    className="bg-white rounded-2xl p-3 border border-slate-200/80 flex items-center gap-3 cursor-pointer"
                  >
                    <img
                      src={dish.image}
                      alt={dish.shortName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5A36]">
                          {DAYS_FULL[idx]}
                        </span>
                        {stockUsed.length > 0 && (
                          <span className="text-[10px] font-bold text-[#059669]">
                            • {stockUsed.length} en stock
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] truncate">
                        {dish.shortName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono-tabular">
                        <span>{getDishProtein(dish)}g prot</span>
                        <span>•</span>
                        <span>{dish.cost[budgetTier].toFixed(2).replace(".", ",")} €</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSwapSlotIndex(idx);
                        setTab("catalog");
                      }}
                      className="tap-scale px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Remplacer</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* ================================================================
            TAB 3: COURSES (AVEC SYNCHRO DU STOCK SCANNÉ)
            ================================================================ */}
        {tab === "cart" && (
          <main className="px-4 pt-3 space-y-4">
            {/* Grocery List Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#0F172A]">
                  Reste à acheter ({totalGroceryCount - totalCheckedCount})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalCheckedCount} déjà en stock ou cochés • {peopleCount} pers.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openScannerModal("frigo")}
                  className="tap-scale px-3 py-1.5 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Scan stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeductPantry((prev) => !prev)}
                  className={`tap-scale px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                    deductPantry
                      ? "bg-[#ECFDF5] text-[#059669] border-[#059669]/30"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {deductPantry ? "Épices déduites" : "Avec épices"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {groceryByAisle.map((group) => (
                <section
                  key={group.aisle}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      {group.label}
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                      {group.items.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => {
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
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50/70 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? "bg-[#059669] border-[#059669] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <span
                                className={`text-sm font-medium block truncate ${
                                  isChecked
                                    ? "line-through text-slate-400"
                                    : "text-[#0F172A]"
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

                          <span className="text-xs font-bold text-slate-600 font-mono-tabular shrink-0">
                            {formatQty(item.qty, item.unit)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </main>
        )}

        {/* ================================================================
            TAB 4: PRÉPARATION DYNAMIQUE (ADAPTÉE AUX 5 PLATS CHOISIS)
            ================================================================ */}
        {tab === "prep" && (
          <main className="px-4 pt-3 space-y-4">
            <div className="bg-slate-200/70 p-1 rounded-2xl flex">
              <button
                type="button"
                onClick={() => setPrepMode("batch")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  prepMode === "batch"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Session Batch ({totalBatchMinutes} min)
              </button>
              <button
                type="button"
                onClick={() => setPrepMode("recipes")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  prepMode === "recipes"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Fiches Recettes (5)
              </button>
            </div>

            {prepMode === "batch" ? (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5A36] block">
                        Plan d'action sur-mesure
                      </span>
                      <h2 className="text-base font-extrabold text-[#0F172A]">
                        {dynamicBatchTimeline.length} étapes pour vos 5 plats
                      </h2>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {doneStepsCount} / {dynamicBatchTimeline.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.from(new Set(activeDishes.map((d) => d.cookMethodLabel))).map(
                      (station) => (
                        <span
                          key={station}
                          className="text-[11px] font-bold bg-[#FFF1EE] text-[#FF5A36] px-2.5 py-1 rounded-lg"
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
                      className={`bg-white rounded-3xl overflow-hidden border border-slate-200/80 transition-opacity ${
                        isDone ? "opacity-55" : ""
                      }`}
                    >
                      <div className="relative aspect-video bg-slate-900">
                        <img
                          src={step.image}
                          alt={step.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#0F172A]/85 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#FF5A36]" />
                          <span>
                            Étape {step.stepNumber}/{dynamicBatchTimeline.length} •{" "}
                            {step.durationMin} min
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            {step.station}
                          </span>
                          <h3 className="text-sm font-extrabold text-[#0F172A] mt-0.5">
                            {step.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {step.dishBadges.map((b, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {b}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {step.description}
                        </p>

                        {step.ingredientPills.length > 0 && (
                          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-wrap gap-1.5">
                            {step.ingredientPills.map((pill, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-semibold bg-white text-[#0F172A] px-2 py-0.5 rounded-md border border-slate-200/80 font-mono-tabular"
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
                          className={`tap-scale w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                            isDone
                              ? "bg-[#059669] text-white"
                              : "bg-slate-100 text-[#0F172A] hover:bg-slate-200"
                          }`}
                        >
                          {isDone ? "Étape terminée" : "Marquer comme fait"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {activeDishes.map((dish, idx) => (
                  <article
                    key={`${dish.id}-${idx}`}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80"
                  >
                    <div className="relative aspect-video bg-slate-100">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#0F172A]/85 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {DAYS_FULL[idx]}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-slate-400">
                          {dish.cookMethodLabel} • {peopleCount * 2} portions
                        </span>
                        <h3 className="text-base font-extrabold text-[#0F172A] mt-0.5">
                          {dish.name}
                        </h3>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 border border-slate-100">
                        {dish.ingredients.map((ing, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-700">{ing.name}</span>
                            <strong className="font-bold text-[#0F172A] font-mono-tabular">
                              {formatQty(ing.qty * peopleCount * 2, ing.unit)}
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
                ))}
              </div>
            )}
          </main>
        )}

        {/* ================================================================
            BOTTOM TAB BAR (4 TABS ONLY)
            ================================================================ */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around">
          {[
            { id: "catalog", label: "Catalogue", icon: BookOpen },
            { id: "menu", label: "Semaine", icon: Calendar },
            { id: "cart", label: "Courses", icon: ShoppingBag },
            { id: "prep", label: "Préparation", icon: ChefHat },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as TabKey)}
                className={`tap-scale flex flex-col items-center gap-1 px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                  isActive ? "text-[#FF5A36]" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================================================================
          FRIDGE / PANTRY PHOTO SCANNER MODAL SHEET (ZERO-WASTE CATALOG & CART)
          ================================================================ */}
      {isScannerOpen && (
        <div
          onClick={() => setIsScannerOpen(false)}
          className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-end sm:items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] block">
                  Analyse Vision IA • Zéro gaspillage
                </span>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Scanner mon Frigo & Placard
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput((prev) => !prev)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer"
                >
                  {visionApiKey ? "Clé IA active" : "Clé API"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showApiKeyInput && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Clé API Vision (Gemini AI Studio ou OpenAI sk-...) — Optionnel
                </label>
                <input
                  type="password"
                  value={visionApiKey}
                  onChange={(e) => setVisionApiKey(e.target.value)}
                  placeholder="Collez votre clé Gemini ou OpenAI pour l'analyse cloud..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-slate-400"
                />
                <p className="text-[10px] text-slate-500">
                  Sans clé, l&apos;application utilise automatiquement l&apos;analyse visuelle locale par profil colorimétrique.
                </p>
              </div>
            )}

            {/* Zone Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex">
              <button
                type="button"
                onClick={() => setScanZone("frigo")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  scanZone === "frigo" ? "bg-white text-[#0F172A] shadow-2xs" : "text-slate-500"
                }`}
              >
                Frigo (Frais & Légumes)
              </button>
              <button
                type="button"
                onClick={() => setScanZone("placard")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  scanZone === "placard" ? "bg-white text-[#0F172A] shadow-2xs" : "text-slate-500"
                }`}
              >
                Placard (Sec & Épicerie)
              </button>
            </div>

            {/* Hidden Native Camera Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Upload / Camera Area */}
            {scanPhotoPreview ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900">
                <img
                  src={scanPhotoPreview}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#0F172A]/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {visionMode === "gemini-vision"
                    ? "Gemini Vision"
                    : visionMode === "openai-vision"
                    ? "OpenAI Vision"
                    : "Vision Locale"}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 bg-white/95 text-[#0F172A] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
                >
                  Reprendre une photo
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-4 text-center space-y-3 bg-slate-50/70">
                <p className="text-xs font-semibold text-slate-600">
                  Prenez une photo de votre {scanZone} ou dictez à voix haute vos restes (« poulet, courgettes, skyr, riz... ») :
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="tap-scale px-3.5 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#FF5A36]" />
                    <span>Photo IA</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`tap-scale px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                      isListeningVoice
                        ? "bg-[#FF5A36] text-white border-[#FF5A36]"
                        : "bg-white text-[#0F172A] border-slate-300"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isListeningVoice ? "Arrêter dictée" : "Dicter au micro"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateDetectionForZone(scanZone)}
                    className="tap-scale px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Exemple</span>
                  </button>
                </div>
              </div>
            )}

            {isListeningVoice && (
              <div className="bg-[#FFF1EE] border border-[#FF5A36]/30 rounded-2xl px-3.5 py-2.5 text-center">
                <p className="text-xs font-bold text-[#FF5A36]">
                  Écoute vocale active — énoncez vos ingrédients...
                </p>
                {voiceTranscript && (
                  <p className="text-[11px] font-medium text-slate-700 mt-1 italic">
                    « {voiceTranscript} »
                  </p>
                )}
              </div>
            )}

            {isAnalyzingPhoto && (
              <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-200/80">
                <p className="text-xs font-bold text-[#0F172A]">
                  Analyse Vision IA de la photo du {scanZone} en cours...
                </p>
              </div>
            )}

            {visionSummary && !isAnalyzingPhoto && !isListeningVoice && (
              <div className="bg-[#ECFDF5] border border-[#059669]/25 rounded-2xl px-3.5 py-2.5">
                <p className="text-xs font-semibold text-[#065F46]">{visionSummary}</p>
              </div>
            )}

            {/* Quick Custom Ingredient Input (for any item spotted by AI or added manually) */}
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
                  placeholder="Ajouter un autre ingrédient (ex: saumon, poivron...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={addCustomIngredientTerm}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Ajouter
                </button>
              </div>

              {tempCustomTerms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tempCustomTerms.map((term) => (
                    <span
                      key={term}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#059669]/30 text-xs font-bold"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomIngredientTerm(term)}
                        className="text-[#065F46] hover:text-[#0F172A] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive 2-column checklist of detected / selectable ingredients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Ingrédients détectés ({scanZone}) :
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {totalTempStockCount} au total
                  </span>
                  {totalTempStockCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempDetectedIds([]);
                        setTempCustomTerms([]);
                        setVisionSummary(null);
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Tout décocher
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(scanZone === "frigo" ? FRIDGE_SCAN_PRESETS : PANTRY_SCAN_PRESETS).map(
                  (preset) => {
                    const isSel = tempDetectedIds.includes(preset.id);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => toggleTempDetected(preset.id)}
                        className={`px-3 py-2 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-colors ${
                          isSel
                            ? "bg-[#ECFDF5] border-[#059669]/40 text-[#0F172A]"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-bold truncate pr-1.5">{preset.label}</span>
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                            isSel
                              ? "bg-[#059669] border-[#059669] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSel && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Dual CTA: Prioritize Catalog OR Auto-Compose the 5 Week Meals */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => applyScannedStock(false)}
                className="tap-scale w-full py-3 bg-[#0F172A] text-white rounded-2xl text-xs font-bold cursor-pointer"
              >
                Trier le catalogue & déduire des courses ({totalTempStockCount})
              </button>
              {totalTempStockCount > 0 && (
                <button
                  type="button"
                  onClick={() => applyScannedStock(true)}
                  className="tap-scale w-full py-2.5 bg-[#ECFDF5] text-[#059669] border border-[#059669]/30 rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Composer automatiquement mes 5 plats avec ce stock
                </button>
              )}
            </div>
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
                  const isCurrent = weekSlots[dIdx] === selectedRecipe.id;
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
          SETTINGS DRAWER (DISCREET PERSONALIZATION)
          ================================================================ */}
      {isSettingsOpen && (
        <div
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-end sm:items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl p-5 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Préférences nutritionnelles
                </h2>
                <p className="text-xs text-slate-500">
                  Calibre vos apports et filtre le catalogue
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Profil d'activité
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
                          ? "bg-[#0F172A] text-white border-[#0F172A]"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mb-1.5 ${
                          active ? "text-[#FF5A36]" : "text-slate-500"
                        }`}
                      />
                      <strong className="text-xs font-bold block">{p.label}</strong>
                      <span
                        className={`text-[11px] ${
                          active ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {p.mult}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Poids de corps</span>
                <span className="text-sm font-extrabold text-[#0F172A] font-mono-tabular">
                  {weightKg} kg • Cible {targetDailyProtG}g/j
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => Math.max(45, w - 1))}
                  className="tap-scale w-9 h-9 rounded-xl bg-white border border-slate-200 font-bold text-base cursor-pointer"
                >
                  −
                </button>
                <input
                  type="range"
                  min={45}
                  max={120}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="flex-1 accent-[#FF5A36] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => Math.min(120, w + 1))}
                  className="tap-scale w-9 h-9 rounded-xl bg-white border border-slate-200 font-bold text-base cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
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
                          ? "bg-[#0F172A] text-white border-[#0F172A]"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Budget par portion
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "eco", label: "Malin", sub: "< 2,50€" },
                  { id: "std", label: "Équilibré", sub: "~2,85€" },
                  { id: "gourmet", label: "Gourmet", sub: "~3,40€" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBudgetTier(b.id as BudgetTier)}
                    className={`tap-scale py-2 px-2 rounded-xl border text-center cursor-pointer ${
                      budgetTier === b.id
                        ? "bg-[#059669] text-white border-[#059669]"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <strong className="text-xs font-bold block">{b.label}</strong>
                    <span className="text-[11px] opacity-80">{b.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="tap-scale w-full py-3 bg-[#0F172A] text-white rounded-2xl text-sm font-bold cursor-pointer"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
