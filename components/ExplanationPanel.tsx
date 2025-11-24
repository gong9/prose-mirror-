import React, { useMemo } from 'react';
import { Sparkles, MessageSquareQuote, Zap } from 'lucide-react';
import { Step, MappingResult, ActionType } from '../types';

interface ExplanationPanelProps {
  docBefore: string;
  step: Step;
  trackedPos: number;
  mappedPos: number;
  result?: MappingResult;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ 
  docBefore, step, trackedPos, mappedPos
}) => {
  
  // Logic to generate "Anime/Game Style" explanations
  const explanation = useMemo(() => {
    if (step.type === ActionType.INSERT) {
      if (trackedPos < step.from) {
        return {
          title: "保持不动 (Stay)",
          content: "“前面好热闹！但跟我没关系，我还是在老地方呆着喝茶。 (￣▽￣)~*” \n\n(因为插入发生在我的右边，所以我左边的位置不需要变化。)"
        };
      } else if (trackedPos === step.from) {
        return {
          title: "随波逐流 (Bias > 0)",
          content: "“哇！新朋友直接空降到我脸上了！😳 既然这样，我就跟着他们一起往右边挤一挤吧！” \n\n(ProseMirror 默认会将光标推向新插入内容的后方，这符合我们打字的直觉。)"
        };
      } else {
        const len = step.slice?.length || 0;
        return {
          title: "被迫搬家 (Shift Right)",
          content: `“哎呀！前面突然插队了 ${len} 个新来的家伙，把整个队伍都挤长了！😫 我只能乖乖带着行李往后挪到 ${mappedPos} 啦。” \n\n(所有在插入点之后的位置都会增加，幅度等于插入内容的长度。)`
        };
      }
    } else if (step.type === ActionType.DELETE) {
      if (trackedPos < step.from) {
        return {
          title: "岁月静好 (Safe)",
          content: "“听说前面有人消失了？😨 没关系，我离得远，这里非常安全，位置不变！” \n\n(删除发生在光标右侧，左侧索引不受影响。)"
        };
      } else if (trackedPos >= step.to) {
        const deletedLen = step.to - step.from;
        return {
          title: "向前补位 (Shift Left)",
          content: `“前面的路塌了！😱 前方留出了 ${deletedLen} 个空位，大家快往前补位啊！冲鸭！现在我是 ${mappedPos} 号！” \n\n(前面的内容被删除，导致文档变短，后续索引自动减小。)`
        };
      } else {
        return {
          title: "虚空吞噬 (Deleted)",
          content: `“救命啊！我脚下的地板正在消失！🆘 我掉进虚空了... 只好在边缘位置 ${mappedPos} 重生了。” \n\n(光标位于被删除的区间内。虽然位置数字变成了删除范围的起点，但它会被标记为 deleted: true。)`
        };
      }
    }
    return { title: "等待指令...", content: "请操作控制台来发动魔法！" };
  }, [step, trackedPos, mappedPos]);

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      
      {/* Dynamic Story Card */}
      <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-white p-2 rounded-full shadow-sm">
             <MessageSquareQuote size={20} className="text-purple-600" />
          </div>
          <h2 className="font-black text-slate-800 text-lg">主角日记</h2>
        </div>
        
        <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Sparkles size={60} />
          </div>
          <h3 className="text-indigo-600 font-bold text-sm mb-2 flex items-center gap-2">
            {explanation.title}
          </h3>
          <p className="text-slate-700 text-sm leading-6 whitespace-pre-line font-medium">
            {explanation.content}
          </p>
        </div>
      </div>

      {/* Static Tutorials */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        
        <div className="space-y-4">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
             <Zap size={16} className="text-yellow-500" /> 魔法守则 (Rules)
           </h3>

           {/* Rule 1 */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 mb-2">
               <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold font-mono">Insert</span>
               <span className="text-sm font-bold text-slate-700">插队规则</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               如果有人插队（插入内容），排在他后面的人都得往后挪（索引增加）。
             </p>
           </div>

           {/* Rule 2 */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 mb-2">
               <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold font-mono">Delete</span>
               <span className="text-sm font-bold text-slate-700">消失规则</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               如果有人离开了（删除内容），后面的人就要往前补位（索引减小）。
             </p>
           </div>

           {/* Rule 3 */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 mb-2">
               <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold font-mono">Deleted</span>
               <span className="text-sm font-bold text-slate-700">重生规则</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               如果你站的位置被炸飞了（Deleted: True），你会重生在灾难发生边缘的最近位置。但这就像“幽灵”状态，很多时候业务逻辑需要把你清理掉哦！
             </p>
           </div>
        </div>

      </div>

    </div>
  );
};

export default ExplanationPanel;