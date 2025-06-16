"use client";

import { useState, ChangeEvent, DragEvent, useEffect } from "react";
import toast from "react-hot-toast";

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
  const [inventory, setInventory] = useState<Book[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch inventory function
  const fetchInventory = async () => {
    try {
      setIsLoadingInventory(true);
      const response = await fetch("/api/books");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const books: Book[] = await response.json();
      setInventory(books);
    } catch (err) {
      console.error("Error fetching inventory:", err);
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
      // Reset any previous states
      setError(null);
      setBookDetails(null);

      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (
      droppedFile &&
      (droppedFile.type === "image/jpeg" || droppedFile.type === "image/png")
    ) {
      // Reset any previous states
      setError(null);
      setBookDetails(null);

      setFile(droppedFile);
      setImagePreview(URL.createObjectURL(droppedFile));
    } else if (droppedFile) {
      toast.error("Please upload a valid JPG or PNG image file.");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleExtractDetails = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract book details");
      }

      const extractedData: BookDetails = await response.json();
      setBookDetails(extractedData);
      toast.success("Book details extracted successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "An error occurred while extracting details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: keyof BookDetails, value: string) => {
    if (bookDetails) {
      setBookDetails({
        ...bookDetails,
        [field]: value,
      });
    }
  };

  const handleSaveBook = async () => {
    if (!bookDetails) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to save book to inventory");
      }

      const result = await response.json();
      toast.success("Book saved successfully to inventory!");

      // Refresh inventory after successful save
      await fetchInventory();

      // Reset form after successful save
      setTimeout(() => {
        setBookDetails(null);
        setImagePreview(null);
        setFile(null);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "An error occurred while saving the book";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to highlight search terms
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Helper function to get subject tag colors
  const getSubjectTagColors = (subject: string) => {
    const colors: { [key: string]: string } = {
      Fantasy: "bg-purple-100 text-purple-800",
      Science: "bg-blue-100 text-blue-800",
      History: "bg-amber-100 text-amber-800",
      Mystery: "bg-gray-100 text-gray-800",
      Romance: "bg-pink-100 text-pink-800",
      Adventure: "bg-green-100 text-green-800",
      Fiction: "bg-indigo-100 text-indigo-800",
      Biography: "bg-orange-100 text-orange-800",
    };
    return colors[subject] || "bg-slate-100 text-slate-800";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT COLUMN - Action Panel */}
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-800">
                Book Inventory Builder
              </h1>
              <p className="text-slate-600">
                Upload book cover images and let AI extract the details automatically. 
                Build your digital library with ease.
              </p>
            </div>

            {/* File Uploader */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-colors"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  accept="image/jpeg, image/png"
                  onChange={handleFileChange}
                />
                <div className="space-y-3">
                  <div className="mx-auto h-12 w-12 text-slate-400">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">
                      Drop book cover here
                    </p>
                    <p className="text-slate-500 text-sm">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports JPG and PNG files
                  </p>
                </div>
              </div>

              {imagePreview && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Book cover preview"
                      className="max-w-48 max-h-64 rounded-lg shadow-md border border-slate-200"
                    />
                  </div>
                  <button
                    onClick={handleExtractDetails}
                    disabled={!file || isLoading}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Extract Details"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Verification Form */}
            {bookDetails && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Verify Details
                </h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={bookDetails.title}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter book title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={bookDetails.author}
                      onChange={(e) => handleFormChange("author", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter author name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Grade Level
                    </label>
                    <input
                      type="text"
                      value={bookDetails.gradeLevel}
                      onChange={(e) => handleFormChange("gradeLevel", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Grades 3-5, Ages 8-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Subject/Genre
                    </label>
                    <input
                      type="text"
                      value={bookDetails.subject}
                      onChange={(e) => handleFormChange("subject", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Fantasy, Science, History"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Series
                    </label>
                    <input
                      type="text"
                      value={bookDetails.series}
                      onChange={(e) => handleFormChange("series", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter series name if applicable"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveBook}
                    disabled={isSaving || !bookDetails.title || !bookDetails.author}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save to Inventory"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Inventory Panel */}
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">My Inventory</h2>
                <p className="text-slate-600">Your book collection</p>
              </div>
            </div>

            {/* Search Bar */}
            {!isLoadingInventory && inventory.length > 0 && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 text-slate-700"
                />
              </div>
            )}

            {/* Inventory Content */}
            {isLoadingInventory ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <p className="text-slate-600">Loading inventory...</p>
                </div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 text-slate-400">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700">
                    Your inventory is empty
                  </h3>
                  <p className="text-slate-500">Upload a book cover to get started!</p>
                </div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 text-slate-400">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700">
                    No books found
                  </h3>
                  <p className="text-slate-500">Try adjusting your search term</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-lg shadow-md transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-200 p-6"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-2 leading-tight">
                          {highlightText(book.title, searchTerm)}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">
                          by {highlightText(book.author, searchTerm)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {book.subject && (
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSubjectTagColors(book.subject)}`}>
                              {book.subject}
                            </span>
                          </div>
                        )}

                        {book.gradeLevel && (
                          <p className="text-sm text-slate-500">
                            <span className="font-medium">Grade:</span> {book.gradeLevel}
                          </p>
                        )}

                        {book.series && (
                          <p className="text-sm text-slate-500">
                            <span className="font-medium">Series:</span> {book.series}
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 pt-3 border-t border-slate-100">
                        Added {new Date(book.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
