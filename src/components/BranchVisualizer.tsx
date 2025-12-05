import { motion } from 'motion/react';
import { GitBranch, GitCommit, GitMerge } from 'lucide-react';

export type BranchNode = {
  id: string;
  message: string;
  branch: string;
  x: number;
  y: number;
  isMerge?: boolean;
};

type BranchVisualizerProps = {
  currentStep: number;
  scenario: {
    title: string;
    steps: { instruction: string }[];
  };
};

export function BranchVisualizer({ currentStep, scenario }: BranchVisualizerProps) {
  // シナリオに応じたブランチ構造を生成
  const getBranchStructure = (): { nodes: BranchNode[]; branches: string[] } => {
    const title = scenario.title.toLowerCase();
    
    if (title.includes('新機能開発')) {
      return {
        branches: ['main', 'login-feature'],
        nodes: [
          { id: '1', message: 'Initial', branch: 'main', x: 0, y: 0 },
          { id: '2', message: 'Branch created', branch: 'login-feature', x: 1, y: 1 },
          { id: '3', message: 'Add login', branch: 'login-feature', x: 2, y: 1 },
          { id: '4', message: 'Merge', branch: 'main', x: 3, y: 0, isMerge: true }
        ]
      };
    } else if (title.includes('チーム開発')) {
      return {
        branches: ['main'],
        nodes: [
          { id: '1', message: 'Initial', branch: 'main', x: 0, y: 0 },
          { id: '2', message: 'Pull latest', branch: 'main', x: 1, y: 0 },
          { id: '3', message: 'Add changes', branch: 'main', x: 2, y: 0 },
          { id: '4', message: 'Push', branch: 'main', x: 3, y: 0 }
        ]
      };
    } else if (title.includes('複数機能')) {
      return {
        branches: ['main', 'header', 'footer'],
        nodes: [
          { id: '1', message: 'Initial', branch: 'main', x: 0, y: 0 },
          { id: '2', message: 'Add header', branch: 'header', x: 1, y: 1 },
          { id: '3', message: 'Add footer', branch: 'footer', x: 2, y: 2 },
          { id: '4', message: 'Merge header', branch: 'main', x: 3, y: 0, isMerge: true },
          { id: '5', message: 'Merge footer', branch: 'main', x: 4, y: 0, isMerge: true }
        ]
      };
    }
    
    // デフォルト
    return {
      branches: ['main'],
      nodes: [
        { id: '1', message: 'Start', branch: 'main', x: 0, y: 0 },
        { id: '2', message: 'Progress', branch: 'main', x: 1, y: 0 },
        { id: '3', message: 'Complete', branch: 'main', x: 2, y: 0 }
      ]
    };
  };

  const { nodes, branches } = getBranchStructure();
  
  // 現在のステップまでのノードのみを表示
  const visibleNodeCount = Math.min(currentStep + 1, nodes.length);
  const visibleNodes = nodes.slice(0, visibleNodeCount);

  const getBranchColor = (branch: string): string => {
    const colors: Record<string, string> = {
      'main': '#10b981',
      'feature': '#3b82f6',
      'login-feature': '#8b5cf6',
      'header': '#f59e0b',
      'footer': '#ec4899'
    };
    return colors[branch] || '#64748b';
  };

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="size-5 text-slate-600" />
        <h4 className="text-slate-900">ブランチ構造</h4>
      </div>

      <div className="bg-white rounded-lg p-6 overflow-x-auto">
        <svg
          width="100%"
          height={Math.max(branches.length * 80, 200)}
          className="min-w-[500px]"
        >
          {/* 接続線 */}
          {visibleNodes.map((node, index) => {
            if (index === 0) return null;
            const prevNode = visibleNodes[index - 1];
            
            return (
              <motion.line
                key={`line-${node.id}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                x1={prevNode.x * 120 + 60}
                y1={prevNode.y * 80 + 40}
                x2={node.x * 120 + 60}
                y2={node.y * 80 + 40}
                stroke={getBranchColor(node.branch)}
                strokeWidth="3"
                strokeDasharray={node.isMerge ? "5,5" : "0"}
              />
            );
          })}

          {/* コミットノード */}
          {visibleNodes.map((node, index) => (
            <g key={node.id}>
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.2 }}
                cx={node.x * 120 + 60}
                cy={node.y * 80 + 40}
                r="20"
                fill={getBranchColor(node.branch)}
                stroke="white"
                strokeWidth="3"
              />
              
              {node.isMerge ? (
                <GitMerge
                  className="size-5"
                  x={node.x * 120 + 52}
                  y={node.y * 80 + 32}
                  color="white"
                />
              ) : (
                <GitCommit
                  className="size-5"
                  x={node.x * 120 + 52}
                  y={node.y * 80 + 32}
                  color="white"
                />
              )}

              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.2 + 0.2 }}
                x={node.x * 120 + 60}
                y={node.y * 80 + 70}
                textAnchor="middle"
                className="text-xs fill-slate-600"
              >
                {node.message}
              </motion.text>
            </g>
          ))}
        </svg>

        {/* ブランチ凡例 */}
        <div className="mt-6 flex flex-wrap gap-4">
          {branches.map((branch) => (
            <div key={branch} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: getBranchColor(branch) }}
              />
              <span className="text-sm text-slate-600">{branch}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        ステップ {currentStep + 1} / {scenario.steps.length}
      </div>
    </div>
  );
}
