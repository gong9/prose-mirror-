import React, { useState } from 'react';
import MappingPlayground from './components/MappingPlayground';
import ExplanationPanel from './components/ExplanationPanel';
import { Step } from './types';
import { Gamepad2, Map, Users, Ghost } from 'lucide-react';

const App: React.FC = () => {
  const [vizState, setVizState] = useState<{
    docBefore: string,
    docAfter: string,
    step: Step,
    trackedPos: number,
    mappedPos: number
  } | null>(null);

  const handleStateChange = (docBefore: string, docAfter: string, step: Step, trackedPos: number, mappedPos: number) => {
    setVizState({ docBefore, docAfter, step, trackedPos, mappedPos });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-indigo-100 h-16 flex items-center px-6 justify-between flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-indigo-200 shadow-lg transform hover:scale-110 transition-transform">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">ProseMirror 异世界指南 🗺️</h1>
            <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Mapping Adventure</div>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500 hidden sm:block">
           ✨ 见证光标的奇幻漂流
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left: Visualization */}
        <div className="flex-1 p-4 lg:p-8 bg-slate-50 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
                🌟 坐标瞬移术 (Teleportation)
              </h2>
              <p className="text-slate-600 leading-relaxed">
                欢迎来到 <strong>ProseMirror 宇宙</strong>！在这里，世界（文档）随时都在发生巨变。
                当世界改变时，你的小光标（主角）会被传送到哪里去呢？
                <br/>
                <span className="text-sm text-indigo-500 font-bold mt-1 inline-block">👇 动动手指，发动“Mapping”魔法来看看吧！</span>
              </p>
            </div>
            
            <MappingPlayground onStateChange={handleStateChange} />
            
            {/* Concept Cards - RPG Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-5 rounded-xl border-2 border-slate-100 hover:border-indigo-300 transition-colors group cursor-help">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform"><Users size={18}/></div>
                  <div className="font-bold text-slate-700">Token 队列</div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  文档里的字符就像排排坐的小伙伴。位置索引 (Index) 就是他们的座位号，大家都得按顺序坐好哦！
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-xl border-2 border-slate-100 hover:border-yellow-300 transition-colors group cursor-help">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform"><Map size={18}/></div>
                   <div className="font-bold text-slate-700">藏宝图 (StepMap)</div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  世界变了别担心！每一个操作 (Step) 都会掉落一张地图 (Map)，指引我们找到原来的位置变到了哪里。
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border-2 border-slate-100 hover:border-purple-300 transition-colors group cursor-help">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform"><Ghost size={18}/></div>
                   <div className="font-bold text-slate-700">性格倾向 (Bias)</div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  当新朋友空降插队时，你的光标是害羞地留在左边 (Bias &lt; 0)，还是跟着新朋友一起往右跑 (Bias &gt; 0)？
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Explanation Panel */}
        <div className="lg:w-[400px] h-full flex-shrink-0 border-l border-slate-200 bg-white shadow-2xl lg:shadow-none z-20">
          {vizState && (
            <ExplanationPanel 
              docBefore={vizState.docBefore}
              step={vizState.step}
              trackedPos={vizState.trackedPos}
              mappedPos={vizState.mappedPos}
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default App;