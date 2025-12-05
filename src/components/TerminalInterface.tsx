import React, { useRef, useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type TerminalHistoryItem = {
  command: string;
  result: string;
  isError: boolean;
};

type TerminalInterfaceProps = {
  history: TerminalHistoryItem[];
  onCommand: (command: string) => void;
  onReset?: () => void;
  isCompleted?: boolean;
  placeholder?: string;
  showHint?: boolean;
  hintContent?: React.ReactNode;
  onToggleHint?: () => void;
};

export function TerminalInterface({
  history,
  onCommand,
  onReset,
  isCompleted = false,
  placeholder = "gitコマンドを入力...",
  showHint = false,
  hintContent,
  onToggleHint
}: TerminalInterfaceProps) {
  const [currentCommand, setCurrentCommand] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (!isCompleted) {
      inputRef.current?.focus();
    }
  }, [history, isCompleted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;
    onCommand(currentCommand);
    setCurrentCommand('');
  };

  return (
    <Card className="bg-slate-950 border-slate-800 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-red-500" />
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
          <span className="text-slate-300 text-sm ml-4">bash</span>
        </div>
        <div className="flex gap-2">
          {onToggleHint && (
            <Button
              onClick={onToggleHint}
              size="sm"
              variant="ghost"
              className="text-slate-300 hover:text-white"
            >
              {showHint ? 'ヒントを隠す' : 'ヒント'}
            </Button>
          )}
          {onReset && (
            <Button
              onClick={onReset}
              size="sm"
              variant="ghost"
              className="text-slate-300 hover:text-white"
            >
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto font-mono text-sm" onClick={() => inputRef.current?.focus()}>
        <div className="text-green-400 mb-4">
          $ ターミナルシミュレーター - Gitコマンドを実行してみよう！
        </div>

        <AnimatePresence mode="popLayout">
          {history.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 text-blue-400">
                <span className="text-green-400">$</span>
                <span>{entry.command}</span>
              </div>
              <div className={`ml-4 mt-1 ${entry.isError ? 'text-red-400' : 'text-slate-300'} whitespace-pre-wrap`}>
                {entry.result}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {hintContent && (
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                {hintContent}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            className="flex-1 bg-transparent text-blue-400 outline-none"
            placeholder={placeholder}
            disabled={isCompleted}
            autoComplete="off"
            spellCheck="false"
          />
        </form>

        <div ref={terminalEndRef} />
      </div>
    </Card>
  );
}
