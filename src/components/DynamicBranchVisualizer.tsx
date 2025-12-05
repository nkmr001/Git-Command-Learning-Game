import { motion } from 'motion/react';
import { GitBranch, GitCommit, GitMerge } from 'lucide-react';
import { RepositoryState } from '../utils/gitSimulator';

type DynamicBranchVisualizerProps = {
    state: RepositoryState;
};

type Node = {
    id: string;
    message: string;
    branch: string;
    x: number;
    y: number;
    isMerge?: boolean;
    isHead?: boolean;
};

export function DynamicBranchVisualizer({ state }: DynamicBranchVisualizerProps) {
    const branches = Object.keys(state.branches);
    const branchYMap: Record<string, number> = {};

    // Assign Y coordinates to branches
    // main is always 0
    branchYMap['main'] = 0;
    let currentY = 1;
    branches.forEach(b => {
        if (b !== 'main') {
            branchYMap[b] = currentY++;
        }
    });

    // Create nodes from commits
    const nodes: Node[] = state.commits.map((commit, index) => {
        return {
            id: commit.hash,
            message: commit.message,
            branch: commit.branch,
            x: index,
            y: branchYMap[commit.branch] || 0,
            isMerge: commit.message.startsWith('Merge'),
            isHead: state.HEAD === commit.hash
        };
    });

    // If no commits, show initial state
    if (nodes.length === 0) {
        nodes.push({
            id: 'init',
            message: 'Start',
            branch: 'main',
            x: 0,
            y: 0,
            isHead: true
        });
    }

    const getBranchColor = (branch: string): string => {
        const colors: Record<string, string> = {
            'main': '#10b981', // emerald-500
            'feature': '#3b82f6', // blue-500
            'develop': '#8b5cf6', // violet-500
            'hotfix': '#ef4444', // red-500
        };
        // Generate color hash for unknown branches
        if (!colors[branch]) {
            const hash = branch.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
            const hue = Math.abs(hash % 360);
            return `hsl(${hue}, 70%, 50%)`;
        }
        return colors[branch];
    };

    return (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <GitBranch className="size-5 text-slate-600" />
                <h4 className="text-slate-900">Repository Visualization</h4>
            </div>

            <div className="bg-white rounded-lg p-6 overflow-x-auto">
                <svg
                    width={Math.max(nodes.length * 120 + 100, 500)}
                    height={Math.max(Object.keys(branchYMap).length * 80 + 100, 200)}
                    className="min-w-[500px]"
                >
                    {/* Connection Lines */}
                    {nodes.map((node, index) => {
                        if (index === 0) return null;
                        // Find parent node (simplified: just previous node for now, ideally use parents array)
                        // Since we don't have full graph traversal here yet, we'll connect to previous commit if on same branch
                        // or if it's a merge/branch point.
                        // For simplicity in this v1, let's connect to index-1. 
                        // Real git graph is harder, but for linear tutorial progression this might suffice.

                        // Better approach: use parents if available, else index-1
                        const commit = state.commits.find(c => c.hash === node.id);
                        const parentHashes = commit?.parents || [];

                        // If we have explicit parents, draw lines to them
                        if (parentHashes.length > 0) {
                            return parentHashes.map(pHash => {
                                const parentNode = nodes.find(n => n.id === pHash);
                                if (!parentNode) return null;
                                return (
                                    <motion.line
                                        key={`line-${node.id}-${pHash}`}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        x1={parentNode.x * 120 + 60}
                                        y1={parentNode.y * 80 + 40}
                                        x2={node.x * 120 + 60}
                                        y2={node.y * 80 + 40}
                                        stroke={getBranchColor(node.branch)}
                                        strokeWidth="3"
                                        strokeDasharray={node.isMerge ? "5,5" : "0"}
                                    />
                                );
                            });
                        }

                        // Fallback for linear visualization if no parents (e.g. first commit logic in simulator might be simplified)
                        const prevNode = nodes[index - 1];
                        return (
                            <motion.line
                                key={`line-${node.id}`}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
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

                    {/* Nodes */}
                    {nodes.map((node, index) => (
                        <g key={node.id}>
                            <motion.circle
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                cx={node.x * 120 + 60}
                                cy={node.y * 80 + 40}
                                r={node.isHead ? "25" : "20"}
                                fill={getBranchColor(node.branch)}
                                stroke={node.isHead ? "#fbbf24" : "white"} // Yellow stroke for HEAD
                                strokeWidth={node.isHead ? "4" : "3"}
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
                                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                                x={node.x * 120 + 60}
                                y={node.y * 80 + 80}
                                textAnchor="middle"
                                className="text-xs fill-slate-600 font-mono"
                            >
                                {node.message.length > 15 ? node.message.substring(0, 15) + '...' : node.message}
                            </motion.text>

                            {node.isHead && (
                                <motion.text
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    x={node.x * 120 + 60}
                                    y={node.y * 80 + 15}
                                    textAnchor="middle"
                                    className="text-xs fill-amber-500 font-bold"
                                >
                                    HEAD
                                </motion.text>
                            )}
                        </g>
                    ))}
                </svg>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4">
                    {branches.map((branch) => (
                        <div key={branch} className="flex items-center gap-2">
                            <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: getBranchColor(branch) }}
                            />
                            <span className="text-sm text-slate-600">{branch}</span>
                            {state.currentBranch === branch && (
                                <span className="text-xs text-slate-400">(current)</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
