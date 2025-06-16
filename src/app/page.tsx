"use client";

import { useState, ChangeEvent, DragEvent, useEffect } from "react";

// TypeScript interface for book details
interface BookDetails {
  title: string;
  author: string;
  gradeLevel: string;
  subject: string;
  series: string;
}

// TypeScript interface for book with database fields
interface Book extends BookDetails {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Book[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(true);

  // Fetch inventory function
  const fetchInventory = async () => {
    try {
      setIsLoadingInventory(true);
      const response = await fetch('/api/books');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const books: Book[] = await response.json();
      setInventory(books);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

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

  const handleExtractDetails = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSaveMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract book details');
      }

      const extractedData: BookDetails = await response.json();
      setBookDetails(extractedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while extracting details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: keyof BookDetails, value: string) => {
    if (bookDetails) {
      setBookDetails({
        ...bookDetails,
        [field]: value
      });
    }
  };

  const handleSaveBook = async () => {
    if (!bookDetails) return;

    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to save book to inventory');
      }

      const result = await response.json();
      setSaveMessage('Book saved successfully to inventory!');
      
      // Refresh inventory after successful save
      await fetchInventory();
      
      // Reset form after successful save
      setTimeout(() => {
        setBookDetails(null);
        setImagePreview(null);
        setFile(null);
        setSaveMessage(null);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the book');
    } finally {
      setIsSaving(false);
    }
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
            <div className="text-center mt-6">
              <button
                onClick={handleExtractDetails}
                disabled={!file || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? "Analyzing..." : "Extract Details"}
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-600 font-medium">AI is analyzing the image...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 text-center">
            <p className="text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </p>
          </div>
        )}

        {saveMessage && (
          <div className="mt-6 text-center">
            <p className="text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
              {saveMessage}
            </p>
          </div>
        )}

        {bookDetails && (
          <div className="mt-8 w-full">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Verify & Edit Details</h2>
            <form className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={bookDetails.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  value={bookDetails.author}
                  onChange={(e) => handleFormChange('author', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div>
                <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <input
                  type="text"
                  id="gradeLevel"
                  value={bookDetails.gradeLevel}
                  onChange={(e) => handleFormChange('gradeLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Grades 3-5, Ages 8-12"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject/Genre
                </label>
                <input
                  type="text"
                  id="subject"
                  value={bookDetails.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Fantasy, Science, History"
                />
              </div>

              <div>
                <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-1">
                  Series
                </label>
                <input
                  type="text"
                  id="series"
                  value={bookDetails.series}
                  onChange={(e) => handleFormChange('series', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter series name if applicable"
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSaveBook}
                  disabled={isSaving || !bookDetails.title || !bookDetails.author}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSaving ? "Saving to Inventory..." : "Save to Inventory"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Inventory Section */}
      <div className="w-full max-w-6xl mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Inventory</h2>
          <p className="text-gray-600">Your book collection</p>
        </div>

        {isLoadingInventory ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="space-y-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700">Your inventory is empty</h3>
              <p className="text-gray-500">Add a book to get started!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventory.map((book) => (
              <div key={book._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      by {book.author}
                    </p>
                  </div>
                  
                  {book.subject && (
                    <div className="flex items-center space-x-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {book.subject}
                      </span>
                    </div>
                  )}
                  
                  {book.gradeLevel && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Grade:</span> {book.gradeLevel}
                    </div>
                  )}
                  
                  {book.series && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Series:</span> {book.series}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    Added {new Date(book.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
