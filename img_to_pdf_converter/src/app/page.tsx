'use client';

import React, { useState, useRef, useCallback } from 'react';
import FileUploader from '@/components/FileUploader';
import ProgressSteps, { Step } from '@/components/ProgressSteps';
import { Sparkles } from 'lucide-react';

const INITIAL_STEPS: Step[] = [
  { id: 'analyze', label: 'AI Analysis', status: 'idle' },
  { id: 'html', label: 'Generate HTML', status: 'idle' },
  { id: 'pdf', label: 'Create PDF', status: 'idle' },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const updateStep = useCallback((index: number, status: 'idle' | 'loading' | 'completed') => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
  }, []);

  const startProcessing = useCallback(() => {
    clearAllTimeouts();

    // Reset to clean state first
    setSteps(INITIAL_STEPS);
    setIsFinished(false);
    setIsProcessing(true);

    // Use a small delay so the reset renders before animations start
    const t0 = setTimeout(() => {
      updateStep(0, 'loading');

      const t1 = setTimeout(() => {
        updateStep(0, 'completed');
        updateStep(1, 'loading');

        const t2 = setTimeout(() => {
          updateStep(1, 'completed');
          updateStep(2, 'loading');

          const t3 = setTimeout(() => {
            updateStep(2, 'completed');

            const t4 = setTimeout(() => {
              setIsFinished(true);
              setIsProcessing(false);
            }, 500);
            timeoutsRef.current.push(t4);
          }, 2500);
          timeoutsRef.current.push(t3);
        }, 3000);
        timeoutsRef.current.push(t2);
      }, 2000);
      timeoutsRef.current.push(t1);
    }, 50);
    timeoutsRef.current.push(t0);
  }, [clearAllTimeouts, updateStep]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    startProcessing();
  }, [startProcessing]);

  const handleDownload = useCallback(() => {
    alert("PDF download will start here once backend is connected!");
    clearAllTimeouts();
    setFile(null);
    setIsFinished(false);
    setIsProcessing(false);
    setSteps(INITIAL_STEPS);
  }, [clearAllTimeouts]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Animated Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400/30 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />

      <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

        <div className="text-center mb-12 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6 ring-1 ring-blue-500/20">
            <Sparkles size={16} />
            <span>AI-Powered Converter</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6">
            Image to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">PDF Magic</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Upload any design or document image. Our AI will analyze the styling and text, generate pixel-perfect HTML, and export it as a clean PDF.
          </p>
        </div>

        <div className="w-full">
          {(!file || isProcessing) && (
             <FileUploader
               onFileSelect={handleFileSelect}
               disabled={isProcessing}
             />
          )}
        </div>

        {(isProcessing || isFinished) && (
          <div className="w-full mt-4 fade-in-up">
            <ProgressSteps
              steps={steps}
              isFinished={isFinished}
              onDownload={handleDownload}
            />
          </div>
        )}

      </main>
    </div>
  );
}
