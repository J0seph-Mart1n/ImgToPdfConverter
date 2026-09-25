'use client';

import React, { useState, useRef, useCallback } from 'react';
import FileUploader from '@/components/FileUploader';
import ProcessingLoader from '@/components/ProcessingLoader';
import { Sparkles, Key, Wand2 } from 'lucide-react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startProcessing = useCallback(() => {
    setIsFinished(false);
    setIsProcessing(true);

    // Mock: simulate AI processing time
    timeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
      setIsFinished(true);
    }, 6000);
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
  }, []);

  const handleFileClear = useCallback(() => {
    setFile(null);
  }, []);

  const handleDownload = useCallback(() => {
    alert("PDF download will start here once backend is connected!");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFile(null);
    setIsFinished(false);
    setIsProcessing(false);
  }, []);

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

        <div className="w-full max-w-2xl mb-8 fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
              <Key size={18} />
            </div>
            <input
              type="password"
              placeholder="Enter your API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl glass dark:glass-dark border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 shadow-sm hover:shadow-md"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          {!isProcessing && !isFinished && (
            <>
              <FileUploader
                onFileSelect={handleFileSelect}
                onFileClear={handleFileClear}
                disabled={isProcessing}
              />
              
              {file && (
                <button
                  onClick={startProcessing}
                  className="mt-8 group flex items-center gap-3 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-500 text-white fade-in-up"
                >
                  <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                  <span>Convert to PDF</span>
                </button>
              )}
            </>
          )}
        </div>

        <ProcessingLoader
          isProcessing={isProcessing}
          isFinished={isFinished}
          onDownload={handleDownload}
        />

      </main>
    </div>
  );
}
