"use client";

import React, { useState } from "react";
import {
  Flame,
  Clock,
  Box,
  Sparkles,
  Utensils,
  Plus,
  Equal,
  Filter,
  RotateCcw,
  ThermometerSun,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { BatchMatrixData, CulinaryBrick } from "@/data/mockMatrix";

interface MatrixAssembliesViewProps {
  data: BatchMatrixData;
  peopleCount: number;
}

export default function MatrixAssembliesView({
  data,
  peopleCount,
}: MatrixAssembliesViewProps) {
  const [selectedBrickId, setSelectedBrickId] = useState<string | null>(null);
  const [activeBrickFilter, setActiveBrickFilter] = useState<
    "all" | "proteine" | "base" | "sauce"
  >("all");

  const scaleFactor = peopleCount / data.planMeta.defaultPeople;

  const allBricks: CulinaryBrick[] = [
    ...data.bricks.proteins,
    ...data.bricks.bases,
    ...data.bricks.sauces,
  ];

  const getBrickById = (id: string) => allBricks.find((b) => b.id === id);

  const visibleBricks =
    activeBrickFilter === "all"
      ? allBricks
      : allBricks.filter((b) => b.category === activeBrickFilter);

  const filteredAssemblies = selectedBrickId
    ? data.assemblies.filter(
        (m) =>
          m.proteinBrickId === selectedBrickId ||
          m.baseBrickId === selectedBrickId ||
          m.sauceBrickId === selectedBrickId
      )
    : data.assemblies;

  const formatScaledQty = (qty: number, unit: string) => {
    const val = qty * scaleFactor;
    if (val >= 1000 && unit === "g") {
      return `${(val / 1000).toFixed(2).replace(".00", "").replace(".", ",")} kg`;
    }
    if (Number.isInteger(val)) {
      return `${val} ${unit}`;
    }
    return `${val.toFixed(1).replace(".0", "").replace(".", ",")} ${unit}`;
  };

  const getCategoryBadgeStyle = (category: CulinaryBrick["category"]) => {
    switch (category) {
      case "proteine":
        return "bg-[#FEF3C7] text-[#B45309] border-[#D97706]/30";
      case "base":
        return "bg-[#E9F2E8] text-[#2D5A27] border-[#2D5A27]/30";
      case "sauce":
        return "bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]/25";
    }
  };

  const getCategoryLabel = (category: CulinaryBrick["category"]) => {
    switch (category) {
      case "proteine":
        return "Base Protéinée";
      case "base":
        return "Socle Glucides / Légumes";
      case "sauce":
        return "Sauce Maison";
    }
  };

  return (
    <div className="space-y-10">
      {/* PART 1: THE 8 SUNDAY BRICKS */}
      <section aria-labelledby="heading-bricks" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Étape 1 • Préparation Modulaire du Dimanche
            </div>
            <h2
              id="heading-bricks"
              className="font-editorial text-2xl sm:text-3xl font-semibold text-[#1C1917]"
            >
              Les 8 Briques Culinaires ({peopleCount} {peopleCount > 1 ? "personnes" : "personne"})
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              Cliquez sur une brique pour filtrer les repas de la semaine qui l&apos;utilisent.
              Toutes les quantités d&apos;ingrédients sont calibrées pour{" "}
              <span className="font-mono-tabular font-semibold text-[#1C1917]">
                {peopleCount * 10} portions
              </span>
              .
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "Toutes (8)" },
              { id: "proteine", label: "3 Protéines" },
              { id: "base", label: "2 Socles" },
              { id: "sauce", label: "3 Sauces" },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`filter-brick-${tab.id}`}
                type="button"
                onClick={() =>
                  setActiveBrickFilter(tab.id as "all" | "proteine" | "base" | "sauce")
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  activeBrickFilter === tab.id
                    ? "bg-[#1C1917] text-white border-[#1C1917]"
                    : "bg-[#FAF8F5] text-[#57534E] border-[#E6E0D4] hover:border-[#1C1917]/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Bricks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleBricks.map((brick) => {
            const isSelected = selectedBrickId === brick.id;
            const scaledPortions = Math.round(brick.totalPortionsForTwo * scaleFactor);

            return (
              <article
                key={brick.id}
                onClick={() => setSelectedBrickId(isSelected ? null : brick.id)}
                className={`rounded-2xl p-5 transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-2 border-[#2D5A27] shadow-md ring-4 ring-[#2D5A27]/10"
                    : "bg-white border-[#E6E0D4] hover:border-[#2D5A27]/60 shadow-xs"
                }`}
              >
                <div>
                  {/* Header with Code & Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryBadgeStyle(
                        brick.category
                      )}`}
                    >
                      <span className="font-mono-tabular">{brick.code}</span>•{" "}
                      {getCategoryLabel(brick.category)}
                    </span>
                    <span className="font-mono-tabular text-xs font-semibold text-[#57534E] bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#E6E0D4]">
                      {scaledPortions} doses
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-editorial text-lg font-semibold text-[#1C1917] leading-snug">
                    {brick.name}
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1 leading-relaxed">{brick.subtitle}</p>

                  {/* Macros & Cost Strip */}
                  <div className="mt-4 grid grid-cols-3 gap-1.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E6E0D4]/80 text-center">
                    <div>
                      <span className="block text-[10px] uppercase text-[#78716C] font-semibold">
                        Protéines
                      </span>
                      <span className="font-mono-tabular text-xs font-bold text-[#D97706]">
                        {brick.macrosPerPortion.protein}g
                      </span>
                    </div>
                    <div className="border-x border-[#E6E0D4]">
                      <span className="block text-[10px] uppercase text-[#78716C] font-semibold">
                        Énergie
                      </span>
                      <span className="font-mono-tabular text-xs font-bold text-[#1C1917]">
                        {brick.macrosPerPortion.calories} kcal
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#78716C] font-semibold">
                        Coût/dose
                      </span>
                      <span className="font-mono-tabular text-xs font-bold text-[#2D5A27]">
                        {brick.costPerPortion.toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                  </div>

                  {/* Scaled Key Ingredients */}
                  <div className="mt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] block mb-1.5">
                      Ingrédients ({peopleCount}p) :
                    </span>
                    <ul className="space-y-1 text-xs">
                      {brick.keyIngredients.map((ing, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-[#57534E] py-0.5 border-b border-dashed border-[#F3EFE6] last:border-none"
                        >
                          <span className="truncate pr-2">{ing.name}</span>
                          <span className="font-mono-tabular font-semibold text-[#1C1917] shrink-0">
                            {formatScaledQty(ing.baseQtyForTwo, ing.unit)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Info: Prep time + Storage */}
                <div className="mt-4 pt-3 border-t border-[#F3EFE6] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A27]" />
                      Prép {brick.prepTimeMin}&apos;{" "}
                      {brick.cookTimeMin > 0 ? `+ Cuisson ${brick.cookTimeMin}'` : "(Cru)"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono-tabular font-medium text-[#1C1917]">
                      <Box className="w-3.5 h-3.5 text-[#D97706]" />J+{brick.storageDays} frigo
                    </span>
                  </div>
                  <p className="text-[11px] text-[#57534E] bg-[#F3EFE6]/70 rounded-lg p-2 leading-snug">
                    <strong className="text-[#1C1917]">Astuce Chef :</strong> {brick.chefTip}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* PART 2: THE 5 WEEKLY MEAL ASSEMBLIES */}
      <section aria-labelledby="heading-assemblies" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D97706] mb-1">
              <Utensils className="w-3.5 h-3.5" />
              Étape 2 • Croisement Base + Protéine + Sauce
            </div>
            <h2
              id="heading-assemblies"
              className="font-editorial text-2xl sm:text-3xl font-semibold text-[#1C1917]"
            >
              Les 5 Assemblages de la Semaine ({peopleCount * 10} portions au total)
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              Chaque assemblage fournit{" "}
              <span className="font-mono-tabular font-semibold text-[#1C1917]">
                {Math.round(4 * scaleFactor)} portions
              </span>{" "}
              (soit 2 repas pour {peopleCount} {peopleCount > 1 ? "personnes" : "personne"}) avec un
              temps de dressage de 2 minutes.
            </p>
          </div>

          {selectedBrickId && (
            <button
              id="reset-brick-filter"
              type="button"
              onClick={() => setSelectedBrickId(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEF3C7] text-[#B45309] text-xs font-bold border border-[#D97706]/30 cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              Filtre actif : {getBrickById(selectedBrickId)?.code} — Réinitialiser
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Assemblies List */}
        <div className="space-y-5">
          {filteredAssemblies.map((meal, index) => {
            const proteinBrick = getBrickById(meal.proteinBrickId);
            const baseBrick = getBrickById(meal.baseBrickId);
            const sauceBrick = getBrickById(meal.sauceBrickId);
            const scaledPortions = Math.round(meal.portionsForTwo * scaleFactor);
            const totalAssemblyCost = meal.costPerPortion * scaledPortions;

            return (
              <article
                key={meal.id}
                className="bg-white rounded-2xl border border-[#E6E0D4] shadow-xs overflow-hidden hover:border-[#2D5A27]/50 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left & Center: Meal Identity + Visual Formula */}
                  <div className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E6E0D4]">
                    <div>
                      {/* Top Meta Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#1C1917] text-white font-mono-tabular text-xs font-bold">
                            {meal.mealSlot}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#F3EFE6] text-[#57534E] text-xs font-semibold">
                            {meal.dayLabel}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-xs font-bold text-[#2D5A27] bg-[#E9F2E8] px-3 py-1 rounded-full">
                          {scaledPortions} portions ({peopleCount}p × 2 repas)
                        </span>
                      </div>

                      {/* Meal Title & Tagline */}
                      <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#1C1917]">
                        {meal.name}
                      </h3>
                      <p className="text-sm text-[#57534E] mt-1">{meal.tagline}</p>

                      {/* Interactive Matrix Formula: [Protéine] + [Base] + [Sauce] */}
                      <div className="mt-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E0D4]">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-3 flex items-center justify-between">
                          <span>Formule d&apos;assemblage par assiette (1 portion)</span>
                          <span className="font-mono-tabular text-[#1C1917]">
                            Poids total :{" "}
                            {meal.assemblyWeightsG.proteinG +
                              meal.assemblyWeightsG.baseG +
                              meal.assemblyWeightsG.sauceG}
                            g
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
                          {/* Protein Block */}
                          <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-[#D97706]/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">
                                {proteinBrick?.code} • Protéine
                              </span>
                              <span className="font-mono-tabular text-xs font-bold text-[#1C1917]">
                                {meal.assemblyWeightsG.proteinG}g
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#1C1917] line-clamp-2">
                              {proteinBrick?.name}
                            </p>
                          </div>

                          <div className="hidden sm:flex sm:col-span-1 justify-center text-[#78716C]">
                            <Plus className="w-4 h-4" />
                          </div>

                          {/* Base Block */}
                          <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-[#2D5A27]/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 rounded bg-[#E9F2E8] text-[#2D5A27]">
                                {baseBrick?.code} • Socle
                              </span>
                              <span className="font-mono-tabular text-xs font-bold text-[#1C1917]">
                                {meal.assemblyWeightsG.baseG}g
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#1C1917] line-clamp-2">
                              {baseBrick?.name}
                            </p>
                          </div>

                          <div className="hidden sm:flex sm:col-span-1 justify-center text-[#78716C]">
                            <Plus className="w-4 h-4" />
                          </div>

                          {/* Sauce Block */}
                          <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-[#0369A1]/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1]">
                                {sauceBrick?.code} • Sauce
                              </span>
                              <span className="font-mono-tabular text-xs font-bold text-[#1C1917]">
                                {meal.assemblyWeightsG.sauceG}g
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#1C1917] line-clamp-2">
                              {sauceBrick?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions & Reheating */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E0D4]">
                        <span className="font-bold text-[#1C1917] block mb-1">
                          Dressage minute :
                        </span>
                        <p className="text-[#57534E] leading-relaxed">
                          {meal.assemblyInstructions}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E0D4]">
                        <span className="font-bold text-[#1C1917] flex items-center gap-1.5 mb-1">
                          <ThermometerSun className="w-3.5 h-3.5 text-[#D97706]" />
                          Protocole de réchauffage :
                        </span>
                        <p className="text-[#57534E] leading-relaxed">{meal.reheatAdvice}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Macros & Cost Breakdown Card */}
                  <div className="lg:col-span-4 bg-[#F3EFE6]/50 p-6 sm:p-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-[#E6E0D4]">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] block">
                            Coût exact / portion
                          </span>
                          <span className="font-mono-tabular text-3xl font-bold text-[#2D5A27]">
                            {meal.costPerPortion.toFixed(2).replace(".", ",")} €
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] block">
                            Protéines / portion
                          </span>
                          <span className="font-mono-tabular text-3xl font-bold text-[#D97706]">
                            {meal.macrosPerPortion.protein} g
                          </span>
                        </div>
                      </div>

                      {/* Detailed Macros Table */}
                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#57534E]">Valeur énergétique</span>
                          <span className="font-mono-tabular font-bold text-[#1C1917]">
                            {meal.macrosPerPortion.calories} kcal
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#57534E]">Glucides complexes</span>
                          <span className="font-mono-tabular font-semibold text-[#1C1917]">
                            {meal.macrosPerPortion.carbs} g
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#57534E]">Lipides (dont insaturés)</span>
                          <span className="font-mono-tabular font-semibold text-[#1C1917]">
                            {meal.macrosPerPortion.fat} g
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#57534E]">Fibres alimentaires</span>
                          <span className="font-mono-tabular font-semibold text-[#2D5A27]">
                            {meal.macrosPerPortion.fiber} g
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E6E0D4]">
                          <span className="text-[#57534E] flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-[#D97706]" />
                            Ratio efficacité repas
                          </span>
                          <span className="font-mono-tabular font-bold text-[#D97706]">
                            {(meal.macrosPerPortion.protein / meal.costPerPortion)
                              .toFixed(1)
                              .replace(".", ",")}{" "}
                            g prot / €
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badges & Total Lot Cost */}
                    <div className="mt-6 pt-4 border-t border-[#E6E0D4] space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {meal.badges.map((badge, bIdx) => (
                          <span
                            key={bIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E6E0D4] text-[11px] font-semibold text-[#1C1917]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" />
                            {badge}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-[#E6E0D4]">
                        <span className="text-[#57534E]">
                          Coût total des {scaledPortions} portions :
                        </span>
                        <span className="font-mono-tabular font-bold text-[#1C1917]">
                          {totalAssemblyCost.toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
