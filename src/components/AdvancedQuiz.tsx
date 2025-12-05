import { useState, useEffect } from 'react';
import { AdvancedScenario } from './AdvancedQuizData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trophy, Target, Lightbulb, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { TerminalInterface, TerminalHistoryItem } from './TerminalInterface';
import { executeGitCommand, RepositoryState } from '../utils/gitSimulator';
import { DynamicBranchVisualizer } from './DynamicBranchVisualizer';

type AdvancedQuizProps = {
  scenario: AdvancedScenario;
  onComplete: (scenarioId: string, passed: boolean) => void;
  onBack: () => void;
};

export function AdvancedQuiz({ scenario, onComplete, onBack }: AdvancedQuizProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [history, setHistory] = useState<TerminalHistoryItem[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [repoState, setRepoState] = useState<RepositoryState>(scenario.initialState);

  const currentTask = scenario.tasks[currentTaskIndex];
  const totalTasks = scenario.tasks.length;

  // Reset state when scenario changes
  useEffect(() => {
    setRepoState(scenario.initialState);
    setCurrentTaskIndex(0);
    setHistory([]);
    setShowHint(false);
    setQuizComplete(false);
  }, [scenario]);

  const handleCommand = (input: string) => {
    if (!currentTask) return;

    const result = executeGitCommand(input, currentTask.expectedCommand, repoState);

    setHistory(prev => [...prev, {
      command: input,
      result: result.output,
      isError: result.isError
    }]);

    if (result.newState) {
      setRepoState(result.newState);
    }

    if (result.success) {
      setTimeout(() => {
        if (currentTaskIndex < totalTasks - 1) {
          setCurrentTaskIndex(prev => prev + 1);
          // Keep history for context, don't clear it
          setShowHint(false);
        } else {
          setQuizComplete(true);
        }
      }, 1000);
    }
  };

  const handleRetry = () => {
    setRepoState(scenario.initialState);
    setCurrentTaskIndex(0);
    setHistory([]);
    setShowHint(false);
    setQuizComplete(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'intermediate': return 'bg-blue-500';
      case 'advanced': return 'bg-purple-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      case 'expert': return '超上級';
      default: return '';
    }
  };

  if (quizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="mb-6">
            <Trophy className="size-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-green-900 text-2xl font-bold mb-2">
              シナリオクリア！
            </h2>
            <p className="text-green-800">
              {scenario.title} を攻略しました！
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} variant="outline" size="lg">
              <RotateCcw className="size-5 mr-2" />
              もう一度挑戦
            </Button>
            <Button
              onClick={() => onComplete(scenario.id, true)}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              一覧に戻る
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-slate-900 text-xl font-bold">{scenario.title}</h2>
              <Badge className={getDifficultyColor(scenario.difficulty)}>
                {getDifficultyLabel(scenario.difficulty)}
              </Badge>
            </div>
            <p className="text-slate-600">{scenario.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <p className="text-sm text-indigo-600 mb-1 font-bold">状況</p>
            <p className="text-slate-800 text-sm">{scenario.situation}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="size-4 text-green-600" />
              <p className="text-sm text-green-600 font-bold">目標</p>
            </div>
            <p className="text-slate-800 text-sm">{scenario.goal}</p>
          </div>
        </div>
      </Card>

      <DynamicBranchVisualizer state={repoState} />

      <div className="flex justify-between items-center">
        <span className="text-slate-600">
          Step {currentTaskIndex + 1} / {totalTasks}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentTaskIndex) / totalTasks) * 100}%` }}
        />
      </div>

      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          <span className="text-blue-500 mr-2">Mission:</span>
          {currentTask?.instruction}
        </h3>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="size-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-900 font-medium mb-1">ヒント</p>
                <p className="text-amber-800 text-sm">
                  {currentTask?.hint}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Command Log */}
      <Card className="p-6 bg-slate-900 border-slate-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          Command Log
        </h3>
        <div className="font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
          {history.length === 0 && (
            <div className="text-slate-600 italic">No commands executed yet...</div>
          )}
          {history.map((item, index) => (
            <div key={index} className="space-y-1 border-b border-slate-800 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-green-500">$</span>
                <span>{item.command}</span>
              </div>
              {item.result && (
                <div className={`pl-4 whitespace-pre-wrap ${item.isError ? 'text-red-400' : 'text-slate-400'}`}>
                  {item.result}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <TerminalInterface
        history={history}
        onCommand={handleCommand}
        onReset={handleRetry}
        showHint={showHint}
        onToggleHint={() => setShowHint(!showHint)}
      />
    </div>
  );
}