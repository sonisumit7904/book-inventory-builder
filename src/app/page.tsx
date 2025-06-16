"use client";

import { useState, ChangeEvent, DragEvent } from "react";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setImagePreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Book Inventory Builder</h1>

      <div className="w-full max-w-lg">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
          />
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-gray-500 text-lg">
              Drag & drop a book cover here, or click to select
            </p>
            <p className="text-gray-400 text-sm">
              Supports JPG and PNG files
            </p>
          </div>
        </div>

        {imagePreview && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Image Preview</h2>
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="Book cover preview"
                className="max-w-xs max-h-80 rounded-lg shadow-lg border border-gray-200"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
