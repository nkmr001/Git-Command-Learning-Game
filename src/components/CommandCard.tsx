import { GitCommand } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, BookOpen, Play } from 'lucide-react';
import { motion } from 'motion/react';

type CommandCardProps = {
  command: GitCommand;
  isCompleted: boolean;
  quizPassed?: boolean;
  onSelect: () => void;
  onStartQuiz: () => void;
};

export function CommandCard({
  command,
  isCompleted,
  quizPassed,
  onSelect,
  onStartQuiz,
}: CommandCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${
        isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-white'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <code className="text-lg text-slate-900 bg-slate-100 px-3 py-1 rounded">
            {command.name}
          </code>
          {isCompleted && (
            <CheckCircle2 className="size-6 text-green-600 flex-shrink-0" />
          )}
        </div>
        
        <p className="text-slate-600 mb-4 line-clamp-2">
          {command.description}
        </p>

        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">{command.category}</Badge>
          {quizPassed !== undefined && (
            <Badge variant={quizPassed ? 'default' : 'destructive'}>
              {quizPassed ? 'クイズ合格' : 'クイズ不合格'}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSelect}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <BookOpen className="size-4 mr-2" />
            詳細を見る
          </Button>
          <Button
            onClick={onStartQuiz}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            size="sm"
          >
            <Play className="size-4 mr-2" />
            クイズ
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
