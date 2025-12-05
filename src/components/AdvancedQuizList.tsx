import { AdvancedScenario } from './AdvancedQuizData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, Target, Zap, Flame } from 'lucide-react';
import { motion } from 'motion/react';

type AdvancedQuizListProps = {
  scenarios: AdvancedScenario[];
  completedScenarios: Set<string>;
  onSelectScenario: (scenario: AdvancedScenario) => void;
};

export function AdvancedQuizList({
  scenarios,
  completedScenarios,
  onSelectScenario,
}: AdvancedQuizListProps) {
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'intermediate':
        return <Zap className="size-5" />;
      case 'advanced':
        return <Target className="size-5" />;
      case 'expert':
        return <Flame className="size-5" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'intermediate':
        return 'from-blue-500 to-cyan-500';
      case 'advanced':
        return 'from-purple-500 to-pink-500';
      case 'expert':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'intermediate':
        return '中級';
      case 'advanced':
        return '上級';
      case 'expert':
        return '超上級';
      default:
        return '';
    }
  };

  const groupedScenarios = {
    intermediate: scenarios.filter(s => s.difficulty === 'intermediate'),
    advanced: scenarios.filter(s => s.difficulty === 'advanced'),
    expert: scenarios.filter(s => s.difficulty === 'expert'),
  };

  if (scenarios.length === 0) {
    return <div className="p-8 text-center text-slate-500">シナリオが見つかりません</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg p-6">
        <h2 className="mb-2">上級クイズ</h2>
        <p className="text-indigo-100">
          複数のGitコマンドを組み合わせて、実際の開発シナリオに挑戦しましょう！
        </p>
      </div>

      {Object.entries(groupedScenarios).map(([difficulty, items]) => {
        if (items.length === 0) return null;

        return (
          <div key={difficulty}>
            <h3 className="text-slate-900 mb-4 flex items-center gap-2">
              {getDifficultyIcon(difficulty)}
              <span>{getDifficultyLabel(difficulty)}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className={`p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col ${completedScenarios.has(scenario.id)
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : 'bg-white'
                    }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-slate-900 flex-1">
                        {scenario.title}
                      </h4>
                      {completedScenarios.has(scenario.id) && (
                        <CheckCircle2 className="size-6 text-green-600 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                      {scenario.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`bg-gradient-to-r ${getDifficultyColor(scenario.difficulty)}`}>
                        {getDifficultyLabel(scenario.difficulty)}
                      </Badge>
                      <Badge variant="outline">
                        {scenario.tasks ? scenario.tasks.length : 0} ステップ
                      </Badge>
                    </div>

                    <Button
                      onClick={() => onSelectScenario(scenario)}
                      className={`w-full bg-gradient-to-r ${getDifficultyColor(scenario.difficulty)} hover:opacity-90 mt-auto`}
                    >
                      挑戦する
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
