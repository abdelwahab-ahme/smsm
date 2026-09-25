import React, { useState } from 'react';
import { DISCOVERY_CARDS } from '../utils/storage';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import { Sparkles, FlaskConical, Beaker, Check, ChevronDown, ChevronUp } from 'lucide-react';

export const DiscoveryLab: React.FC = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(DISCOVERY_CARDS[0]?.id || null);
  const [completedExperiments, setCompletedExperiments] = useState<string[]>([]);
  const { playClick, playSparkle } = useSound();

  const handleToggleCard = (id: string) => {
    playClick();
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleCompleteExperiment = (id: string) => {
    if (!completedExperiments.includes(id)) {
      playSparkle();
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
      });
      setCompletedExperiments([...completedExperiments, id]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner - Bright, Cheerful Mint & Teal */}
      <div className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg relative overflow-hidden border-2 border-teal-300">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/90 px-4 py-1 rounded-full text-xs font-black text-teal-950 shadow-2xs">
              <FlaskConical className="w-4 h-4 text-teal-700" />
              <span>معمل سماسم التفاعلي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
              اكتشافات وتجارب العلوم الممتعة 🔬
            </h1>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 max-w-xl leading-relaxed">
              هنا نجيب على الأسئلة العجيبة التي تخطر ببالك: كيف يطير غزل البنات؟ وكيف تظهر ألوان الطبيعة؟ لأن <span className="font-black text-teal-950 underline decoration-teal-600">"كل سؤال… بداية اكتشاف"</span>!
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-teal-200 text-center shrink-0 shadow-md">
            <p className="text-xs text-slate-800 font-black">التجارب المجربة</p>
            <p className="text-3xl font-black text-teal-700 flex items-center justify-center gap-1">
              <Beaker className="w-6 h-6 text-teal-600" />
              <span>{completedExperiments.length} / {DISCOVERY_CARDS.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Cards List - Bright white cards, high contrast fonts */}
      <div className="grid grid-cols-1 gap-4">
        {DISCOVERY_CARDS.map((card) => {
          const isExpanded = expandedCardId === card.id;
          const isDone = completedExperiments.includes(card.id);

          return (
            <div
              key={card.id}
              className={`rounded-3xl border-2 transition-all duration-300 bg-white overflow-hidden shadow-md ${
                isExpanded
                  ? 'border-teal-500 ring-2 ring-teal-400/30'
                  : 'border-teal-200 hover:border-teal-400'
              }`}
            >
              {/* Card Header clickable */}
              <div
                onClick={() => handleToggleCard(card.id)}
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer gap-4 hover:bg-teal-50/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 border-2 border-teal-300 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {card.icon}
                  </div>
                  <div>
                    <span className="text-xs font-black px-3 py-0.5 rounded-full bg-teal-100 text-teal-950 border border-teal-300">
                      {card.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-950 mt-1">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 font-bold mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {card.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDone && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full">
                      <Check className="w-4 h-4 stroke-[3] text-emerald-700" />
                      <span>جرّبت التجربة</span>
                    </span>
                  )}
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                    {isExpanded ? <ChevronUp className="w-5 h-5 stroke-[2.5]" /> : <ChevronDown className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                </div>
              </div>

              {/* Card Expanded Content - Crystal-clear, large, bold typography */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-3 border-t-2 border-teal-100 space-y-4 animate-in fade-in duration-200">
                  <div className="bg-teal-50/80 p-4 rounded-2xl border-2 border-teal-200">
                    <h4 className="text-sm font-black text-teal-950 flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>الشرح العلمي المبسط:</span>
                    </h4>
                    <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-bold">
                      {card.content}
                    </p>
                  </div>

                  {/* Fun Hands-on Experiment */}
                  <div className="bg-amber-50/90 p-4 rounded-2xl border-2 border-amber-300 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                        <FlaskConical className="w-5 h-5 text-amber-600" />
                        <span>تجربة عملية يمكنك تجربتها بنفسك:</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCompleteExperiment(card.id)}
                        className={`text-xs sm:text-sm font-black px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md active:scale-95'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>تمت التجربة! 🎉</span>
                          </>
                        ) : (
                          <>
                            <span>جرّبت هذه التجربة! 👍</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-bold">
                      {card.funExperiment}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
