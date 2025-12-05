import { Progress } from './ui/progress';

type ProgressTrackerProps = {
  progress: number;
};

export function ProgressTracker({ progress }: ProgressTrackerProps) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-600">学習進捗</span>
        <span className="text-sm text-slate-900">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
