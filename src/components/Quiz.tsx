import { useState, useEffect } from 'react';
import { GitCommand } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trophy, RotateCcw, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { TerminalInterface, TerminalHistoryItem } from './TerminalInterface';
import { executeGitCommand, RepositoryState, initialRepositoryState } from '../utils/gitSimulator';
import { DynamicBranchVisualizer } from './DynamicBranchVisualizer';

type QuizProps = {
  command: GitCommand;
  onComplete: (commandId: string, passed: boolean) => void;
};

export function Quiz({ command, onComplete }: QuizProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [history, setHistory] = useState<TerminalHistoryItem[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // Initialize with command's initial state or default
  const [repoState, setRepoState] = useState<RepositoryState>(
    command.practice?.initialState ? JSON.parse(JSON.stringify(command.practice.initialState)) : initialRepositoryState
  );

  const tasks = command.practice?.tasks || [];
  const currentTask = tasks[currentTaskIndex];
  const totalTasks = tasks.length;

  // Reset when command changes
  useEffect(() => {
    setRepoState(
      command.practice?.initialState ? JSON.parse(JSON.stringify(command.practice.initialState)) : initialRepositoryState
    );
    setCurrentTaskIndex(0);
    setHistory([]);
    setShowHint(false);
    setQuizComplete(false);
  }, [command]);

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
      // Wait 1 second before showing success/next task
      setTimeout(() => {
        if (currentTaskIndex < totalTasks - 1) {
          setCurrentTaskIndex(prev => prev + 1);
          setHistory([]);
          setShowHint(false);
        } else {
          setQuizComplete(true);
        }
      }, 1000);
    }
  };

  const handleRetry = () => {
    setCurrentTaskIndex(0);
    setHistory([]);
    setShowHint(false);
    setQuizComplete(false);
    setRepoState(
      command.practice?.initialState ? JSON.parse(JSON.stringify(command.practice.initialState)) : initialRepositoryState
    );
  };

  if (quizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="mb-6">
            <Trophy className="size-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-green-900 text-2xl font-bold mb-2">
              おめでとうございます！
            </h2>
            <p className="text-green-800">
              {command.name} コマンドをマスターしました！
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRetry}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="size-5 mr-2" />
              もう一度挑戦
            </Button>
            <Button
              onClick={() => onComplete(command.id, true)}
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

  if (!currentTask) {
    return <div>Task data not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-600">
            Task {currentTaskIndex + 1} / {totalTasks}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentTaskIndex) / totalTasks) * 100}%` }}
          />
        </div>
      </div>

      <DynamicBranchVisualizer state={repoState} />

      <Card className="p-6 mb-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          <span className="text-blue-500 mr-2">Mission:</span>
          {currentTask.instruction}
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
                  期待されるコマンド: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">{currentTask.expectedCommand}</code>
                </p>
              </div>
            </div>
          </motion.div>
        )}
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
