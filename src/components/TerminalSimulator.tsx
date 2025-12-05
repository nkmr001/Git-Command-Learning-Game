import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Terminal, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { TerminalInterface, TerminalHistoryItem } from './TerminalInterface';

type TerminalChallenge = {
  id: string;
  title: string;
  description: string;
  initialState: {
    currentBranch: string;
    branches: string[];
    files: { name: string; status: 'untracked' | 'modified' | 'staged' | 'committed' }[];
    commits: { hash: string; message: string; branch: string }[];
  };
  goal: string;
  expectedCommands: string[];
  hints: string[];
};

const challenges: TerminalChallenge[] = [
  {
    id: 'challenge-1',
    title: '初めてのコミット',
    description: '新しいファイルをステージングしてコミットしてみましょう',
    initialState: {
      currentBranch: 'main',
      branches: ['main'],
      files: [
        { name: 'index.html', status: 'untracked' }
      ],
      commits: []
    },
    goal: 'index.htmlをステージングして、"Initial commit"というメッセージでコミットする',
    expectedCommands: [
      'git add index.html',
      'git commit -m "Initial commit"'
    ],
    hints: [
      'git add でファイルをステージングします',
      'git commit -m でメッセージ付きコミット'
    ]
  },
  {
    id: 'challenge-2',
    title: 'ブランチの作成と切り替え',
    description: '新しいブランチを作成して切り替えましょう',
    initialState: {
      currentBranch: 'main',
      branches: ['main'],
      files: [
        { name: 'index.html', status: 'committed' }
      ],
      commits: [
        { hash: 'a1b2c3d', message: 'Initial commit', branch: 'main' }
      ]
    },
    goal: 'featureブランチを作成して切り替える',
    expectedCommands: [
      'git checkout -b feature'
    ],
    hints: [
      'git checkout -b でブランチ作成と切り替えを同時に行えます',
      'または git branch feature → git checkout feature'
    ]
  },
  {
    id: 'challenge-3',
    title: '変更の確認とコミット',
    description: 'ファイルの状態を確認してからコミットしましょう',
    initialState: {
      currentBranch: 'main',
      branches: ['main'],
      files: [
        { name: 'app.js', status: 'modified' },
        { name: 'style.css', status: 'modified' }
      ],
      commits: [
        { hash: 'a1b2c3d', message: 'Initial commit', branch: 'main' }
      ]
    },
    goal: '状態を確認してから、全ての変更をステージングしてコミットする',
    expectedCommands: [
      'git status',
      'git add .',
      'git commit -m "Update files"'
    ],
    hints: [
      'git status で現在の状態を確認',
      'git add . で全ての変更をステージング',
      'git commit -m でコミット'
    ]
  }
];

type TerminalSimulatorProps = {
  onBack: () => void;
};

export function TerminalSimulator({ onBack }: TerminalSimulatorProps) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [commandHistory, setCommandHistory] = useState<TerminalHistoryItem[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[currentChallengeIndex];
  const progress = (completedSteps / challenge.expectedCommands.length) * 100;

  const getSuccessMessage = (command: string): string => {
    if (command.startsWith('git add')) {
      return 'ファイルがステージングエリアに追加されました ✓';
    } else if (command.startsWith('git commit')) {
      return 'コミットが成功しました ✓';
    } else if (command.startsWith('git checkout -b')) {
      return 'ブランチを作成して切り替えました ✓';
    } else if (command.startsWith('git checkout')) {
      return 'ブランチを切り替えました ✓';
    } else if (command.startsWith('git branch')) {
      return 'ブランチを作成しました ✓';
    }
    return 'コマンドが成功しました ✓';
  };

  const getStatusOutput = (): string => {
    return `On branch ${challenge.initialState.currentBranch}
${challenge.initialState.files.map(f => {
      if (f.status === 'untracked') return `Untracked files:\n  ${f.name}`;
      if (f.status === 'modified') return `Changes not staged:\n  modified: ${f.name}`;
      if (f.status === 'staged') return `Changes to be committed:\n  ${f.name}`;
      return '';
    }).filter(Boolean).join('\n')}`;
  };

  const getBranchOutput = (): string => {
    return challenge.initialState.branches.map(b =>
      b === challenge.initialState.currentBranch ? `* ${b}` : `  ${b}`
    ).join('\n');
  };

  const getLogOutput = (): string => {
    return challenge.initialState.commits.map(c =>
      `commit ${c.hash}\n    ${c.message}`
    ).join('\n\n');
  };

  const handleCommand = (input: string) => {
    const trimmedCommand = input.trim();
    const expectedCommand = challenge.expectedCommands[completedSteps];

    let result = '';
    let isError = false;

    // コマンドの検証
    if (trimmedCommand === expectedCommand ||
      (expectedCommand.includes('"') &&
        trimmedCommand.replace(/"/g, "'") === expectedCommand.replace(/"/g, "'"))) {
      // 正解
      result = getSuccessMessage(trimmedCommand);
      setCompletedSteps(prev => prev + 1);
    } else if (challenge.expectedCommands.some(cmd =>
      trimmedCommand === cmd ||
      (cmd.includes('"') && trimmedCommand.replace(/"/g, "'") === cmd.replace(/"/g, "'"))
    )) {
      // 正しいコマンドだが順番が違う
      result = '正しいコマンドですが、順番が違います。ヒントを確認してください。';
      isError = true;
    } else if (trimmedCommand === 'git status') {
      result = getStatusOutput();
    } else if (trimmedCommand === 'git branch') {
      result = getBranchOutput();
    } else if (trimmedCommand === 'git log') {
      result = getLogOutput();
    } else if (trimmedCommand === 'help' || trimmedCommand === 'hint') {
      setShowHint(true);
      result = 'ヒントを表示しました';
    } else {
      result = `コマンドが正しくありません。期待されるコマンド: ${expectedCommand}`;
      isError = true;
    }

    setCommandHistory(prev => [...prev, { command: trimmedCommand, result, isError }]);
  };

  const handleReset = () => {
    setCommandHistory([]);
    setCompletedSteps(0);
    setShowHint(false);
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setCommandHistory([]);
      setCompletedSteps(0);
      setShowHint(false);
    }
  };

  const isCompleted = completedSteps === challenge.expectedCommands.length;

  const hintContent = (
    <Card className="p-4 bg-amber-50 border-amber-200">
      <h4 className="text-amber-900 mb-2">ヒント</h4>
      <ul className="space-y-1">
        {challenge.hints.map((hint, index) => (
          <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
            <span className="text-amber-600">💡</span>
            <span>{hint}</span>
          </li>
        ))}
      </ul>
      {completedSteps < challenge.expectedCommands.length && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <p className="text-sm text-amber-900">
            次のコマンド: <code className="bg-amber-100 px-2 py-1 rounded">
              {challenge.expectedCommands[completedSteps]}
            </code>
          </p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Challenge Info */}
      <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-white mb-2">{challenge.title}</h2>
            <p className="text-slate-300 text-sm">{challenge.description}</p>
          </div>
          <Terminal className="size-8 text-green-400" />
        </div>

        <div className="bg-slate-950 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-400 mb-1">目標:</p>
          <p className="text-white">{challenge.goal}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">進捗</span>
            <span className="text-green-400">
              {completedSteps} / {challenge.expectedCommands.length}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Terminal */}
      <div className="relative">
        <TerminalInterface
          history={commandHistory}
          onCommand={handleCommand}
          onReset={handleReset}
          isCompleted={isCompleted}
          showHint={showHint}
          hintContent={hintContent}
          onToggleHint={() => setShowHint(!showHint)}
        />

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-20 left-4 right-4 bg-green-900/90 border border-green-500 rounded-lg p-4 z-10 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Check className="size-5" />
              <span>チャレンジクリア！</span>
            </div>
            <p className="text-slate-300 text-sm">
              全てのコマンドを正しく実行できました。
            </p>
            {currentChallengeIndex < challenges.length - 1 && (
              <Button
                onClick={handleNextChallenge}
                className="mt-3 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                次のチャレンジへ
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>チャレンジ {currentChallengeIndex + 1} / {challenges.length}</span>
        <Button onClick={onBack} variant="outline">
          戻る
        </Button>
      </div>
    </div>
  );
}
