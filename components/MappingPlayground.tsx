import React, { useState, useEffect, useMemo } from 'react';
import { ActionType, Step, MappingResult } from '../types';
import { Gamepad } from 'lucide-react';

interface MappingPlaygroundProps {
  onStateChange: (docBefore: string, docAfter: string, step: Step, trackedPos: number, mappedPos: number) => void;
}

// Helper to calculate mapping logic (simplified ProseMirror logic)
const mapPosition = (pos: number, step: Step): MappingResult => {
  if (step.type === ActionType.INSERT) {
    const insertAt = step.from;
    const size = step.slice?.length || 0;
    if (pos < insertAt) return { oldPos: pos, newPos: pos, deleted: false };
    // In ProseMirror, "bias" determines if a cursor at the insertion point moves right or stays left.
    // We assume bias > 0 (standard typing behavior) -> moves right.
    return { oldPos: pos, newPos: pos + size, deleted: false };
  } else if (step.type === ActionType.DELETE) {
    const from = step.from;
    const to = step.to;
    if (pos < from) return { oldPos: pos, newPos: pos, deleted: false };
    if (pos >= to) return { oldPos: pos, newPos: pos - (to - from), deleted: false };
    return { oldPos: pos, newPos: from, deleted: true }; // Collapsed
  }
  return { oldPos: pos, newPos: pos, deleted: false };
};

const MappingPlayground: React.FC<MappingPlaygroundProps> = ({ onStateChange }) => {
  const [docContent, setDocContent] = useState("HELLO");
  const [trackedPos, setTrackedPos] = useState(2); // Between E and L
  const [activeStep, setActiveStep] = useState<Step>({
    type: ActionType.INSERT,
    from: 2,
    to: 2,
    slice: "XYZ",
  });

  // Derived state for visualization
  const mappingResult = useMemo(() => mapPosition(trackedPos, activeStep), [trackedPos, activeStep]);
  
  const finalDoc = useMemo(() => {
    if (activeStep.type === ActionType.INSERT) {
      return docContent.slice(0, activeStep.from) + (activeStep.slice || '') + docContent.slice(activeStep.from);
    } else {
      return docContent.slice(0, activeStep.from) + docContent.slice(activeStep.to);
    }
  }, [docContent, activeStep]);

  // Notify parent
  useEffect(() => {
    onStateChange(docContent, finalDoc, activeStep, trackedPos, mappingResult.newPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedPos, activeStep, docContent]);

  // Visual constants
  const CHAR_WIDTH = 40;
  const START_X = 60; 

  // Y Coordinates configuration (Fixed to avoid overlaps)
  const LAYOUT = {
    LABEL_BEFORE_Y: 25,
    RULER_BEFORE_Y: 65,
    POINTER_BEFORE_Y: 130, // Pointer tip points UP to index
    
    POINTER_AFTER_Y: 220, // Pointer tip points DOWN to ruler
    RULER_AFTER_Y: 265,
    LABEL_AFTER_Y: 345,
    
    SVG_HEIGHT: 380 // Slightly increased height
  };

  const renderRuler = (content: string, yOffset: number, highlightRange?: {start: number, end: number, color: string}) => {
    return (
      <g transform={`translate(0, ${yOffset})`}>
        {/* Characters */}
        {content.split('').map((char, i) => (
          <g key={i} transform={`translate(${START_X + i * CHAR_WIDTH + (CHAR_WIDTH / 2)}, 0)`}>
            <rect 
              x={-CHAR_WIDTH/2 + 2} 
              y={-20} 
              width={CHAR_WIDTH - 4} 
              height={40} 
              className="fill-white stroke-slate-300 transition-all duration-300" 
              rx={6}
            />
            <text 
              y={5} 
              textAnchor="middle" 
              className="fill-slate-700 font-mono font-bold text-lg select-none"
            >
              {char}
            </text>
          </g>
        ))}

        {/* Indices (Positions) */}
        {Array.from({ length: content.length + 1 }).map((_, i) => {
          const isHighlighted = highlightRange && i >= highlightRange.start && i <= highlightRange.end;
          return (
             <g key={`idx-${i}`} transform={`translate(${START_X + i * CHAR_WIDTH - (CHAR_WIDTH/2)}, 35)`}>
                <circle r={isHighlighted ? 4 : 3} className={isHighlighted ? "fill-indigo-500" : "fill-slate-300"} />
                <text 
                  y={18} 
                  textAnchor="middle" 
                  className={`text-[10px] font-mono select-none font-bold ${isHighlighted ? 'fill-indigo-600' : 'fill-slate-400'}`}
                >
                  {i}
                </text>
             </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
          <Gamepad size={20} className="text-purple-500" /> 
          命运操控台 (Control Panel)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">🌍 初始世界 (World Start)</label>
             <input 
               type="text" 
               value={docContent}
               onChange={(e) => setDocContent(e.target.value.toUpperCase())}
               className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg px-3 py-2 font-mono text-slate-700 focus:border-indigo-400 focus:bg-white outline-none transition-all"
               maxLength={10}
             />
          </div>

          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">📍 主角位置 (Hero Pos)</label>
             <input 
               type="range" 
               min={0}
               max={docContent.length}
               value={trackedPos}
               onChange={(e) => setTrackedPos(Number(e.target.value))}
               className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
             />
             <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Index: {trackedPos}</span>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
                   主角在这里! 🚩
                </span>
             </div>
          </div>
        </div>

        <div className="border-t-2 border-slate-50 pt-5">
          <div className="flex flex-wrap items-center gap-4 mb-4">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">⚡ 发动技能 (Skill):</span>
             <button 
                onClick={() => setActiveStep({ ...activeStep, type: ActionType.INSERT, slice: 'XYZ', to: activeStep.from })}
                className={`px-4 py-1.5 text-sm rounded-full transition-all border-2 ${activeStep.type === ActionType.INSERT ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
             >
               🪄 召唤 (Insert)
             </button>
             <button 
                onClick={() => setActiveStep({ ...activeStep, type: ActionType.DELETE, slice: undefined, to: Math.min(activeStep.from + 1, docContent.length) })}
                className={`px-4 py-1.5 text-sm rounded-full transition-all border-2 ${activeStep.type === ActionType.DELETE ? 'bg-red-50 border-red-200 text-red-600 font-bold shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
             >
               🕳️ 虚空 (Delete)
             </button>
          </div>

          <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl">
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold mb-1 block">
                {activeStep.type === ActionType.INSERT ? '📍 召唤点 (Start)' : '🔥 起始点 (Start)'}
              </label>
              <input 
                type="number"
                min={0}
                max={docContent.length}
                value={activeStep.from}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setActiveStep(prev => ({
                    ...prev, 
                    from: val,
                    to: prev.type === ActionType.DELETE ? Math.max(val, prev.to) : val
                  }));
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-indigo-400 outline-none"
              />
            </div>

            {activeStep.type === ActionType.INSERT ? (
              <div className="flex-1">
                <label className="text-xs text-slate-500 font-bold mb-1 block">📦 召唤内容 (Content)</label>
                <input 
                  type="text"
                  value={activeStep.slice || ''}
                  onChange={(e) => setActiveStep(prev => ({ ...prev, slice: e.target.value.toUpperCase() }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:border-indigo-400 outline-none"
                  maxLength={5}
                />
              </div>
            ) : (
              <div className="flex-1">
                 <label className="text-xs text-slate-500 font-bold mb-1 block">🏁 结束点 (End)</label>
                 <input 
                  type="number"
                  min={activeStep.from}
                  max={docContent.length}
                  value={activeStep.to}
                  onChange={(e) => setActiveStep(prev => ({ ...prev, to: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-indigo-400 outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="bg-[#1e293b] rounded-2xl p-6 overflow-x-auto shadow-inner min-h-[420px] flex items-center justify-center relative group border-4 border-slate-800">
        
        {/* Background Grid Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <svg width={Math.max(600, (finalDoc.length + 2) * CHAR_WIDTH + 100)} height={LAYOUT.SVG_HEIGHT} className="overflow-visible relative z-10">
          
          {/* Label Before */}
          <text x={10} y={LAYOUT.LABEL_BEFORE_Y} className="fill-slate-400 text-xs font-bold uppercase tracking-widest">
            ⏳ 变身前 (Before)
          </text>

          {/* Top Ruler (Before) */}
          {renderRuler(docContent, LAYOUT.RULER_BEFORE_Y, { start: activeStep.from, end: activeStep.type === ActionType.INSERT ? activeStep.from : activeStep.to, color: 'fill-yellow-400' })}
          
          {/* Tracked Point Before */}
          <g transform={`translate(${START_X + trackedPos * CHAR_WIDTH - CHAR_WIDTH/2}, ${LAYOUT.POINTER_BEFORE_Y})`} className="transition-all duration-500 ease-elastic">
             {/* Character Avatar / Pin */}
             <circle r={14} cy={-5} className="fill-indigo-500 stroke-indigo-300 stroke-2" />
             <text y={-1} textAnchor="middle" className="fill-white text-[10px] font-bold">Me</text>
             {/* Arrow pointing up */}
             <path d="M0,10 L5,20 L-5,20 Z" className="fill-indigo-500" />
             <text y={35} textAnchor="middle" className="fill-indigo-300 text-xs font-bold">Pos {trackedPos}</text>
          </g>

          {/* Action Visualization (Middle Lines) */}
          <g>
             {/* Connection Curve */}
             <path 
                d={`M ${START_X + trackedPos * CHAR_WIDTH - CHAR_WIDTH/2}, ${LAYOUT.POINTER_BEFORE_Y + 15} 
                    C ${START_X + trackedPos * CHAR_WIDTH - CHAR_WIDTH/2}, ${LAYOUT.POINTER_BEFORE_Y + 80} 
                      ${START_X + mappingResult.newPos * CHAR_WIDTH - CHAR_WIDTH/2}, ${LAYOUT.POINTER_AFTER_Y - 80} 
                      ${START_X + mappingResult.newPos * CHAR_WIDTH - CHAR_WIDTH/2}, ${LAYOUT.POINTER_AFTER_Y - 15}`}
                fill="none"
                stroke={mappingResult.deleted ? "#f87171" : "#818cf8"}
                strokeWidth="3"
                strokeDasharray={mappingResult.deleted ? "6 4" : "none"}
                className="opacity-60 transition-all duration-500"
             />
             
             {mappingResult.deleted && (
               <g transform={`translate(${(START_X + trackedPos * CHAR_WIDTH - CHAR_WIDTH/2 + START_X + mappingResult.newPos * CHAR_WIDTH - CHAR_WIDTH/2)/2}, ${(LAYOUT.POINTER_BEFORE_Y + LAYOUT.POINTER_AFTER_Y)/2})`}>
                 <circle r={12} className="fill-red-500 animate-pulse" />
                 <text y={4} textAnchor="middle" className="fill-white text-xs font-bold">❌</text>
               </g>
             )}
          </g>

          {/* Tracked Point After */}
          <g transform={`translate(${START_X + mappingResult.newPos * CHAR_WIDTH - CHAR_WIDTH/2}, ${LAYOUT.POINTER_AFTER_Y})`} className="transition-all duration-500 ease-elastic">
             {/* Arrow pointing down */}
             <path d="M0,-20 L5,-10 L-5,-10 Z" className={mappingResult.deleted ? "fill-red-500" : "fill-emerald-500"} />
             
             <circle r={14} cy={5} className={mappingResult.deleted ? "fill-red-500 stroke-red-300 stroke-2" : "fill-emerald-500 stroke-emerald-300 stroke-2"} />
             <text y={9} textAnchor="middle" className="fill-white text-[10px] font-bold">
                {mappingResult.deleted ? 'RIP' : 'Here'}
             </text>
             
             <text y={-25} textAnchor="middle" className={mappingResult.deleted ? "fill-red-400 text-xs font-bold" : "fill-emerald-400 text-xs font-bold"}>
               {mappingResult.deleted ? 'Deleted' : `Pos ${mappingResult.newPos}`}
             </text>
          </g>

          {/* Bottom Ruler (After) */}
          {renderRuler(finalDoc, LAYOUT.RULER_AFTER_Y)}
           
          {/* Label After */}
          <text x={10} y={LAYOUT.LABEL_AFTER_Y} className="fill-slate-400 text-xs font-bold uppercase tracking-widest">
            ✨ 变身后 (After)
          </text>

        </svg>

        {/* Step Description Overlay */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-5 py-2 rounded-full text-xs font-bold border border-slate-700 shadow-xl transition-all hover:scale-105 z-20">
           ⚔️ StepMap 正在施法...
        </div>
      </div>
    </div>
  );
};

export default MappingPlayground;