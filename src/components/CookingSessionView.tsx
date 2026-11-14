"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Flame,
  Clock,
  Sparkles,
  ChefHat,
  CheckCircle2,
  FastForward,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import { BatchMatrixData, TimelineStep } from "@/data/mockMatrix";

interface CookingSessionViewProps {
  data: BatchMatrixData;
  peopleCount: number;
  completedStepIds: Record<string, boolean>;
  onToggleStep: (stepId: string) => void;
  onResetSteps: () => void;
}

export default function CookingSessionView({
  data,
  peopleCount,
  completedStepIds,
  onToggleStep,
  onResetSteps,
}: CookingSessionViewProps) {
  const totalSessionSeconds = data.planMeta.sessionTotalDurationMin * 60; // 4800 sec (80 min)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [countertopMode, setCountertopMode] = useState<boolean>(false);
  const [checkedSubActions, setCheckedSubActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= totalSessionSeconds) {
          setIsRunning(false);
          return totalSessionSeconds;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, totalSessionSeconds]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    const totalMins = Math.floor(sec / 60);
    return {
      hms: `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      mmss: `${totalMins.toString().padStart(2, "0")}m ${secs
        .toString()
        .padStart(2, "0")}s`,
    };
  };

  const elapsedMinutes = elapsedSeconds / 60;

  // Determine the currently active step based on timer or first uncompleted step
  const activeStepFromTimer =
    data.timeline.find(
      (s) => elapsedMinutes >= s.startMin && elapsedMinutes < s.endMin
    ) || data.timeline[data.timeline.length - 1];

  const firstUncompletedStep =
    data.timeline.find((s) => !completedStepIds[s.id]) ||
    data.timeline[data.timeline.length - 1];

  const currentFocusStep = isRunning ? activeStepFromTimer : firstUncompletedStep;

  const completedCount = data.timeline.filter((s) => completedStepIds[s.id]).length;
  const stepCompletionPct = Math.round((completedCount / data.timeline.length) * 100);
  const timerProgressPct = Math.min(
    100,
    Math.round((elapsedSeconds / totalSessionSeconds) * 100)
  );

  const toggleSubAction = (key: string) => {
    setCheckedSubActions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const jumpToStepTime = (step: TimelineStep) => {
    setElapsedSeconds(step.startMin * 60);
  };

  const getStationBadgeStyle = (station: TimelineStep["station"]) => {
    switch (station) {
      case "Four & Découpe":
        return "bg-[#FEF3C7] text-[#B45309] border-[#D97706]/30";
      case "Plaques & Cuisson":
        return "bg-[#FEE2E2] text-[#B91C1C] border-[#EF4444]/30";
      case "Plan de travail":
        return "bg-[#E9F2E8] text-[#2D5A27] border-[#2D5A27]/30";
      case "Dressage & Stockage":
        return "bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Sticky / Top Live Timer Console */}
      <section className="bg-[#1C1917] text-[#FAF8F5] rounded-2xl p-5 sm:p-7 shadow-md border border-[#2D5A27]/40 sticky top-3 z-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Live Clock & Current Active Phase */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="bg-[#292524] px-5 py-3.5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  isRunning ? "bg-[#D97706] animate-ping" : "bg-[#2D5A27]"
                }`}
              />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#A8A29E] block font-semibold">
                  Chrono Session (Cible 80:00)
                </span>
                <div className="font-mono-tabular text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {formatTimer(elapsedSeconds).hms}{" "}
                  <span className="text-xs font-normal text-[#A8A29E]">
                    ({formatTimer(elapsedSeconds).mmss})
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D97706] text-white font-mono-tabular text-xs font-bold">
                  Étape focus #{currentFocusStep.stepNumber}/8
                </span>
                <span className="text-xs font-mono-tabular text-[#A8A29E]">
                  {currentFocusStep.timeMarker} → T+{currentFocusStep.endMin} min
                </span>
              </div>
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-white mt-1">
                {currentFocusStep.title}
              </h2>
              <p className="text-xs text-[#D6D3D1] mt-0.5">
                Calibrage actif :{" "}
                <strong className="text-white">
                  {peopleCount} {peopleCount > 1 ? "personnes" : "personne"} ({peopleCount * 10}{" "}
                  portions)
                </strong>
              </p>
            </div>
          </div>

          {/* Right: Interactive Timer Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-timer-play-pause"
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-5 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-all cursor-pointer ${
                isRunning
                  ? "bg-[#D97706] text-white hover:bg-[#B45309]"
                  : "bg-[#2D5A27] text-white hover:bg-[#23471E]"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  {elapsedSeconds > 0 ? "Reprendre" : "Démarrer 1h20"}
                </>
              )}
            </button>

            <button
              id="btn-timer-plus-5m"
              type="button"
              onClick={() =>
                setElapsedSeconds((prev) => Math.min(totalSessionSeconds, prev + 300))
              }
              title="Avancer de 5 minutes"
              className="px-3.5 py-3 rounded-xl bg-[#292524] hover:bg-[#44403C] text-xs font-mono-tabular font-semibold text-white border border-white/10 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-[#D97706]" />
              +5m
            </button>

            <button
              id="btn-timer-reset"
              type="button"
              onClick={() => {
                setIsRunning(false);
                setElapsedSeconds(0);
              }}
              className="px-3.5 py-3 rounded-xl bg-[#292524] hover:bg-[#44403C] text-xs font-semibold text-[#D6D3D1] border border-white/10 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              00:00
            </button>

            <button
              id="btn-countertop-mode"
              type="button"
              onClick={() => setCountertopMode(!countertopMode)}
              className={`px-3.5 py-3 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                countertopMode
                  ? "bg-white text-[#1C1917] border-white"
                  : "bg-[#292524] text-[#D6D3D1] border-white/10 hover:bg-[#44403C]"
              }`}
            >
              {countertopMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  Vue Standard
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  Mode Plan de Travail
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dual Progress Bar: Steps Checked & Elapsed Time */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#A8A29E]">Étapes validées par le cuisinier</span>
              <span className="font-mono-tabular font-bold text-[#86EFAC]">
                {completedCount} / {data.timeline.length} ({stepCompletionPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#292524] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2D5A27] transition-all duration-300 rounded-full"
                style={{ width: `${stepCompletionPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#A8A29E]">Écoulement du rétroplanning (80 min)</span>
              <span className="font-mono-tabular font-bold text-[#FBBF24]">
                T+{Math.floor(elapsedMinutes)} min / 80 min ({timerProgressPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#292524] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D97706] transition-all duration-300 rounded-full"
                style={{ width: `${timerProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Header Bar for Resetting Step Checkboxes */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs sm:text-sm text-[#57534E]">
          Cochez chaque étape au fur et à mesure ou cliquez sur{" "}
          <span className="font-mono-tabular font-semibold text-[#1C1917]">Caler chrono</span>{" "}
          pour synchroniser la minuterie avec votre avancement réel.
        </p>
        {completedCount > 0 && (
          <button
            id="btn-reset-all-steps"
            type="button"
            onClick={() => {
              onResetSteps();
              setCheckedSubActions({});
            }}
            className="text-xs font-semibold text-[#78716C] hover:text-[#1C1917] inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Décocher toutes les étapes
          </button>
        )}
      </div>

      {/* 8 Chronological Timeline Steps */}
      <div className="space-y-4">
        {data.timeline.map((step) => {
          const isCompleted = !!completedStepIds[step.id];
          const isCurrentFocus = currentFocusStep.id === step.id && !isCompleted;

          return (
            <article
              key={step.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCompleted
                  ? "bg-[#FAF8F5] border-[#2D5A27]/40 opacity-75"
                  : isCurrentFocus
                  ? "bg-white border-2 border-[#D97706] shadow-md ring-4 ring-[#D97706]/10"
                  : "bg-white border-[#E6E0D4] shadow-xs"
              }`}
            >
              <div className={`p-5 sm:p-6 ${countertopMode ? "sm:p-8" : ""}`}>
                {/* Step Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F3EFE6]">
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Big Tactile Step Checkbox */}
                    <button
                      id={`toggle-step-${step.stepNumber}`}
                      type="button"
                      onClick={() => onToggleStep(step.id)}
                      aria-label={`Valider l'étape ${step.stepNumber}`}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer shrink-0 ${
                        isCompleted
                          ? "bg-[#2D5A27] border-[#2D5A27] text-white"
                          : "bg-white border-[#D6CFC2] hover:border-[#2D5A27] text-transparent"
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-tabular text-xs font-bold px-2.5 py-1 rounded-lg bg-[#1C1917] text-white">
                          {step.timeMarker}
                        </span>
                        <span className="font-mono-tabular text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F3EFE6] text-[#57534E]">
                          Durée : {step.durationMin} min
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getStationBadgeStyle(
                            step.station
                          )}`}
                        >
                          {step.station}
                        </span>
                        {step.temperatureOrFlame && (
                          <span className="inline-flex items-center gap-1 text-xs font-mono-tabular font-semibold px-2.5 py-1 rounded-lg bg-[#FEF3C7]/60 text-[#92400E]">
                            <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                            {step.temperatureOrFlame}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`font-editorial font-semibold mt-2 ${
                          countertopMode ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                        } ${isCompleted ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}
                      >
                        {step.stepNumber}. {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Brick Tags + Sync Timer Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pl-12 sm:pl-0 shrink-0">
                    <div className="flex items-center gap-1">
                      {step.relatedBrickCodes.map((code) => (
                        <span
                          key={code}
                          className="font-mono-tabular text-xs font-bold px-2 py-1 rounded-md bg-[#FAF8F5] border border-[#E6E0D4] text-[#1C1917]"
                        >
                          {code}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => jumpToStepTime(step)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#E6E0D4] text-xs font-mono-tabular font-semibold text-[#57534E] cursor-pointer"
                    >
                      Caler chrono ({step.timeMarker})
                    </button>
                  </div>
                </div>

                {/* Step Body: Description & Detailed Sub-actions Checklist */}
                <div className="mt-4 space-y-4">
                  <p
                    className={`text-[#57534E] ${
                      countertopMode ? "text-base sm:text-lg" : "text-sm sm:text-base"
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Sub-actions interactive checklist */}
                  <div className="space-y-2">
                    {step.detailedActions.map((action, actionIdx) => {
                      const subKey = `${step.id}-sub-${actionIdx}`;
                      const isSubDone = isCompleted || !!checkedSubActions[subKey];

                      return (
                        <div
                          key={subKey}
                          onClick={() => toggleSubAction(subKey)}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                            isSubDone
                              ? "bg-[#E9F2E8]/40 border-[#2D5A27]/30 text-[#57534E]"
                              : "bg-[#FAF8F5] border-[#E6E0D4] hover:border-[#2D5A27]/50 text-[#1C1917]"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 shrink-0 ${
                              isSubDone
                                ? "bg-[#2D5A27] border-[#2D5A27] text-white"
                                : "bg-white border-[#D6CFC2]"
                            }`}
                          >
                            {isSubDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </div>
                          <span
                            className={`${
                              countertopMode ? "text-base sm:text-lg" : "text-xs sm:text-sm"
                            } leading-relaxed ${isSubDone ? "line-through" : "font-medium"}`}
                          >
                            {action}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Parallel Task & Chef Pro Tip Footer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {step.parallelTask && (
                      <div className="p-3.5 rounded-xl bg-[#FEF3C7]/45 border border-[#D97706]/25 text-xs">
                        <span className="font-bold text-[#92400E] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                          Temps masqué en parallèle :
                        </span>
                        <p className="text-[#57534E] leading-relaxed">{step.parallelTask}</p>
                      </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-[#E9F2E8]/50 border border-[#2D5A27]/25 text-xs">
                      <span className="font-bold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <ChefHat className="w-3.5 h-3.5 text-[#2D5A27]" />
                        Conseil Précision :
                      </span>
                      <p className="text-[#57534E] leading-relaxed">{step.proTip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
