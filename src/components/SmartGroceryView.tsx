"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Check,
  Sparkles,
  Scale,
  ArrowUpDown,
  RotateCcw,
  CheckCheck,
  Flame,
  Wallet,
  Store,
} from "lucide-react";
import { BatchMatrixData, GroceryItem, SupermarketAisle } from "@/data/mockMatrix";

interface SmartGroceryViewProps {
  data: BatchMatrixData;
  peopleCount: number;
  checkedIds: Record<string, boolean>;
  onToggleItem: (id: string) => void;
  onCheckAll: () => void;
  onResetChecked: () => void;
}

const AISLE_ORDER: SupermarketAisle[] = [
  "Boucherie & Volaille",
  "Crèmerie & Frais Végétal",
  "Fruits & Légumes",
  "Épicerie Sèche & Monde",
  "Condiments & Herbes",
];

export default function SmartGroceryView({
  data,
  peopleCount,
  checkedIds,
  onToggleItem,
  onCheckAll,
  onResetChecked,
}: SmartGroceryViewProps) {
  const [selectedAisle, setSelectedAisle] = useState<string>("all");
  const [sortByEfficiency, setSortByEfficiency] = useState<boolean>(false);
  const [hideChecked, setHideChecked] = useState<boolean>(false);

  const scaleFactor = peopleCount / data.planMeta.defaultPeople;

  const totalItems = data.groceryList.length;
  const checkedCount = data.groceryList.filter((item) => checkedIds[item.id]).length;
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const totalBasketPrice = data.groceryList.reduce(
    (acc, item) => acc + item.priceForTwo * scaleFactor,
    0
  );
  const checkedPrice = data.groceryList.reduce(
    (acc, item) => (checkedIds[item.id] ? acc + item.priceForTwo * scaleFactor : acc),
    0
  );
  const remainingPrice = Math.max(0, totalBasketPrice - checkedPrice);

  const totalBasketProtein = data.groceryList.reduce(
    (acc, item) => acc + item.totalProteinG * scaleFactor,
    0
  );

  const formatQuantity = (qty: number, unit: string) => {
    const scaled = qty * scaleFactor;
    if (scaled >= 1000 && unit === "g") {
      return `${(scaled / 1000).toFixed(2).replace(".00", "").replace(".", ",")} kg`;
    }
    if (Number.isInteger(scaled)) {
      return `${scaled} ${unit}`;
    }
    return `${scaled.toFixed(2).replace(/\.?0+$/, "").replace(".", ",")} ${unit}`;
  };

  const getEfficiencyBadge = (item: GroceryItem) => {
    const ratioStr = item.proteinPerEuro.toFixed(1).replace(".", ",");
    switch (item.efficiencyTier) {
      case "elite":
        return {
          label: `Élite • ${ratioStr} g prot / €`,
          className: "bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40",
        };
      case "high":
        return {
          label: `Haute • ${ratioStr} g prot / €`,
          className: "bg-[#E9F2E8] text-[#2D5A27] border-[#2D5A27]/30",
        };
      case "moderate":
        return {
          label: `Source • ${ratioStr} g prot / €`,
          className: "bg-[#F3EFE6] text-[#1C1917] border-[#E6E0D4]",
        };
      case "micronutrient":
        return {
          label: `Micronutriments • ${ratioStr} g / €`,
          className: "bg-[#FAF8F5] text-[#78716C] border-[#E6E0D4]",
        };
    }
  };

  const filteredItems = data.groceryList.filter((item) => {
    if (selectedAisle !== "all" && item.aisle !== selectedAisle) return false;
    if (hideChecked && checkedIds[item.id]) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Interactive Basket Header */}
      <section className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
              <Store className="w-3.5 h-3.5" />
              Rayons Supermarché Français • Calibré pour {peopleCount}{" "}
              {peopleCount > 1 ? "personnes" : "personne"}
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              Liste de Courses Intelligente & Ratio Protéines/€
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              Chaque ingrédient affiche son rendement réel en{" "}
              <span className="font-mono-tabular font-semibold text-[#D97706]">
                grammes de protéines par euro dépensé
              </span>{" "}
              pour optimiser votre ticket de caisse.
            </p>
          </div>

          {/* Quick Basket KPI Pills */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-[#FAF8F5] px-4 py-3 rounded-xl border border-[#E6E0D4]">
              <span className="text-[11px] text-[#78716C] block">Total Panier</span>
              <span className="font-mono-tabular text-lg font-bold text-[#2D5A27]">
                {totalBasketPrice.toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div className="bg-[#FAF8F5] px-4 py-3 rounded-xl border border-[#E6E0D4]">
              <span className="text-[11px] text-[#78716C] block">Reste à payer</span>
              <span className="font-mono-tabular text-lg font-bold text-[#1C1917]">
                {remainingPrice.toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div className="bg-[#FEF3C7]/50 px-4 py-3 rounded-xl border border-[#D97706]/25">
              <span className="text-[11px] text-[#92400E] block">Protéines brutes</span>
              <span className="font-mono-tabular text-lg font-bold text-[#D97706]">
                {Math.round(totalBasketProtein)} g
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E6E0D4]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
            <span className="font-semibold text-[#1C1917] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#2D5A27]" />
              Progression du chariot :{" "}
              <span className="font-mono-tabular text-[#2D5A27]">
                {checkedCount} / {totalItems} articles ({progressPct}%)
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                id="btn-toggle-hide-checked"
                type="button"
                onClick={() => setHideChecked(!hideChecked)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E6E0D4] text-xs font-medium text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              >
                {hideChecked ? "Afficher les cochés" : "Masquer les cochés"}
              </button>
              <button
                id="btn-check-all-grocery"
                type="button"
                onClick={onCheckAll}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E6E0D4] text-xs font-medium text-[#2D5A27] hover:bg-[#E9F2E8]/50 inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout cocher
              </button>
              {checkedCount > 0 && (
                <button
                  id="btn-reset-grocery"
                  type="button"
                  onClick={onResetChecked}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E6E0D4] text-xs font-medium text-[#78716C] hover:text-[#1C1917] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          <div className="w-full h-2.5 bg-[#E6E0D4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D5A27] transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="aisle-filter-all"
              type="button"
              onClick={() => setSelectedAisle("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedAisle === "all"
                  ? "bg-[#1C1917] text-white border-[#1C1917]"
                  : "bg-[#FAF8F5] text-[#57534E] border-[#E6E0D4] hover:border-[#1C1917]/40"
              }`}
            >
              Tous les rayons ({data.groceryList.length})
            </button>
            {AISLE_ORDER.map((aisle) => {
              const count = data.groceryList.filter((i) => i.aisle === aisle).length;
              return (
                <button
                  key={aisle}
                  type="button"
                  onClick={() => setSelectedAisle(aisle)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    selectedAisle === aisle
                      ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                      : "bg-[#FAF8F5] text-[#57534E] border-[#E6E0D4] hover:border-[#2D5A27]/40"
                  }`}
                >
                  {aisle} ({count})
                </button>
              );
            })}
          </div>

          <button
            id="btn-sort-efficiency"
            type="button"
            onClick={() => setSortByEfficiency(!sortByEfficiency)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
              sortByEfficiency
                ? "bg-[#D97706] text-white border-[#D97706]"
                : "bg-white text-[#1C1917] border-[#E6E0D4] hover:border-[#D97706]"
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortByEfficiency ? "Trié par Ratio g prot / €" : "Trier par efficacité protéique"}
          </button>
        </div>
      </section>

      {/* Grocery Items List (Either Ranked by Efficiency OR Grouped by Supermarket Aisle) */}
      {sortByEfficiency ? (
        <section className="bg-white rounded-2xl border border-[#E6E0D4] shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-[#FEF3C7]/60 border-b border-[#E6E0D4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D97706]" />
              <h3 className="font-editorial text-lg font-semibold text-[#1C1917]">
                Classement par Rendement Protéique (g de protéines / €)
              </h3>
            </div>
            <span className="text-xs font-mono-tabular font-semibold text-[#92400E]">
              Du plus rentable au plus aromatique
            </span>
          </div>

          <div className="divide-y divide-[#F3EFE6]">
            {[...filteredItems]
              .sort((a, b) => b.proteinPerEuro - a.proteinPerEuro)
              .map((item, idx) => {
                const isChecked = !!checkedIds[item.id];
                const badge = getEfficiencyBadge(item);
                const scaledPrice = item.priceForTwo * scaleFactor;
                const scaledProt = Math.round(item.totalProteinG * scaleFactor);

                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isChecked ? "bg-[#FAF8F5]/80 opacity-60" : "hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <button
                        type="button"
                        aria-label={`Cocher ${item.name}`}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 mt-0.5 sm:mt-0 ${
                          isChecked
                            ? "bg-[#2D5A27] border-[#2D5A27] text-white"
                            : "bg-white border-[#D6CFC2] hover:border-[#2D5A27]"
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[2.5]" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-tabular text-xs font-bold text-[#78716C]">
                            #{idx + 1}
                          </span>
                          <span
                            className={`font-semibold text-sm sm:text-base ${
                              isChecked ? "line-through text-[#78716C]" : "text-[#1C1917]"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[#F3EFE6] text-[#57534E] font-medium">
                            {item.aisle}
                          </span>
                        </div>
                        <p className="text-xs text-[#78716C] mt-0.5">{item.brandNote}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono-tabular font-bold border ${badge.className}`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>

                      <div className="text-right min-w-[110px]">
                        <span className="font-mono-tabular text-sm font-bold text-[#1C1917] block">
                          {formatQuantity(item.baseQuantityForTwo, item.unit)} •{" "}
                          {scaledPrice.toFixed(2).replace(".", ",")} €
                        </span>
                        <span className="font-mono-tabular text-[11px] text-[#D97706] font-semibold">
                          Total : {scaledProt}g prot
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ) : (
        <div className="space-y-5">
          {AISLE_ORDER.map((aisle) => {
            const aisleItems = filteredItems.filter((item) => item.aisle === aisle);
            if (aisleItems.length === 0) return null;

            const aisleSubtotal = aisleItems.reduce(
              (acc, item) => acc + item.priceForTwo * scaleFactor,
              0
            );
            const aisleProtein = aisleItems.reduce(
              (acc, item) => acc + item.totalProteinG * scaleFactor,
              0
            );

            return (
              <section
                key={aisle}
                className="bg-white rounded-2xl border border-[#E6E0D4] shadow-xs overflow-hidden"
              >
                {/* Aisle Header */}
                <div className="px-6 py-4 bg-[#F3EFE6]/70 border-b border-[#E6E0D4] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-editorial text-lg font-semibold text-[#1C1917]">
                      {aisle}
                    </h3>
                    <span className="font-mono-tabular text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#E6E0D4] text-[#57534E]">
                      {aisleItems.length} {aisleItems.length > 1 ? "articles" : "article"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono-tabular">
                    <span className="text-[#D97706] font-bold">
                      +{Math.round(aisleProtein)}g protéines
                    </span>
                    <span className="text-[#2D5A27] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#E6E0D4]">
                      Sous-total : {aisleSubtotal.toFixed(2).replace(".", ",")} €
                    </span>
                  </div>
                </div>

                {/* Items in Aisle */}
                <div className="divide-y divide-[#F3EFE6]">
                  {aisleItems.map((item) => {
                    const isChecked = !!checkedIds[item.id];
                    const badge = getEfficiencyBadge(item);
                    const scaledPrice = item.priceForTwo * scaleFactor;
                    const scaledProt = Math.round(item.totalProteinG * scaleFactor);

                    return (
                      <div
                        key={item.id}
                        onClick={() => onToggleItem(item.id)}
                        className={`p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isChecked ? "bg-[#FAF8F5]/80 opacity-60" : "hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {/* Left: Checkbox + Name + Used in bricks */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <button
                            type="button"
                            aria-label={`Cocher ${item.name}`}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 mt-0.5 sm:mt-0 ${
                              isChecked
                                ? "bg-[#2D5A27] border-[#2D5A27] text-white"
                                : "bg-white border-[#D6CFC2] hover:border-[#2D5A27]"
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[2.5]" />}
                          </button>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-semibold text-sm sm:text-base ${
                                  isChecked ? "line-through text-[#78716C]" : "text-[#1C1917]"
                                }`}
                              >
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {item.usedInBricks.map((code) => (
                                  <span
                                    key={code}
                                    className="font-mono-tabular text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F3EFE6] text-[#57534E]"
                                  >
                                    {code}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-[#78716C] mt-0.5">{item.brandNote}</p>
                          </div>
                        </div>

                        {/* Right: Efficiency Badge + Scaled Quantity + Price */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pl-9 md:pl-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono-tabular font-bold border ${badge.className}`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-mono-tabular text-xs font-semibold text-[#57534E] block">
                                Qté :{" "}
                                <strong className="text-[#1C1917]">
                                  {formatQuantity(item.baseQuantityForTwo, item.unit)}
                                </strong>
                              </span>
                              <span className="font-mono-tabular text-[11px] text-[#D97706] font-semibold">
                                {scaledProt}g prot
                              </span>
                            </div>

                            <span className="font-mono-tabular text-base font-bold text-[#2D5A27] bg-[#E9F2E8]/70 px-3 py-1.5 rounded-xl border border-[#2D5A27]/20 min-w-[78px] text-right">
                              {scaledPrice.toFixed(2).replace(".", ",")} €
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
