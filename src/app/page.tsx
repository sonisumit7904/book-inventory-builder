"use client";

import { useState, useEffect, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

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

type ActiveSection = "add" | "inventory";

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("add");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    const selectedFile = e.target.files?.[0];    if (selectedFile) {
      // Reset any previous states
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
      (droppedFile.type === "image/jpeg" || droppedFile.type === "image/png")    ) {
      // Reset any previous states
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

  const handleExtractDetails = async () => {    if (!file) return;

    setIsLoading(true);

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

      const extractedData: BookDetails = await response.json();      setBookDetails(extractedData);
      toast.success("Book details extracted successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "An error occurred while extracting details";
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

  const handleSaveBook = async () => {    if (!bookDetails) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookDetails),
      });      if (!response.ok) {
        throw new Error("Failed to save book to inventory");
      }

      await response.json();
      toast.success("Book saved successfully to inventory!");      // Refresh inventory after successful save
      await fetchInventory();

      // Reset form after successful save
      setTimeout(() => {
        setBookDetails(null);
        setImagePreview(null);
        setFile(null);
        // Switch to inventory view to show the newly added book
        setActiveSection("inventory");
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
  };  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Floating Book Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 transform rotate-12 opacity-10">
          <div className="w-12 h-16 bg-gradient-to-b from-amber-400 to-amber-600 rounded-sm shadow-lg"></div>
        </div>
        <div className="absolute top-40 right-20 transform -rotate-12 opacity-10">
          <div className="w-10 h-14 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-sm shadow-lg"></div>
        </div>
        <div className="absolute bottom-32 left-1/4 transform rotate-6 opacity-10">
          <div className="w-8 h-12 bg-gradient-to-b from-rose-400 to-rose-600 rounded-sm shadow-lg"></div>
        </div>
        <div className="absolute bottom-20 right-1/3 transform -rotate-6 opacity-10">
          <div className="w-14 h-18 bg-gradient-to-b from-blue-400 to-blue-600 rounded-sm shadow-lg"></div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-4">
            Book Inventory Builder
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Upload book cover images and let AI extract the details automatically with the power of machine learning
          </p>
        </div>

        {/* Top Section Selector - Modern Glassmorphism Design */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl border border-white/20 inline-flex">
            <button
              onClick={() => setActiveSection("add")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-500 ${
                activeSection === "add"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${activeSection === "add" ? "bg-white/20" : "bg-white/10"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-lg">Add Book</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection("inventory")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-500 ${
                activeSection === "inventory"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${activeSection === "inventory" ? "bg-white/20" : "bg-white/10"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-lg">My Collection</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold">{inventory.length}</span>
              </div>
            </button>
          </div>
        </div>        {/* Content Sections */}
        {activeSection === "add" ? (
          // ADD BOOK SECTION
          <div className="max-w-7xl mx-auto">
            <div className={`transition-all duration-700 ease-in-out ${bookDetails ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'max-w-2xl mx-auto'}`}>
              {/* Upload Component */}
              <div className={`transition-all duration-700 ${bookDetails ? 'lg:pr-4' : ''}`}>
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  {!bookDetails ? (
                    <>
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-3">Upload Book Cover</h2>
                        <p className="text-slate-300 text-lg">Select or drag & drop a book cover image to get started</p>
                      </div>

                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-white/30 rounded-2xl p-16 text-center cursor-pointer hover:border-purple-400 hover:bg-white/5 transition-all duration-500 group"
                        onClick={() => document.getElementById("fileInput")?.click()}
                      >
                        <input
                          type="file"
                          id="fileInput"
                          className="hidden"
                          accept="image/jpeg, image/png"
                          onChange={handleFileChange}
                        />
                        <div className="space-y-6">
                          <div className="mx-auto h-20 w-20 text-white/60 group-hover:text-purple-400 transition-colors duration-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-bold text-xl mb-2">Drop book cover here</p>
                            <p className="text-slate-300 text-lg">or click to browse files</p>
                          </div>
                          <div className="bg-white/10 rounded-xl p-4 inline-block">
                            <p className="text-sm text-slate-300">Supports JPG and PNG files up to 10MB</p>
                          </div>
                        </div>
                      </div>

                      {imagePreview && (
                        <div className="mt-8 space-y-6 animate-fadeIn">                          <div className="flex justify-center">
                            <div className="relative group">
                              <Image
                                src={imagePreview}
                                alt="Book cover preview"
                                width={288}
                                height={384}
                                className="max-w-72 max-h-96 rounded-2xl shadow-2xl border-4 border-white/20 transform group-hover:scale-105 transition-transform duration-300 object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          </div>
                          <button
                            onClick={handleExtractDetails}
                            disabled={!file || isLoading}
                            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105 disabled:scale-100"
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                <span>AI is analyzing cover...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <span>Extract Details with AI</span>
                              </div>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    // Compact Upload View
                    <>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Uploaded Cover</h3>
                        <p className="text-slate-300">Ready for verification</p>
                      </div>
                        <div className="flex justify-center mb-6">
                        <div className="relative group">
                          <Image
                            src={imagePreview!}
                            alt="Book cover preview"
                            width={224}
                            height={288}
                            className="max-w-56 max-h-72 rounded-xl shadow-xl border-2 border-white/20 transform group-hover:scale-105 transition-transform duration-300 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setBookDetails(null);
                          setImagePreview(null);
                          setFile(null);
                        }}
                        className="w-full px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Different Image</span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Verify Details Component - Slides in from right */}
              {bookDetails && (
                <div className="lg:pl-4 animate-slideInRight">
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-white">Verify Details</h3>
                      <div className="flex items-center space-x-3 bg-green-500/20 rounded-full px-4 py-2 border border-green-400/30">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-sm font-semibold">AI Extracted</span>
                      </div>
                    </div>

                    <form className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-white/90 mb-3">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={bookDetails.title}
                          onChange={(e) => handleFormChange("title", e.target.value)}
                          className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                          placeholder="Enter book title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-white/90 mb-3">
                          Author *
                        </label>
                        <input
                          type="text"
                          value={bookDetails.author}
                          onChange={(e) => handleFormChange("author", e.target.value)}
                          className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                          placeholder="Enter author name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-white/90 mb-3">
                          Grade Level
                        </label>
                        <input
                          type="text"
                          value={bookDetails.gradeLevel}
                          onChange={(e) => handleFormChange("gradeLevel", e.target.value)}
                          className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                          placeholder="e.g., Grades 3-5, Ages 8-12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-white/90 mb-3">
                          Subject/Genre
                        </label>
                        <input
                          type="text"
                          value={bookDetails.subject}
                          onChange={(e) => handleFormChange("subject", e.target.value)}
                          className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                          placeholder="e.g., Fantasy, Science, History"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-white/90 mb-3">
                          Series
                        </label>
                        <input
                          type="text"
                          value={bookDetails.series}
                          onChange={(e) => handleFormChange("series", e.target.value)}
                          className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                          placeholder="Enter series name if applicable"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveBook}
                        disabled={isSaving || !bookDetails.title || !bookDetails.author}
                        className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105 disabled:scale-100"
                      >
                        {isSaving ? (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            <span>Saving to Collection...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>Save to Collection</span>
                          </div>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>        ) : (
          // INVENTORY SECTION
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">My Book Collection</h2>
                <p className="text-slate-300 text-xl">Explore and manage your digital library</p>
              </div>
              {!isLoadingInventory && inventory.length > 0 && (
                <div className="text-center bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <p className="text-3xl font-bold text-white">{inventory.length}</p>
                  <p className="text-slate-300 text-sm font-medium">Total Books</p>
                </div>
              )}
            </div>

            {/* Search Bar */}
            {!isLoadingInventory && inventory.length > 0 && (
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white/50 text-white backdrop-blur-sm"
                />
              </div>
            )}

            {/* Inventory Content */}
            {isLoadingInventory ? (
              <div className="flex items-center justify-center py-20">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>
                    <p className="text-white text-xl">Loading your collection...</p>
                  </div>
                </div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-20 text-center">
                <div className="space-y-8">
                  <div className="mx-auto h-24 w-24 text-white/40">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-4">Start Building Your Collection</h3>
                    <p className="text-slate-300 text-xl mb-8">Upload your first book cover to get started!</p>
                    <button
                      onClick={() => setActiveSection("add")}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span>Add Your First Book</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-20 text-center">
                <div className="space-y-8">
                  <div className="mx-auto h-24 w-24 text-white/40">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-4">No Books Found</h3>
                    <p className="text-slate-300 text-xl mb-8">Try adjusting your search term</p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredInventory.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-500 hover:shadow-purple-500/25 hover:-translate-y-3 border border-white/20 p-6 group hover:bg-white/20"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-xl text-white line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">
                          {highlightText(book.title, searchTerm)}
                        </h3>
                        <p className="text-slate-300 mt-2 text-lg">
                          by {highlightText(book.author, searchTerm)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {book.subject && (
                          <div>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getSubjectTagColors(book.subject)} backdrop-blur-sm`}>
                              {book.subject}
                            </span>
                          </div>
                        )}

                        {book.gradeLevel && (
                          <p className="text-slate-300 text-sm">
                            <span className="font-bold text-white">Grade:</span> {book.gradeLevel}
                          </p>
                        )}

                        {book.series && (
                          <p className="text-slate-300 text-sm">
                            <span className="font-bold text-white">Series:</span> {book.series}
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 pt-4 border-t border-white/20">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Added {new Date(book.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
