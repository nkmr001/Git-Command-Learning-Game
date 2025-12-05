import { GitCommand } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Terminal, Lightbulb, BookOpen, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

type CommandDetailProps = {
  command: GitCommand;
  onStartQuiz: () => void;
  isCompleted: boolean;
};

export function CommandDetail({ command, onStartQuiz, isCompleted }: CommandDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <code className="text-2xl text-slate-900 bg-slate-100 px-4 py-2 rounded-lg">
                {command.name}
              </code>
              {isCompleted && (
                <CheckCircle2 className="size-8 text-green-600" />
              )}
            </div>
            <Badge className="mt-2">{command.category}</Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-slate-900 mb-2 flex items-center gap-2">
              <BookOpen className="size-5" />
              説明
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {command.description}
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 mb-2 flex items-center gap-2">
              <Terminal className="size-5" />
              構文
            </h3>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg">
              <code>{command.syntax}</code>
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <Terminal className="size-5" />
              使用例
            </h3>
            <div className="space-y-3">
              {command.examples.map((example, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="bg-slate-900 text-green-400 p-3 rounded mb-2">
                    <code>{example.code}</code>
                  </div>
                  <p className="text-slate-600 text-sm">
                    {example.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="size-5 text-yellow-600" />
              ポイント
            </h3>
            <ul className="space-y-2">
              {command.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700">
                  <span className="text-yellow-600 mt-1">●</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <Button
              onClick={onStartQuiz}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              size="lg"
            >
              <Play className="size-5 mr-2" />
              クイズに挑戦して理解度をチェック
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
