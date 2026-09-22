'use client';

import React from 'react';
import { Brain, Code, FileText, CheckCircle2, Download } from 'lucide-react';

export type StepStatus = 'idle' | 'loading' | 'completed';

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

interface ProgressStepsProps {
  steps: Step[];
  onDownload?: () => void;
  isFinished?: boolean;
}

const getStepIcon = (index: number, status: StepStatus) => {
  if (status === 'completed') return <CheckCircle2 size={20} className="text-white" />;

  switch (index) {
    case 0: return <Brain size={20} className={status === 'loading' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'} />;
    case 1: return <Code size={20} className={status === 'loading' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'} />;
    case 2: return <FileText size={20} className={status === 'loading' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'} />;
    default: return <div className="w-5 h-5 rounded-full bg-neutral-300" />;
  }
};

export default function ProgressSteps({ steps, onDownload, isFinished }: ProgressStepsProps) {
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const loadingIndex = steps.findIndex(s => s.status === 'loading');
  // Progress: 0 = none, 0.5 = first loading, 1 = first done, 1.5 = second loading, etc.
  const progressFraction = (completedCount + (loadingIndex !== -1 ? 0.5 : 0)) / (steps.length - 1);
  const progressPercent = Math.min(100, Math.max(0, progressFraction * 100));

  return (
    <div className="w-full max-w-xl mx-auto mt-12 p-8 rounded-3xl glass dark:glass-dark shadow-2xl transition-all duration-500">
      <h3 className="text-lg font-semibold mb-8 text-center text-neutral-800 dark:text-neutral-200">
        Processing Magic
      </h3>

      <div className="relative flex justify-between items-start px-4">
        {/* Background track — spans between the centers of first and last step circles */}
        <div
          className="absolute h-0.5 bg-neutral-200 dark:bg-neutral-800"
          style={{ top: '24px', left: 'calc(12.5% + 12px)', right: 'calc(12.5% + 12px)' }}
        />

        {/* Active (blue) progress line */}
        <div
          className="absolute h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ease-in-out"
          style={{
            top: '24px',
            left: 'calc(12.5% + 12px)',
            width: `calc((100% - 25% - 24px) * ${progressPercent / 100})`,
          }}
        />

        {steps.map((step, idx) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center" style={{ width: '25%' }}>
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg
                ${step.status === 'completed'
                  ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 scale-100'
                  : step.status === 'loading'
                    ? 'bg-blue-500 scale-110 shadow-blue-500/40 animate-pulse'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 scale-90'
                }
              `}
            >
              {getStepIcon(idx, step.status)}
            </div>

            <div className="mt-4 text-center">
              <span className={`text-sm font-medium transition-colors duration-300 ${
                step.status === 'completed' ? 'text-blue-600 dark:text-blue-400' :
                step.status === 'loading' ? 'text-neutral-900 dark:text-neutral-100' :
                'text-neutral-500 dark:text-neutral-500'
              }`}>
                {step.label}
              </span>

              {step.status === 'loading' && (
                <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 animate-pulse">
                  Please wait...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isFinished && (
        <div className="mt-12 flex justify-center fade-in-up">
          <button
            onClick={onDownload}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
          >
            <Download size={20} className="group-hover:animate-bounce" />
            <span>Download PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}
