"use client";

import React from "react";
import {
  Users,
  Wallet,
  Flame,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Scale,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { BatchMatrixData } from "@/data/mockMatrix";

interface ConfiguratorViewProps {
  data: BatchMatrixData;
  peopleCount: number;
  setPeopleCount: (count: number) => void;
  onNavigateTab: (tab: "config" | "matrix" | "grocery" | "session") => void;
  checkedGroceryCount: number;
  completedStepsCount: number;
}

export default function ConfiguratorView({
  data,
  peopleCount,
  setPeopleCount,
  onNavigateTab,
  checkedGroceryCount,
  completedStepsCount,
}: ConfiguratorViewProps) {
  const scaleFactor = peopleCount / data.planMeta.defaultPeople;
  const totalPortions = peopleCount * data.planMeta.mealsPerPersonPerWeek;
  const totalMealsForHousehold = data.planMeta.mealsPerPersonPerWeek;

  // Dynamic calculations
  const baseTotalCost = data.groceryList.reduce((acc, item) => acc + item.priceForTwo, 0);
  const totalBasketCost = baseTotalCost * scaleFactor;
  const costPerPortion = totalBasketCost / totalPortions;
  const targetMaxCost = data.planMeta.targetMaxCostPerPortion;
  const savingsPerPortion = targetMaxCost - costPerPortion;
  const weeklySavingsVsTarget = savingsPerPortion * totalPortions;

  // Macros calculations across the 5 assemblies
  const avgProteinPerMeal =
    data.assemblies.reduce((acc, m) => acc + m.macrosPerPortion.protein, 0) /
    data.assemblies.length;
  const avgCaloriesPerMeal =
    data.assemblies.reduce((acc, m) => acc + m.macrosPerPortion.calories, 0) /
    data.assemblies.length;
  const avgCarbsPerMeal =
    data.assemblies.reduce((acc, m) => acc + m.macrosPerPortion.carbs, 0) /
    data.assemblies.length;
  const avgFatPerMeal =
    data.assemblies.reduce((acc, m) => acc + m.macrosPerPortion.fat, 0) /
    data.assemblies.length;

  const dailyProtein = avgProteinPerMeal * 2; // 2 meals/day from batch matrix
  const totalWeeklyProteinG = Math.round(avgProteinPerMeal * totalPortions);
  const avgProteinPerEuro = totalWeeklyProteinG / totalBasketCost;

  // Category cost breakdown
  const aisleTotals = data.groceryList.reduce<Record<string, number>>((acc, item) => {
    acc[item.aisle] = (acc[item.aisle] || 0) + item.priceForTwo * scaleFactor;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Top Hero & People Configurator Card */}
      <section className="bg-white rounded-2xl border border-[#E6E0D4] shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Editorial Intro */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E6E0D4]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F2E8] text-[#2D5A27] text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Optimisation Culinaire & Nutritionnelle
              </div>

              <h1 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#1C1917] tracking-tight leading-tight">
                {data.planMeta.title}
              </h1>

              <p className="text-[#57534E] text-sm sm:text-base leading-relaxed">
                Préparez{" "}
                <span className="font-semibold text-[#1C1917]">
                  {totalPortions} portions complètes
                </span>{" "}
                ({totalMealsForHousehold} repas pour {peopleCount}{" "}
                {peopleCount > 1 ? "personnes" : "personne"}) en une seule session dominicale de{" "}
                <span className="font-mono-tabular font-semibold text-[#2D5A27]">1h20</span>. Trois
                bases protéinées, deux bases végétales et trois sauces maison s&apos;assemblent sans
                aucune monotonie.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F3EFE6] grid grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E6E0D4]/70">
                <span className="text-[#78716C] block text-xs">Temps cuisine</span>
                <span className="font-mono-tabular font-bold text-[#1C1917] text-base sm:text-lg flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-[#2D5A27]" />
                  1h20
                </span>
              </div>
              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E6E0D4]/70">
                <span className="text-[#78716C] block text-xs">Rendement prot/€</span>
                <span className="font-mono-tabular font-bold text-[#D97706] text-base sm:text-lg flex items-center gap-1.5 mt-0.5">
                  <Scale className="w-4 h-4 text-[#D97706]" />
                  {avgProteinPerEuro.toFixed(1)} g/€
                </span>
              </div>
              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E6E0D4]/70">
                <span className="text-[#78716C] block text-xs">Briques dimanche</span>
                <span className="font-mono-tabular font-bold text-[#1C1917] text-base sm:text-lg flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-4 h-4 text-[#2D5A27]" />8 modules
                </span>
              </div>
            </div>
          </div>

          {/* Right Interactive Configurator */}
          <div className="lg:col-span-5 bg-[#F3EFE6]/60 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="people-selector"
                  className="text-xs font-bold uppercase tracking-wider text-[#57534E] flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-[#2D5A27]" />
                  Calibrage du foyer
                </label>
                <span className="text-xs font-mono-tabular px-2.5 py-0.5 rounded-md bg-white border border-[#E6E0D4] text-[#1C1917] font-semibold">
                  Facteur ×{scaleFactor.toFixed(1)}
                </span>
              </div>

              <p className="text-xs text-[#78716C] mb-4">
                Ajustez le nombre de convives : toutes les pesées des briques, la liste de courses
                et le budget sont recalculés instantanément.
              </p>

              {/* Quick Selector Pills 1 to 6 people */}
              <div
                id="people-selector"
                role="group"
                aria-label="Sélecteur du nombre de personnes"
                className="grid grid-cols-6 gap-2 mb-5"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const isSelected = peopleCount === num;
                  return (
                    <button
                      key={num}
                      id={`select-people-${num}`}
                      type="button"
                      onClick={() => setPeopleCount(num)}
                      className={`py-3 rounded-xl font-mono-tabular font-bold text-sm transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm scale-[1.02]"
                          : "bg-white text-[#1C1917] border-[#E6E0D4] hover:border-[#2D5A27]/50 hover:bg-[#FAF8F5]"
                      }`}
                    >
                      {num}p
                    </button>
                  );
                })}
              </div>

              {/* Summary Box of Active Calibration */}
              <div className="bg-white rounded-xl p-4 border border-[#E6E0D4] space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#57534E]">Volume hebdomadaire :</span>
                  <span className="font-mono-tabular font-bold text-[#1C1917]">
                    {totalPortions} portions ({peopleCount} pers. × 10 repas)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#57534E]">Objectif Budget :</span>
                  <span className="inline-flex items-center gap-1 font-mono-tabular font-semibold text-[#2D5A27]">
                    <CheckCircle2 className="w-4 h-4" />
                    Éco &lt; {targetMaxCost.toFixed(2).replace(".", ",")} €/portion
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#57534E]">Objectif Protéines :</span>
                  <span className="inline-flex items-center gap-1 font-mono-tabular font-semibold text-[#D97706]">
                    <Flame className="w-4 h-4" />
                    {data.planMeta.targetDailyProteinPerPerson}g / jour / pers.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                id="cta-open-matrix"
                type="button"
                onClick={() => onNavigateTab("matrix")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2D5A27] text-white text-sm font-semibold hover:bg-[#23471E] transition-colors cursor-pointer"
              >
                Explorer la Matrice
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="cta-open-session"
                type="button"
                onClick={() => onNavigateTab("session")}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-[#1C1917] border border-[#E6E0D4] hover:border-[#D97706] text-sm font-semibold transition-colors cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-[#D97706]" />
                Lancer 1h20
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Primary KPI Cards */}
      <section aria-label="Indicateurs clés de performance" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Coût total du panier */}
        <article className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2D5A27]" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                KPI 01 • Panier Hebdomadaire
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#E9F2E8] text-[#2D5A27] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#1C1917]">
                {totalBasketCost.toFixed(2).replace(".", ",")} €
              </span>
              <span className="text-xs font-medium text-[#78716C]">
                pour {totalPortions} portions
              </span>
            </div>

            <p className="text-xs text-[#57534E] mt-2">
              {data.planMeta.supermarketReference}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F3EFE6] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#57534E]">Protéines brutes (Volaille, Tofu, Œufs, Skyr)</span>
              <span className="font-mono-tabular font-semibold text-[#1C1917]">
                {(
                  (aisleTotals["Boucherie & Volaille"] || 0) +
                  (aisleTotals["Crèmerie & Frais Végétal"] || 0)
                )
                  .toFixed(2)
                  .replace(".", ",")}{" "}
                €
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#57534E]">Épicerie sèche (Lentilles, PST, Riz, Quinoa)</span>
              <span className="font-mono-tabular font-semibold text-[#1C1917]">
                {(aisleTotals["Épicerie Sèche & Monde"] || 0).toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#57534E]">Maraîcher & Herbes fraîches</span>
              <span className="font-mono-tabular font-semibold text-[#1C1917]">
                {(
                  (aisleTotals["Fruits & Légumes"] || 0) +
                  (aisleTotals["Condiments & Herbes"] || 0)
                )
                  .toFixed(2)
                  .replace(".", ",")}{" "}
                €
              </span>
            </div>
          </div>
        </article>

        {/* KPI 2: Coût par portion */}
        <article className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2D5A27]" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                KPI 02 • Coût par Portion
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#E9F2E8] text-[#2D5A27] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#2D5A27]">
                {costPerPortion.toFixed(2).replace(".", ",")} €
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E9F2E8] text-[#2D5A27] text-xs font-semibold">
                <TrendingDown className="w-3.5 h-3.5" />-
                {Math.round((savingsPerPortion / targetMaxCost) * 100)}% vs cible
              </span>
            </div>

            <p className="text-xs text-[#57534E] mt-2">
              Cible Éco fixée à{" "}
              <span className="font-mono-tabular font-semibold text-[#1C1917]">
                &lt; {targetMaxCost.toFixed(2).replace(".", ",")} €/portion
              </span>{" "}
              • Économie de{" "}
              <span className="font-mono-tabular font-semibold text-[#2D5A27]">
                {weeklySavingsVsTarget.toFixed(2).replace(".", ",")} €/semaine
              </span>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F3EFE6]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#57534E] font-medium">Jauge Budgétaire</span>
              <span className="font-mono-tabular text-[#2D5A27] font-semibold">
                {costPerPortion.toFixed(2).replace(".", ",")} € /{" "}
                {targetMaxCost.toFixed(2).replace(".", ",")} € max
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#F3EFE6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2D5A27] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (costPerPortion / targetMaxCost) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#78716C] mt-2">
              <span>Repas le + éco : 2,38 € (Dal & Légumes)</span>
              <span>Max : 3,12 €</span>
            </div>
          </div>
        </article>

        {/* KPI 3: Protéines moyennes par repas & par jour */}
        <article className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D97706]" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                KPI 03 • Densité Protéique
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#D97706]">
                {avgProteinPerMeal.toFixed(0)} g
              </span>
              <span className="text-xs font-semibold text-[#57534E]">/ repas</span>
              <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-mono-tabular text-xs font-bold">
                {dailyProtein.toFixed(0)} g / jour
              </span>
            </div>

            <p className="text-xs text-[#57534E] mt-2">
              Cible atteinte à{" "}
              <span className="font-mono-tabular font-semibold text-[#D97706]">100%</span> (
              {data.planMeta.targetDailyProteinPerPerson}g/jour couverts par les 2 repas principaux)
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F3EFE6]">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#57534E]">Équilibre moyen par assiette</span>
              <span className="font-mono-tabular font-semibold text-[#1C1917]">
                {avgCaloriesPerMeal.toFixed(0)} kcal
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#FEF3C7]/60 rounded-lg py-1.5 px-2 border border-[#D97706]/20">
                <span className="block text-[10px] uppercase text-[#92400E] font-bold">
                  Protéines
                </span>
                <span className="font-mono-tabular text-xs font-bold text-[#D97706]">
                  {avgProteinPerMeal.toFixed(0)}g
                </span>
              </div>
              <div className="bg-[#FAF8F5] rounded-lg py-1.5 px-2 border border-[#E6E0D4]">
                <span className="block text-[10px] uppercase text-[#57534E] font-bold">
                  Glucides
                </span>
                <span className="font-mono-tabular text-xs font-bold text-[#1C1917]">
                  {avgCarbsPerMeal.toFixed(0)}g
                </span>
              </div>
              <div className="bg-[#FAF8F5] rounded-lg py-1.5 px-2 border border-[#E6E0D4]">
                <span className="block text-[10px] uppercase text-[#57534E] font-bold">
                  Lipides
                </span>
                <span className="font-mono-tabular text-xs font-bold text-[#1C1917]">
                  {avgFatPerMeal.toFixed(0)}g
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Matrix Architecture Overview & Weekly Synthesis */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: How the 3x2x3 Matrix Works */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
                Architecture de la Matrice (3 × 2 × 3)
              </h2>
              <p className="text-xs text-[#57534E]">
                8 préparations brutes le dimanche génèrent 5 assemblages distincts sans jamais
                manger deux fois de suite le même plat.
              </p>
            </div>
            <button
              id="btn-view-details-matrix"
              type="button"
              onClick={() => onNavigateTab("matrix")}
              className="text-xs font-semibold text-[#2D5A27] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              Voir les fiches
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Column 1: 3 Proteins */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E6E0D4]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  3 Bases Protéinées
                </span>
                <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">
                  P1 • P2 • P3
                </span>
              </div>
              <ul className="space-y-2.5 text-xs">
                {data.bricks.proteins.map((p) => (
                  <li
                    key={p.id}
                    className="p-2.5 rounded-lg bg-white border border-[#E6E0D4]/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular font-bold text-[#D97706]">{p.code}</span>
                      <span className="font-mono-tabular text-[11px] font-semibold text-[#57534E]">
                        {Math.round(p.totalPortionsForTwo * scaleFactor)} portions
                      </span>
                    </div>
                    <span className="font-semibold text-[#1C1917] leading-snug">{p.name}</span>
                    <span className="font-mono-tabular text-[11px] text-[#2D5A27]">
                      {p.macrosPerPortion.protein}g prot •{" "}
                      {p.costPerPortion.toFixed(2).replace(".", ",")}€/p
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: 2 Carbs/Veggie Bases */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E6E0D4]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                  2 Socles Glucides/Lég.
                </span>
                <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded bg-[#E9F2E8] text-[#2D5A27]">
                  B1 • B2
                </span>
              </div>
              <ul className="space-y-2.5 text-xs">
                {data.bricks.bases.map((b) => (
                  <li
                    key={b.id}
                    className="p-2.5 rounded-lg bg-white border border-[#E6E0D4]/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular font-bold text-[#2D5A27]">{b.code}</span>
                      <span className="font-mono-tabular text-[11px] font-semibold text-[#57534E]">
                        {Math.round(b.totalPortionsForTwo * scaleFactor)} portions
                      </span>
                    </div>
                    <span className="font-semibold text-[#1C1917] leading-snug">{b.name}</span>
                    <span className="font-mono-tabular text-[11px] text-[#57534E]">
                      +{b.macrosPerPortion.protein}g prot •{" "}
                      {b.costPerPortion.toFixed(2).replace(".", ",")}€/p
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: 3 Homemade Sauces */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E6E0D4]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                  3 Sauces Signature
                </span>
                <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded bg-[#F3EFE6] text-[#1C1917]">
                  S1 • S2 • S3
                </span>
              </div>
              <ul className="space-y-2.5 text-xs">
                {data.bricks.sauces.map((s) => (
                  <li
                    key={s.id}
                    className="p-2.5 rounded-lg bg-white border border-[#E6E0D4]/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular font-bold text-[#0F766E]">{s.code}</span>
                      <span className="font-mono-tabular text-[11px] font-semibold text-[#57534E]">
                        {Math.round(s.totalPortionsForTwo * scaleFactor)} doses
                      </span>
                    </div>
                    <span className="font-semibold text-[#1C1917] leading-snug">{s.name}</span>
                    <span className="font-mono-tabular text-[11px] text-[#D97706]">
                      +{s.macrosPerPortion.protein}g prot •{" "}
                      {s.costPerPortion.toFixed(2).replace(".", ",")}€/p
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Quick Status & Ingénierie Protéique */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-2">
              <ShieldCheck className="w-4 h-4" />
              Pourquoi cette matrice bat les plats préparés
            </div>
            <h2 className="font-editorial text-xl font-semibold text-[#1C1917] mb-4">
              L&apos;Arbitrage Protéines / Euro
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-[#57534E]">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E0D4]">
                <div className="flex items-center justify-between font-semibold text-[#1C1917] mb-1">
                  <span>1. Hybridation Animale & Végétale</span>
                  <span className="font-mono-tabular text-[#2D5A27]">71,4 g prot/€</span>
                </div>
                <p className="text-xs text-[#57534E]">
                  Associer les hauts de cuisse de poulet (26,7g prot/€) avec un Dal enrichi aux
                  protéines de soja texturées (57,1g prot/€) fait chuter le coût moyen sous 2,85 €
                  tout en dépassant 65g de protéines par repas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E0D4]">
                <div className="flex items-center justify-between font-semibold text-[#1C1917] mb-1">
                  <span>2. Sauces Fonctionnelles (Skyr & Arachide)</span>
                  <span className="font-mono-tabular text-[#D97706]">+9g prot / dose</span>
                </div>
                <p className="text-xs text-[#57534E]">
                  Au lieu de sauces industrielles riches en huiles raffinées, le Tzatziki au Skyr 0%
                  et la sauce Satay 100% cacahuète ajoutent 7 à 9g de protéines propres à chaque
                  assiette.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Progress Summary */}
          <div className="mt-6 pt-4 border-t border-[#F3EFE6] grid grid-cols-2 gap-3">
            <button
              id="status-card-grocery"
              type="button"
              onClick={() => onNavigateTab("grocery")}
              className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#E9F2E8]/50 border border-[#E6E0D4] text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] text-[#78716C] block">Liste de courses</span>
              <span className="font-mono-tabular font-bold text-sm text-[#1C1917]">
                {checkedGroceryCount} / {data.groceryList.length} cochés
              </span>
            </button>
            <button
              id="status-card-session"
              type="button"
              onClick={() => onNavigateTab("session")}
              className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FEF3C7]/50 border border-[#E6E0D4] text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] text-[#78716C] block">Session Dimanche</span>
              <span className="font-mono-tabular font-bold text-sm text-[#1C1917]">
                {completedStepsCount} / {data.timeline.length} étapes
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
