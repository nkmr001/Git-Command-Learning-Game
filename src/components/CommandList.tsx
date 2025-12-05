import { GitCommand } from '../App';
import { CommandCard } from './CommandCard';

type CommandListProps = {
  commands: GitCommand[];
  completedCommands: Set<string>;
  onSelectCommand: (command: GitCommand) => void;
  onStartQuiz: (command: GitCommand) => void;
  quizResults: Record<string, boolean>;
};

export function CommandList({
  commands,
  completedCommands,
  onSelectCommand,
  onStartQuiz,
  quizResults,
}: CommandListProps) {
  const categories = Array.from(new Set(commands.map(cmd => cmd.category)));

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category}>
          <h2 className="text-slate-900 mb-4 flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm">
              {category}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commands
              .filter(cmd => cmd.category === category)
              .map(command => (
                <CommandCard
                  key={command.id}
                  command={command}
                  isCompleted={completedCommands.has(command.id)}
                  quizPassed={quizResults[command.id]}
                  onSelect={() => onSelectCommand(command)}
                  onStartQuiz={() => onStartQuiz(command)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
