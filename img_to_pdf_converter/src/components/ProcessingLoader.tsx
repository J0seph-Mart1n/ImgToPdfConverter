'use client';

import React from 'react';
import { Brain, Download } from 'lucide-react';

interface ProcessingLoaderProps {
  isProcessing: boolean;
  isFinished: boolean;
  onDownload?: () => void;
  pdfData?: string | null;
}

export default function ProcessingLoader({ isProcessing, isFinished, onDownload, pdfData }: ProcessingLoaderProps) {
  if (!isProcessing && !isFinished) return null;

  return (
    <div className={`w-full mx-auto mt-12 flex flex-col items-center gap-8 fade-in-up ${isFinished ? 'max-w-4xl' : 'max-w-md'}`}>
      {isProcessing && (
        <>
          {/* Orbital spinner */}
          <div className="relative w-28 h-28">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-neutral-200 dark:border-neutral-800" />
            {/* Spinning gradient arc */}
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
            {/* Inner pulsing icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-400/20 flex items-center justify-center animate-pulse">
                <Brain size={28} className="text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            {/* Orbiting dot */}
            <div className="absolute inset-[-4px] animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              AI is analyzing your image
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              Extracting text, layout, and design elements...
            </p>
            {/* Animated dots */}
            <div className="flex justify-center gap-1.5 pt-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </>
      )}

      {isFinished && (
        <div className="flex flex-col items-center w-full gap-6 fade-in-up">
          {/* Success checkmark */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="checkmark-path" />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Conversion complete!
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your PDF is ready to download
            </p>
          </div>

          <button
            onClick={onDownload}
            className="group flex items-center gap-3 px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
          >
            <Download size={20} className="group-hover:animate-bounce" />
            <span>Download PDF</span>
          </button>

          {pdfData && (
            <div className="w-full mt-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl bg-white">
              <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Document Preview</span>
              </div>
              <iframe
                src={`data:application/pdf;base64,${pdfData}#toolbar=0`}
                className="w-full h-[600px] border-none"
                title="PDF Preview"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
