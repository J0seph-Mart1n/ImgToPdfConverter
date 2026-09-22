'use client';

import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploader({ onFileSelect, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelect(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-[300px] cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-xl shadow-blue-500/20' : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 hover:bg-black/5 dark:hover:bg-white/5'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          glass dark:glass-dark
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
          disabled={disabled}
        />

        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center fade-in">
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[250px] rounded-lg shadow-lg object-contain transition-transform group-hover:scale-105"
              />
              {!disabled && (
                <button
                  onClick={clearFile}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-xs">
              {selectedFile?.name}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4 fade-in">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
              <UploadCloud size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1 text-neutral-800 dark:text-neutral-200">
                Upload your design
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[250px] mx-auto">
                Drag and drop an image file here, or click to browse.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full mt-4">
              <FileImage size={14} />
              <span>PNG, JPG, WEBP up to 10MB</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
