import { useState, useEffect } from 'react';
import { CommandList } from './components/CommandList';
import { CommandDetail } from './components/CommandDetail';
import { Quiz } from './components/Quiz';
import { ProgressTracker } from './components/ProgressTracker';
import { AdvancedQuizList } from './components/AdvancedQuizList';
import { AdvancedQuiz } from './components/AdvancedQuiz';
import { TerminalSimulator } from './components/TerminalSimulator';
import { advancedScenarios, AdvancedScenario } from './components/AdvancedQuizData';
import { GitBranch, Trophy, Award } from 'lucide-react';
import { Button } from './components/ui/button';
import { gitCommands, GitCommand } from './data/gitCommands';

export type ViewMode = 'list' | 'detail' | 'quiz' | 'advanced-quiz' | 'terminal';

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-500 hover:text-slate-900'
        }`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCommand, setSelectedCommand] = useState<GitCommand | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<AdvancedScenario | null>(null);

  // Initialize from localStorage
  const [completedCommands, setCompletedCommands] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('completedCommands');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error('Failed to load completedCommands', e);
      return new Set();
    }
  });

  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('completedScenarios');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error('Failed to load completedScenarios', e);
      return new Set();
    }
  });

  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'terminal'>('basic');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('completedCommands', JSON.stringify(Array.from(completedCommands)));
    } catch (e) {
      console.error('Failed to save completedCommands', e);
    }
  }, [completedCommands]);

  useEffect(() => {
    try {
      localStorage.setItem('completedScenarios', JSON.stringify(Array.from(completedScenarios)));
    } catch (e) {
      console.error('Failed to save completedScenarios', e);
    }
  }, [completedScenarios]);

  // Initialize history state on mount
  useEffect(() => {
    // Replace initial state to ensure we have a base state
    window.history.replaceState({ mode: 'list', tab: 'basic' }, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (state.mode === 'list') {
          setViewMode('list');
          setSelectedCommand(null);
          setSelectedScenario(null);
          if (state.tab) setActiveTab(state.tab);
        } else if (state.mode === 'detail' && state.commandId) {
          const cmd = gitCommands.find(c => c.id === state.commandId);
          if (cmd) {
            setSelectedCommand(cmd);
            setViewMode('detail');
          }
        } else if (state.mode === 'quiz' && state.commandId) {
          const cmd = gitCommands.find(c => c.id === state.commandId);
          if (cmd) {
            setSelectedCommand(cmd);
            setViewMode('quiz');
          }
        } else if (state.mode === 'advanced-quiz' && state.scenarioId) {
          const scn = advancedScenarios.find(s => s.id === state.scenarioId);
          if (scn) {
            setSelectedScenario(scn);
            setViewMode('advanced-quiz');
          }
        } else if (state.mode === 'terminal') {
          setViewMode('terminal');
          setActiveTab('terminal');
        }
      } else {
        // Fallback to list if no state
        setViewMode('list');
        setSelectedCommand(null);
        setSelectedScenario(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (mode: ViewMode, params: { commandId?: string; scenarioId?: string; tab?: string } = {}) => {
    const state = { mode, ...params };
    window.history.pushState(state, '');

    if (mode === 'list') {
      setViewMode('list');
      setSelectedCommand(null);
      setSelectedScenario(null);
      if (params.tab) setActiveTab(params.tab as any);
    } else if (mode === 'detail' && params.commandId) {
      const cmd = gitCommands.find(c => c.id === params.commandId);
      if (cmd) {
        setSelectedCommand(cmd);
        setViewMode('detail');
      }
    } else if (mode === 'quiz' && params.commandId) {
      const cmd = gitCommands.find(c => c.id === params.commandId);
      if (cmd) {
        setSelectedCommand(cmd);
        setViewMode('quiz');
      }
    } else if (mode === 'advanced-quiz' && params.scenarioId) {
      const scn = advancedScenarios.find(s => s.id === params.scenarioId);
      if (scn) {
        setSelectedScenario(scn);
        setViewMode('advanced-quiz');
      }
    } else if (mode === 'terminal') {
      setViewMode('terminal');
      setActiveTab('terminal');
    }
  };

  const handleSelectCommand = (command: GitCommand) => {
    navigateTo('detail', { commandId: command.id });
  };

  const handleStartQuiz = (command: GitCommand) => {
    navigateTo('quiz', { commandId: command.id });
  };

  const handleQuizComplete = (commandId: string, passed: boolean) => {
    if (passed) {
      setCompletedCommands(prev => new Set([...prev, commandId]));
    }
    setQuizResults(prev => ({ ...prev, [commandId]: passed }));
    // Go back to list, replacing current history entry so we don't loop back to quiz
    // Actually, usually we want to go back to list.
    // Let's just push list state.
    navigateTo('list', { tab: 'basic' });
  };

  const handleSelectScenario = (scenario: AdvancedScenario) => {
    navigateTo('advanced-quiz', { scenarioId: scenario.id });
  };

  const handleAdvancedQuizComplete = (scenarioId: string, passed: boolean) => {
    if (passed) {
      setCompletedScenarios(prev => new Set([...prev, scenarioId]));
    }
    // Return to list
    navigateTo('list', { tab: 'advanced' });
  };

  const handleBackToList = () => {
    window.history.back();
  };

  const handleOpenTerminal = () => {
    navigateTo('terminal');
  };

  const handleTabChange = (tab: 'basic' | 'advanced' | 'terminal') => {
    setActiveTab(tab);
    // Update current history entry to remember tab selection
    window.history.replaceState({ mode: 'list', tab }, '');
  };

  const progress = (completedCommands.size / gitCommands.length) * 100;
  const advancedProgress = (completedScenarios.size / advancedScenarios.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-2 rounded-lg">
                <GitBranch className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">Git コマンド学習ゲーム</h1>
                <p className="text-slate-600 text-sm">一つ一つ丁寧にマスターしよう</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-lg border border-amber-200">
                <Trophy className="size-5 text-amber-600" />
                <span className="text-amber-900">
                  {completedCommands.size} / {gitCommands.length}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 rounded-lg border border-purple-200">
                <Award className="size-5 text-purple-600" />
                <span className="text-purple-900">
                  {completedScenarios.size} / {advancedScenarios.length}
                </span>
              </div>
            </div>
          </div>
          <ProgressTracker progress={progress} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {viewMode === 'list' && (
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <TabButton
                active={activeTab === 'basic'}
                onClick={() => handleTabChange('basic')}
              >
                基本コマンド
              </TabButton>
              <TabButton
                active={activeTab === 'advanced'}
                onClick={() => handleTabChange('advanced')}
              >
                上級クイズ
              </TabButton>
              <TabButton
                active={activeTab === 'terminal'}
                onClick={() => handleOpenTerminal()}
              >
                ターミナル
              </TabButton>
            </div>

            <div className="mt-6">
              {activeTab === 'basic' && (
                <CommandList
                  commands={gitCommands}
                  completedCommands={completedCommands}
                  onSelectCommand={handleSelectCommand}
                  onStartQuiz={handleStartQuiz}
                  quizResults={quizResults}
                />
              )}
              {activeTab === 'advanced' && (
                <AdvancedQuizList
                  scenarios={advancedScenarios}
                  completedScenarios={completedScenarios}
                  onSelectScenario={handleSelectScenario}
                />
              )}
              {activeTab === 'terminal' && (
                <TerminalSimulator onBack={handleBackToList} />
              )}
            </div>
          </div>
        )}

        {viewMode === 'detail' && selectedCommand && (
          <div>
            <Button
              onClick={handleBackToList}
              variant="ghost"
              className="mb-4"
            >
              ← 一覧に戻る
            </Button>
            <CommandDetail
              command={selectedCommand}
              onStartQuiz={() => handleStartQuiz(selectedCommand)}
              isCompleted={completedCommands.has(selectedCommand.id)}
            />
          </div>
        )}

        {viewMode === 'quiz' && selectedCommand && (
          <div>
            <Button
              onClick={handleBackToList}
              variant="ghost"
              className="mb-4"
            >
              ← 一覧に戻る
            </Button>
            <Quiz
              command={selectedCommand}
              onComplete={handleQuizComplete}
            />
          </div>
        )}

        {viewMode === 'advanced-quiz' && selectedScenario && (
          <div>
            <Button
              onClick={handleBackToList}
              variant="ghost"
              className="mb-4"
            >
              ← 一覧に戻る
            </Button>
            <AdvancedQuiz
              scenario={selectedScenario}
              onComplete={handleAdvancedQuizComplete}
              onBack={handleBackToList}
            />
          </div>
        )}

        {viewMode === 'terminal' && (
          <TerminalSimulator onBack={handleBackToList} />
        )}
      </main>
    </div>
  );
}