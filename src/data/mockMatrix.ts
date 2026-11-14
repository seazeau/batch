export type BrickCategory = "proteine" | "base" | "sauce";

export type SupermarketAisle =
  | "Boucherie & Volaille"
  | "Crèmerie & Frais Végétal"
  | "Fruits & Légumes"
  | "Épicerie Sèche & Monde"
  | "Condiments & Herbes";

export interface IngredientUsage {
  name: string;
  baseQtyForTwo: number;
  unit: string;
}

export interface CulinaryBrick {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  category: BrickCategory;
  prepTimeMin: number;
  cookTimeMin: number;
  storageDays: number;
  containerRecommendation: string;
  totalPortionsForTwo: number;
  portionWeightG: number;
  costPerPortion: number;
  macrosPerPortion: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  keyIngredients: IngredientUsage[];
  chefTip: string;
  colorTag: string;
}

export interface MealAssembly {
  id: string;
  dayLabel: string;
  mealSlot: string;
  name: string;
  tagline: string;
  portionsForTwo: number; // 4 portions per assembly (2 people x 2 meals)
  proteinBrickId: string;
  baseBrickId: string;
  sauceBrickId: string;
  assemblyInstructions: string;
  reheatAdvice: string;
  costPerPortion: number;
  macrosPerPortion: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  assemblyWeightsG: {
    proteinG: number;
    baseG: number;
    sauceG: number;
  };
  badges: string[];
}

export interface GroceryItem {
  id: string;
  name: string;
  brandNote: string;
  aisle: SupermarketAisle;
  baseQuantityForTwo: number;
  unit: string;
  priceForTwo: number; // Real French supermarket price in EUR
  totalProteinG: number; // Total protein in this package/quantity for 2 people
  proteinPerEuro: number; // g of protein per EUR spent
  efficiencyTier: "elite" | "high" | "moderate" | "micronutrient";
  usedInBricks: string[]; // Brick codes e.g. ["P1", "S1"]
}

export interface TimelineStep {
  id: string;
  stepNumber: number;
  timeMarker: string; // e.g. "T+00 min"
  startMin: number;
  endMin: number;
  durationMin: number;
  title: string;
  station: "Four & Découpe" | "Plaques & Cuisson" | "Plan de travail" | "Dressage & Stockage";
  relatedBrickCodes: string[];
  description: string;
  detailedActions: string[];
  parallelTask?: string;
  proTip: string;
  temperatureOrFlame?: string;
}

export interface BatchMatrixData {
  planMeta: {
    title: string;
    subtitle: string;
    defaultPeople: number;
    mealsPerPersonPerWeek: number; // 10 meals/week
    baseTotalPortions: number; // 20 portions for 2 people
    targetMaxCostPerPortion: number; // 3.20 EUR
    targetDailyProteinPerPerson: number; // 130g / day
    sessionTotalDurationMin: number; // 80 min (1h20)
    supermarketReference: string;
  };
  bricks: {
    proteins: CulinaryBrick[];
    bases: CulinaryBrick[];
    sauces: CulinaryBrick[];
  };
  assemblies: MealAssembly[];
  groceryList: GroceryItem[];
  timeline: TimelineStep[];
}

export const MOCK_MATRIX: BatchMatrixData = {
  planMeta: {
    title: "Matrice Semaine #14 — Méditerranée & Asie Protéinée",
    subtitle: "3 Protéines × 2 Bases × 3 Sauces • Session Dimanche 1h20",
    defaultPeople: 2,
    mealsPerPersonPerWeek: 10,
    baseTotalPortions: 20,
    targetMaxCostPerPortion: 3.2,
    targetDailyProteinPerPerson: 130,
    sessionTotalDurationMin: 80,
    supermarketReference: "Prix moyens relevés en France (E.Leclerc / Carrefour — Format familial)",
  },

  bricks: {
    proteins: [
      {
        id: "prot-poulet-citron",
        code: "P1",
        name: "Hauts de cuisse de poulet marinés citron & origan",
        subtitle: "Rôtis à cœur au four, juteux même après réchauffage",
        category: "proteine",
        prepTimeMin: 10,
        cookTimeMin: 28,
        storageDays: 4,
        containerRecommendation: "Boîte verre hermétique 1,5L avec jus de cuisson filtré",
        totalPortionsForTwo: 8,
        portionWeightG: 165,
        costPerPortion: 1.58,
        macrosPerPortion: {
          calories: 310,
          protein: 42,
          carbs: 2,
          fat: 14,
          fiber: 0,
        },
        keyIngredients: [
          { name: "Hauts de cuisse de poulet désossés", baseQtyForTwo: 1400, unit: "g" },
          { name: "Citrons jaunes non traités", baseQtyForTwo: 2, unit: "pcs" },
          { name: "Origan séché & Ail frais", baseQtyForTwo: 15, unit: "g" },
          { name: "Huile d'olive vierge extra", baseQtyForTwo: 20, unit: "ml" },
        ],
        chefTip:
          "Contrairement au blanc de poulet qui sèche au micro-ondes, le haut de cuisse désossé reste ultra-tendre pendant 4 jours grâce à son léger persillage.",
        colorTag: "#D97706",
      },
      {
        id: "prot-dal-corail",
        code: "P2",
        name: "Dal de lentilles corail, lait de coco & protéines de soja",
        subtitle: "Mijoté crémeux au curry doux, curcuma, gingembre & épinards",
        category: "proteine",
        prepTimeMin: 8,
        cookTimeMin: 20,
        storageDays: 5,
        containerRecommendation: "2 boîtes verre 1L (se bonifie avec les épices)",
        totalPortionsForTwo: 8,
        portionWeightG: 260,
        costPerPortion: 0.92,
        macrosPerPortion: {
          calories: 345,
          protein: 31,
          carbs: 38,
          fat: 7,
          fiber: 9,
        },
        keyIngredients: [
          { name: "Lentilles corail sèches", baseQtyForTwo: 600, unit: "g" },
          { name: "Protéines de soja texturées fines", baseQtyForTwo: 200, unit: "g" },
          { name: "Lait de coco léger cuisine", baseQtyForTwo: 400, unit: "ml" },
          { name: "Tomates concassées & Épinards frais", baseQtyForTwo: 550, unit: "g" },
        ],
        chefTip:
          "L'ajout de 200g de protéines de soja texturées fines dans le dal est invisible en texture mais double la densité protéique pour moins de 1,80 €.",
        colorTag: "#B45309",
      },
      {
        id: "prot-tofu-oeufs",
        code: "P3",
        name: "Œufs mollets 6'30 & Tofu ferme laqué soja/sésame",
        subtitle: "Double source protéique végétarienne caramélisée à la poêle",
        category: "proteine",
        prepTimeMin: 10,
        cookTimeMin: 15,
        storageDays: 4,
        containerRecommendation: "Œufs écalés dans eau froide + Tofu en boîte séparée",
        totalPortionsForTwo: 4,
        portionWeightG: 210,
        costPerPortion: 1.52,
        macrosPerPortion: {
          calories: 330,
          protein: 34,
          carbs: 6,
          fat: 19,
          fiber: 2,
        },
        keyIngredients: [
          { name: "Tofu ferme nature bio", baseQtyForTwo: 500, unit: "g" },
          { name: "Œufs plein air calibre L", baseQtyForTwo: 8, unit: "pcs" },
          { name: "Sauce soja réduite en sel", baseQtyForTwo: 45, unit: "ml" },
          { name: "Graines de sésame & Fécule", baseQtyForTwo: 30, unit: "g" },
        ],
        chefTip:
          "Enrobez les dés de tofu pressés d'une fine voile de fécule de maïs avant de les saisir : la sauce soja adhère instantanément en croûte croustillante.",
        colorTag: "#92400E",
      },
    ],

    bases: [
      {
        id: "base-riz-quinoa",
        code: "B1",
        name: "Duo Riz Basmati & Quinoa blanc au bouillon d'herbes",
        subtitle: "Céréale à index glycémique maîtrisé & profil d'acides aminés complet",
        category: "base",
        prepTimeMin: 5,
        cookTimeMin: 15,
        storageDays: 5,
        containerRecommendation: "Grand bac hermétique 2,5L (égrener à la fourchette avant fermeture)",
        totalPortionsForTwo: 12,
        portionWeightG: 185,
        costPerPortion: 0.44,
        macrosPerPortion: {
          calories: 235,
          protein: 8,
          carbs: 46,
          fat: 2,
          fiber: 3,
        },
        keyIngredients: [
          { name: "Riz basmati long grain", baseQtyForTwo: 600, unit: "g" },
          { name: "Quinoa blanc rincé", baseQtyForTwo: 300, unit: "g" },
          { name: "Bouillon de légumes dégraissé", baseQtyForTwo: 2, unit: "cubes" },
        ],
        chefTip:
          "Le ratio 2/3 riz basmati + 1/3 quinoa cuit par absorption dans le même faitout apporte 8g de protéines végétales supplémentaires par portion.",
        colorTag: "#2D5A27",
      },
      {
        id: "base-legumes-rotis",
        code: "B2",
        name: "Grand plateau de légumes racines & brocolis rôtis au four",
        subtitle: "Patates douces, carottes, fleurons de brocolis & oignons rouges caramélisés",
        category: "base",
        prepTimeMin: 15,
        cookTimeMin: 30,
        storageDays: 5,
        containerRecommendation: "2 boîtes verre 1,5L avec feuille d'essuie-tout au fond",
        totalPortionsForTwo: 12,
        portionWeightG: 240,
        costPerPortion: 0.68,
        macrosPerPortion: {
          calories: 145,
          protein: 5,
          carbs: 24,
          fat: 3,
          fiber: 6,
        },
        keyIngredients: [
          { name: "Patates douces & Carottes", baseQtyForTwo: 1400, unit: "g" },
          { name: "Brocolis frais en fleurons", baseQtyForTwo: 900, unit: "g" },
          { name: "Oignons rouges", baseQtyForTwo: 350, unit: "g" },
          { name: "Paprika fumé & Huile d'olive", baseQtyForTwo: 20, unit: "ml" },
        ],
        chefTip:
          "Ajoutez les fleurons de brocolis sur la plaque uniquement durant les 15 dernières minutes de cuisson pour conserver leur croquant et leur couleur vert émeraude.",
        colorTag: "#1E4620",
      },
    ],

    sauces: [
      {
        id: "sauce-tzatziki-skyr",
        code: "S1",
        name: "Tzatziki haute teneur protéique au Skyr, menthe & concombre",
        subtitle: "Zéro mayonnaise — onctuosité maximale et +9g de protéines par portion",
        category: "sauce",
        prepTimeMin: 8,
        cookTimeMin: 0,
        storageDays: 5,
        containerRecommendation: "Bocal en verre 750ml",
        totalPortionsForTwo: 8,
        portionWeightG: 85,
        costPerPortion: 0.42,
        macrosPerPortion: {
          calories: 62,
          protein: 9,
          carbs: 4,
          fat: 1,
          fiber: 1,
        },
        keyIngredients: [
          { name: "Skyr nature 0% MG", baseQtyForTwo: 500, unit: "g" },
          { name: "Concombre dégorgé râpé", baseQtyForTwo: 250, unit: "g" },
          { name: "Menthe fraîche, Ail & Jus de citron", baseQtyForTwo: 30, unit: "g" },
        ],
        chefTip:
          "Pressez fermement le concombre râpé dans un torchon propre : vous évitez tout rejet d'eau et le tzatziki reste épais jusqu'au vendredi.",
        colorTag: "#0F766E",
      },
      {
        id: "sauce-satay-arachide",
        code: "S2",
        name: "Sauce Satay crémeuse 100% cacahuète, citron vert & gingembre",
        subtitle: "Émulsion tiède riche en bons lipides et protéines végétales",
        category: "sauce",
        prepTimeMin: 6,
        cookTimeMin: 0,
        storageDays: 6,
        containerRecommendation: "Pot à confiture en verre 500ml",
        totalPortionsForTwo: 8,
        portionWeightG: 50,
        costPerPortion: 0.34,
        macrosPerPortion: {
          calories: 148,
          protein: 7,
          carbs: 6,
          fat: 11,
          fiber: 2,
        },
        keyIngredients: [
          { name: "Purée de cacahuète 100% grillée", baseQtyForTwo: 220, unit: "g" },
          { name: "Sauce soja & Jus de citron vert", baseQtyForTwo: 50, unit: "ml" },
          { name: "Gingembre frais râpé & Eau chaude", baseQtyForTwo: 120, unit: "ml" },
        ],
        chefTip:
          "Détendez la purée d'arachide à l'eau bien chaude petit à petit au fouet : elle blanchit d'abord puis devient lisse et nappante.",
        colorTag: "#D97706",
      },
      {
        id: "sauce-chimichurri",
        code: "S3",
        name: "Chimichurri vert express persil plat, coriandre & piment doux",
        subtitle: "Condiment herbacé cru riche en vitamines C et antioxydants",
        category: "sauce",
        prepTimeMin: 7,
        cookTimeMin: 0,
        storageDays: 6,
        containerRecommendation: "Bocal verre 350ml recouvert d'un fin film d'huile",
        totalPortionsForTwo: 4,
        portionWeightG: 40,
        costPerPortion: 0.38,
        macrosPerPortion: {
          calories: 85,
          protein: 1,
          carbs: 2,
          fat: 8,
          fiber: 1,
        },
        keyIngredients: [
          { name: "Persil plat & Coriandre fraîche", baseQtyForTwo: 80, unit: "g" },
          { name: "Huile d'olive & Vinaigre de vin rouge", baseQtyForTwo: 45, unit: "ml" },
          { name: "Ail, Origan & Flocons de piment", baseQtyForTwo: 15, unit: "g" },
        ],
        chefTip:
          "Hachez les herbes au couteau plutôt qu'au mixeur rapide pour ne pas chauffer la chlorophylle et garder une texture rustique.",
        colorTag: "#2D5A27",
      },
    ],
  },

  assemblies: [
    {
      id: "meal-1",
      dayLabel: "Lundi & Mercredi Midi",
      mealSlot: "Assemblage #1 • Méditerranéen",
      name: "Bowl Grec Poulet Citron-Origan, Riz-Quinoa & Tzatziki au Skyr",
      tagline: "Le pilier hyper-protéiné frais et digeste pour démarrer la semaine sans coup de barre.",
      portionsForTwo: 4,
      proteinBrickId: "prot-poulet-citron",
      baseBrickId: "base-riz-quinoa",
      sauceBrickId: "sauce-tzatziki-skyr",
      assemblyInstructions:
        "Disposez 185g de duo riz-quinoa chaud en base, ajoutez 180g de hauts de cuisse de poulet tranchés et 100g de légumes rôtis, puis déposez 95g de Tzatziki au Skyr bien froid au moment de servir.",
      reheatAdvice: "Réchauffez base + poulet 2 min à 750W. Ajoutez le Tzatziki Skyr après réchauffage.",
      costPerPortion: 2.96,
      macrosPerPortion: {
        calories: 665,
        protein: 66,
        carbs: 58,
        fat: 18,
        fiber: 5,
      },
      assemblyWeightsG: {
        proteinG: 180,
        baseG: 260,
        sauceG: 95,
      },
      badges: ["Champion Protéines (66g)", "Satiété 6h", "Sans lactose lourd"],
    },
    {
      id: "meal-2",
      dayLabel: "Lundi & Jeudi Soir",
      mealSlot: "Assemblage #2 • Indien Fusion",
      name: "Grand Dal Corail Soja-Coco, Légumes Racines Rôtis & Fraîcheur Skyr",
      tagline: "Un dîner végétal réconfortant à 62g de protéines grâce au combo lentilles, soja texturé et Skyr.",
      portionsForTwo: 4,
      proteinBrickId: "prot-dal-corail",
      baseBrickId: "base-legumes-rotis",
      sauceBrickId: "sauce-tzatziki-skyr",
      assemblyInstructions:
        "Versez 290g de Dal de lentilles corail & soja bien chaud sur 240g de patates douces et brocolis rôtis. Couronnez d'une généreuse cuillère (95g) de Tzatziki au Skyr mentholé.",
      reheatAdvice: "3 min au micro-ondes avec un filet d'eau pour détendre le dal, puis topping Skyr froid.",
      costPerPortion: 2.38,
      macrosPerPortion: {
        calories: 615,
        protein: 62,
        carbs: 66,
        fat: 11,
        fiber: 15,
      },
      assemblyWeightsG: {
        proteinG: 290,
        baseG: 240,
        sauceG: 95,
      },
      badges: ["Ultra-Éco (2,38€)", "Riche en Fibres (15g)", "100% Végétarien"],
    },
    {
      id: "meal-3",
      dayLabel: "Mardi & Vendredi Midi",
      mealSlot: "Assemblage #3 • Street-Food Asiatique",
      name: "Tofu Laqué Sésame & Œufs Mollets, Duo Riz-Quinoa & Sauce Satay",
      tagline: "Explosion umami : le jaune d'œuf coulant se mêle à la sauce cacahuète-citron vert.",
      portionsForTwo: 4,
      proteinBrickId: "prot-tofu-oeufs",
      baseBrickId: "base-riz-quinoa",
      sauceBrickId: "sauce-satay-arachide",
      assemblyInstructions:
        "Sur 200g de riz-quinoa et quelques fleurons de brocolis rôtis, dressez 125g de tofu grillé au sésame et 2 œufs mollets coupés en deux. Nappez de 55g de sauce Satay tiédie.",
      reheatAdvice: "Réchauffez le riz et le tofu 1m45, plongez les œufs mollets 30 sec dans l'eau chaude.",
      costPerPortion: 2.88,
      macrosPerPortion: {
        calories: 720,
        protein: 63,
        carbs: 56,
        fat: 26,
        fiber: 7,
      },
      assemblyWeightsG: {
        proteinG: 225,
        baseG: 230,
        sauceG: 55,
      },
      badges: ["Oméga & Bons Lipides", "Profil Acides Aminés 100%", "Végétarien"],
    },
    {
      id: "meal-4",
      dayLabel: "Mardi & Mercredi Soir",
      mealSlot: "Assemblage #4 • Grill & Chimichurri",
      name: "Poulet Rôti Tranché, Plateau de Légumes Racines & Chimichurri Vert",
      tagline: "Profil low-carb du soir : haute densité protéique, légumes caramélisés et herbes fraîches.",
      portionsForTwo: 4,
      proteinBrickId: "prot-poulet-citron",
      baseBrickId: "base-legumes-rotis",
      sauceBrickId: "sauce-chimichurri",
      assemblyInstructions:
        "Associez 195g de hauts de cuisse de poulet dorés à 260g de légumes rôtis (patate douce, carotte, brocoli) et 80g de riz-quinoa. Arrosez de 40g de Chimichurri frais.",
      reheatAdvice: "2 min au micro-ondes ou 4 min à la poêle chaude pour recroustiller la peau du poulet.",
      costPerPortion: 3.12,
      macrosPerPortion: {
        calories: 640,
        protein: 68,
        carbs: 38,
        fat: 23,
        fiber: 7,
      },
      assemblyWeightsG: {
        proteinG: 195,
        baseG: 340,
        sauceG: 40,
      },
      badges: ["Record Protéines (68g)", "Digestion Légère Soir", "Antioxydant"],
    },
    {
      id: "meal-5",
      dayLabel: "Jeudi Midi & Vendredi Soir",
      mealSlot: "Assemblage #5 • Curry Satay",
      name: "Tiger Bowl : Dal Corail Coco, Riz-Quinoa, Brocolis & Satay Arachide",
      tagline: "Alliance crémeuse coco-cacahuète : le repas d'endurance à moins de 2,90 € la portion.",
      portionsForTwo: 4,
      proteinBrickId: "prot-dal-corail",
      baseBrickId: "base-riz-quinoa",
      sauceBrickId: "sauce-satay-arachide",
      assemblyInstructions:
        "Combinez 170g de duo riz-quinoa, 270g de Dal de lentilles corail protéiné et 100g de brocolis rôtis. Terminez par 50g de sauce Satay cacahuète-gingembre.",
      reheatAdvice: "2m30 au micro-ondes tout compris : la sauce satay fond directement sur le dal chaud.",
      costPerPortion: 2.86,
      macrosPerPortion: {
        calories: 710,
        protein: 66,
        carbs: 74,
        fat: 16,
        fiber: 13,
      },
      assemblyWeightsG: {
        proteinG: 270,
        baseG: 270,
        sauceG: 50,
      },
      badges: ["Énergie Longue Durée", "100% Végétal", "Coût Plancher"],
    },
  ],

  groceryList: [
    // Boucherie & Volaille
    {
      id: "groc-poulet",
      name: "Hauts de cuisse de poulet désossés (Pack familial)",
      brandNote: "Barquette promo 1,4 kg — Volaille française",
      aisle: "Boucherie & Volaille",
      baseQuantityForTwo: 1.4,
      unit: "kg",
      priceForTwo: 12.6,
      totalProteinG: 336,
      proteinPerEuro: 26.7,
      efficiencyTier: "high",
      usedInBricks: ["P1"],
    },
    // Crèmerie & Frais Végétal
    {
      id: "groc-oeufs",
      name: "Œufs plein air calibre L",
      brandNote: "Boîte de 8 œufs frais",
      aisle: "Crèmerie & Frais Végétal",
      baseQuantityForTwo: 8,
      unit: "pcs",
      priceForTwo: 2.4,
      totalProteinG: 56,
      proteinPerEuro: 23.3,
      efficiencyTier: "high",
      usedInBricks: ["P3"],
    },
    {
      id: "groc-tofu",
      name: "Tofu ferme nature Bio",
      brandNote: "Lot 500g sous vide",
      aisle: "Crèmerie & Frais Végétal",
      baseQuantityForTwo: 500,
      unit: "g",
      priceForTwo: 3.1,
      totalProteinG: 80,
      proteinPerEuro: 25.8,
      efficiencyTier: "high",
      usedInBricks: ["P3"],
    },
    {
      id: "groc-skyr",
      name: "Skyr nature 0% MG",
      brandNote: "Pot familial 500g (11g prot/100g)",
      aisle: "Crèmerie & Frais Végétal",
      baseQuantityForTwo: 500,
      unit: "g",
      priceForTwo: 2.35,
      totalProteinG: 55,
      proteinPerEuro: 23.4,
      efficiencyTier: "high",
      usedInBricks: ["S1"],
    },
    // Épicerie Sèche & Monde
    {
      id: "groc-lentilles",
      name: "Lentilles corail sèches",
      brandNote: "Sachet vrac / marque distributeur (25g prot/100g)",
      aisle: "Épicerie Sèche & Monde",
      baseQuantityForTwo: 600,
      unit: "g",
      priceForTwo: 2.1,
      totalProteinG: 150,
      proteinPerEuro: 71.4,
      efficiencyTier: "elite",
      usedInBricks: ["P2"],
    },
    {
      id: "groc-pst",
      name: "Protéines de soja texturées fines",
      brandNote: "Rayon bio / vrac (50g prot/100g)",
      aisle: "Épicerie Sèche & Monde",
      baseQuantityForTwo: 200,
      unit: "g",
      priceForTwo: 1.75,
      totalProteinG: 100,
      proteinPerEuro: 57.1,
      efficiencyTier: "elite",
      usedInBricks: ["P2"],
    },
    {
      id: "groc-cacahuete",
      name: "Purée de cacahuète 100% arachides grillées",
      brandNote: "Pot 250g sans sucre ni huile de palme",
      aisle: "Épicerie Sèche & Monde",
      baseQuantityForTwo: 220,
      unit: "g",
      priceForTwo: 2.2,
      totalProteinG: 58,
      proteinPerEuro: 26.4,
      efficiencyTier: "high",
      usedInBricks: ["S2"],
    },
    {
      id: "groc-riz",
      name: "Riz basmati long grain",
      brandNote: "Paquet 1kg (utilisé : 600g)",
      aisle: "Épicerie Sèche & Monde",
      baseQuantityForTwo: 600,
      unit: "g",
      priceForTwo: 1.95,
      totalProteinG: 54,
      proteinPerEuro: 27.7,
      efficiencyTier: "high",
      usedInBricks: ["B1"],
    },
    {
      id: "groc-quinoa",
      name: "Quinoa blanc en grains",
      brandNote: "Sachet 300g (14g prot/100g)",
      aisle: "Épicerie Sèche & Monde",
      baseQuantityForTwo: 300,
      unit: "g",
      priceForTwo: 2.8,
      totalProteinG: 42,
      proteinPerEuro: 15.0,
      efficiencyTier: "moderate",
      usedInBricks: ["B1"],
    },
    {
      id: "groc-coco",
      name: "Lait de coco cuisine léger (brique 400ml)",
      brandNote: "Rayon cuisine du monde",
      aisle: "Épicerie Sèche & Monde",
      baseQuantityForTwo: 400,
      unit: "ml",
      priceForTwo: 1.45,
      totalProteinG: 6,
      proteinPerEuro: 4.1,
      efficiencyTier: "micronutrient",
      usedInBricks: ["P2"],
    },
    {
      id: "groc-tomates",
      name: "Tomates concassées en boîte",
      brandNote: "Conserve 400g",
      aisle: "Épicerie Sèche & Monde",
      baseQuantityForTwo: 400,
      unit: "g",
      priceForTwo: 1.1,
      totalProteinG: 5,
      proteinPerEuro: 4.5,
      efficiencyTier: "micronutrient",
      usedInBricks: ["P2"],
    },
    // Fruits & Légumes
    {
      id: "groc-patates-carottes",
      name: "Patates douces & Carottes de sable",
      brandNote: "900g patates douces + 500g carottes",
      aisle: "Fruits & Légumes",
      baseQuantityForTwo: 1.4,
      unit: "kg",
      priceForTwo: 4.2,
      totalProteinG: 18,
      proteinPerEuro: 4.3,
      efficiencyTier: "micronutrient",
      usedInBricks: ["B2"],
    },
    {
      id: "groc-brocolis",
      name: "Brocolis frais (2 belles têtes)",
      brandNote: "Riche en vitamine C et fibres",
      aisle: "Fruits & Légumes",
      baseQuantityForTwo: 900,
      unit: "g",
      priceForTwo: 3.4,
      totalProteinG: 27,
      proteinPerEuro: 7.9,
      efficiencyTier: "moderate",
      usedInBricks: ["B2"],
    },
    {
      id: "groc-epinards-concombre",
      name: "Pousses d'épinards frais & 1 Concombre",
      brandNote: "Sachet 150g épinards + 1 concombre lisse",
      aisle: "Fruits & Légumes",
      baseQuantityForTwo: 400,
      unit: "g",
      priceForTwo: 2.9,
      totalProteinG: 8,
      proteinPerEuro: 2.8,
      efficiencyTier: "micronutrient",
      usedInBricks: ["P2", "S1"],
    },
    {
      id: "groc-agrumes-oignons",
      name: "Citrons jaunes (x2), Citrons verts (x2) & Oignons rouges",
      brandNote: "Filet oignons rouges + agrumes non traités",
      aisle: "Fruits & Légumes",
      baseQuantityForTwo: 650,
      unit: "g",
      priceForTwo: 3.6,
      totalProteinG: 6,
      proteinPerEuro: 1.7,
      efficiencyTier: "micronutrient",
      usedInBricks: ["P1", "B2", "S1", "S2"],
    },
    // Condiments & Herbes
    {
      id: "groc-herbes",
      name: "Bottes fraîches : Persil plat, Coriandre, Menthe & Gingembre",
      brandNote: "Rayon herbes fraîches",
      aisle: "Condiments & Herbes",
      baseQuantityForTwo: 180,
      unit: "g",
      priceForTwo: 4.5,
      totalProteinG: 6,
      proteinPerEuro: 1.3,
      efficiencyTier: "micronutrient",
      usedInBricks: ["P2", "S1", "S2", "S3"],
    },
    {
      id: "groc-placard",
      name: "Fond de placard (Huile d'olive, Sauce soja, Sésame, Épices, Ail)",
      brandNote: "Quote-part hebdomadaire consommée",
      aisle: "Condiments & Herbes",
      baseQuantityForTwo: 1,
      unit: "lot",
      priceForTwo: 4.4,
      totalProteinG: 12,
      proteinPerEuro: 2.7,
      efficiencyTier: "micronutrient",
      usedInBricks: ["P1", "P2", "P3", "B1", "B2", "S3"],
    },
  ],

  timeline: [
    {
      id: "step-1",
      stepNumber: 1,
      timeMarker: "T+00 min",
      startMin: 0,
      endMin: 10,
      durationMin: 10,
      title: "Préchauffage du four & Marinade express du poulet",
      station: "Four & Découpe",
      relatedBrickCodes: ["P1", "S1"],
      description:
        "Lancez le four à 200°C chaleur tournante. Mettez le poulet à mariner et faites dégorger le concombre râpé.",
      detailedActions: [
        "Allumer le four à 200°C (chaleur tournante) avec 2 grandes plaques à l'intérieur.",
        "Dans un saladier, masser les hauts de cuisse de poulet avec le jus de citron, l'origan, l'ail pressé, l'huile d'olive, sel et poivre.",
        "Râper le concombre dans une passoire avec 1 c.à.c de sel fin pour qu'il dégorge pendant que vous découpez les légumes.",
      ],
      parallelTask: "Le four monte en température + le concombre perd son eau tout seul.",
      proTip: "Sortir les plaques seulement au moment d'enfourner garantit une saisie immédiate façon plancha.",
      temperatureOrFlame: "Four 200°C",
    },
    {
      id: "step-2",
      stepNumber: 2,
      timeMarker: "T+10 min",
      startMin: 10,
      endMin: 22,
      durationMin: 12,
      title: "Découpe des légumes racines & Enfourner Poulet + Racines",
      station: "Four & Découpe",
      relatedBrickCodes: ["P1", "B2"],
      description:
        "Taillez les patates douces, carottes et oignons rouges, puis enfournez simultanément sur 2 niveaux.",
      detailedActions: [
        "Couper les patates douces et carottes en cubes réguliers de 2 cm et les oignons rouges en quartiers.",
        "Enrober d'huile d'olive, paprika fumé et sel sur la Plaque #1. Déposer les hauts de cuisse de poulet marinés sur la Plaque #2.",
        "Enfourner les 2 plaques à 200°C pour une première phase de 15 minutes.",
      ],
      parallelTask: "Pendant ce temps, détaillez les fleurons de brocolis et pressez le bloc de tofu dans un torchon.",
      proTip: "Gardez les brocolis hors du four pour l'instant : ils cuiront durant les 15 dernières minutes.",
      temperatureOrFlame: "Four 200°C (2 niveaux)",
    },
    {
      id: "step-3",
      stepNumber: 3,
      timeMarker: "T+22 min",
      startMin: 22,
      endMin: 34,
      durationMin: 12,
      title: "Lancement simultané du Dal Corail & du Duo Riz-Quinoa",
      station: "Plaques & Cuisson",
      relatedBrickCodes: ["P2", "B1"],
      description:
        "Activez deux feux sur la plaque de cuisson : les céréales et le dal mijotent en autonomie complète.",
      detailedActions: [
        "Faitout #1 : Rincer le riz basmati et le quinoa, verser 1,6x leur volume d'eau avec le bouillon d'herbes, couvrir à feu doux 14 min.",
        "Sauteuse #2 : Faire revenir gingembre et curry 1 min, ajouter lentilles corail, protéines de soja texturées, lait de coco, tomates concassées et 500ml d'eau. Mijoter à feu moyen-doux 18 min.",
      ],
      parallelTask: "Les 2 plaques au four + les 2 casseroles sur le feu travaillent en même temps (4 cuissons actives).",
      proTip: "Ne soulevez jamais le couvercle du duo riz-quinoa : la vapeur emprisonnée assure des grains parfaitement détachés.",
      temperatureOrFlame: "Feu doux & Feu moyen",
    },
    {
      id: "step-4",
      stepNumber: 4,
      timeMarker: "T+34 min",
      startMin: 34,
      endMin: 44,
      durationMin: 10,
      title: "Ajout des Brocolis au four & Cuisson des Œufs Mollets 6'30",
      station: "Plaques & Cuisson",
      relatedBrickCodes: ["B2", "P3"],
      description:
        "Ajoutez les brocolis sur la plaque de légumes et plongez les œufs exactement 6 minutes 30 dans l'eau frémissante.",
      detailedActions: [
        "Ouvrir le four, répartir les fleurons de brocolis sur la Plaque #1 avec les légumes racines et poursuivre la cuisson 15 min.",
        "Casserole #3 : Porter l'eau à ébullition, plonger les 8 œufs délicatement à la cuillère pour 6 min 30 chrono.",
        "À la sonnerie, transférer immédiatement les œufs dans un saladier d'eau glacée pour stopper la cuisson.",
      ],
      parallelTask: "Vérifiez la texture du Dal : incorporez les pousses d'épinards frais en fin de cuisson.",
      proTip: "6 min 30 donne un jaune crémeux qui ne sèche pas lors du service en bowl le midi.",
      temperatureOrFlame: "Eau frémissante 100°C",
    },
    {
      id: "step-5",
      stepNumber: 5,
      timeMarker: "T+44 min",
      startMin: 44,
      endMin: 56,
      durationMin: 12,
      title: "Sortie du four & Saisie du Tofu laqué soja/sésame",
      station: "Plaques & Cuisson",
      relatedBrickCodes: ["P1", "B2", "P3", "B1"],
      description:
        "Sortez les 2 plaques dorées du four, coupez le feu sous le riz et le dal, puis caramélisez le tofu à la poêle.",
      detailedActions: [
        "Sortir le poulet rôti et le plateau de légumes du four. Égrener le duo riz-quinoa à la fourchette.",
        "Couper le tofu pressé en cubes de 2 cm, les enrober de fécule de maïs et les dorer 6 min à la poêle bien chaude.",
        "Déglacer hors du feu avec la sauce soja et les graines de sésame grillées pour laquer chaque cube.",
      ],
      parallelTask: "Les bases chaudes refroidissent tranquillement à température ambiante avant la mise en boîte.",
      proTip: "Versez le jus de cuisson citronné de la plaque de poulet directement sur les hauts de cuisse pour sceller le moelleux.",
      temperatureOrFlame: "Poêle feu vif",
    },
    {
      id: "step-6",
      stepNumber: 6,
      timeMarker: "T+56 min",
      startMin: 56,
      endMin: 66,
      durationMin: 10,
      title: "Assemblage à froid des 3 Sauces Maison",
      station: "Plan de travail",
      relatedBrickCodes: ["S1", "S2", "S3"],
      description:
        "Toutes les cuissons sont terminées : réalisez les 3 sauces en série directement dans leurs bocaux de conservation.",
      detailedActions: [
        "Bocal #1 (Tzatziki) : Presser le concombre dégorgé dans un torchon, mélanger au Skyr 0%, menthe ciselée, ail et zeste de citron.",
        "Bocal #2 (Satay) : Fouetter la purée de cacahuète avec sauce soja, jus de citron vert, gingembre râpé et eau chaude jusqu'à texture ruban.",
        "Bocal #3 (Chimichurri) : Ciseler finement persil plat et coriandre, émulsionner avec huile d'olive, vinaigre de vin rouge et origan.",
      ],
      parallelTask: "Écalez les 8 œufs refroidis sous un filet d'eau froide.",
      proTip: "Préparer les sauces directement dans leurs bocaux gradués économise 3 bols de vaisselle.",
      temperatureOrFlame: "À froid (Zéro cuisson)",
    },
    {
      id: "step-7",
      stepNumber: 7,
      timeMarker: "T+66 min",
      startMin: 66,
      endMin: 74,
      durationMin: 8,
      title: "Portionnage modulaire & Mise en boîtes hermétiques",
      station: "Dressage & Stockage",
      relatedBrickCodes: ["P1", "P2", "P3", "B1", "B2"],
      description:
        "Répartissez vos 8 briques dans leurs contenants en verre ou préparez vos 4 premiers meal-preps individuels.",
      detailedActions: [
        "Stocker chaque brique séparément (mode Buffet Modulable) ou assembler directement les boîtes du Lundi et Mardi.",
        "Placer une feuille d'essuie-tout sous les légumes rôtis pour absorber l'humidité résiduelle.",
        "Garder les 3 bocaux de sauces séparés pour ne jamais cuire le Tzatziki ou le Chimichurri au micro-ondes.",
      ],
      parallelTask: "Étiquetez les boîtes avec le code brique (P1, P2, P3, B1, B2) si vous stockez en mode familial.",
      proTip: "Attendez que la vapeur soit dissipée avant de clipser les couvercles hermétiques pour éviter la condensation.",
    },
    {
      id: "step-8",
      stepNumber: 8,
      timeMarker: "T+74 min",
      startMin: 74,
      endMin: 80,
      durationMin: 6,
      title: "Remise au propre du plan de travail & Rangement frigo",
      station: "Dressage & Stockage",
      relatedBrickCodes: ["S1", "S2", "S3"],
      description:
        "Dernier coup d'éponge, chargement du lave-vaisselle et organisation du réfrigérateur pour la semaine.",
      detailedActions: [
        "Placer les boîtes de poulet et œufs mollets sur l'étagère la plus froide du réfrigérateur (consommation Lundi à Mercredi).",
        "Positionner le Dal corail et le Tofu laqué à portée de main jusqu'au Vendredi.",
        "Lancer le lave-vaisselle : vos 20 portions de la semaine sont prêtes !",
      ],
      parallelTask: "Session terminée en 1h20 chrono.",
      proTip: "Chaque repas de la semaine ne vous demandera plus que 2 minutes d'assemblage et de réchauffage.",
    },
  ],
};
