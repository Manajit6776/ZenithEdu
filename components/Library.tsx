import React, { useState, useEffect, useMemo } from 'react';
import { Search, Book, Clock, Filter, CheckCircle, AlertCircle, Download, ChevronLeft, ChevronRight, Loader2, Star, TrendingUp, Eye, BookOpen, X } from 'lucide-react';
import { Book as BookType } from '../src/types';
import { useLanguage } from '../contexts/LanguageContext';
import { LibraryService, BookWithStats } from '../lib/library-api-service';

const ITEMS_PER_PAGE = 8;

export const Library: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<BookWithStats[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'views' | 'title'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookWithStats | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Load books and categories from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [booksData, categoriesData] = await Promise.all([
          LibraryService.getBooks(),
          LibraryService.getCategories()
        ]);
        setBooks(booksData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading library data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load filtered books when filters change
  useEffect(() => {
    const loadFilteredBooks = async () => {
      try {
        setLoading(true);
        const booksData = await LibraryService.getBooks({
          search: searchTerm,
          category: selectedCategory,
          status: selectedStatus
        });
        setBooks(booksData);
      } catch (error) {
        console.error('Error loading filtered books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') {
      loadFilteredBooks();
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Apply filters and sorting
  const filteredBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Relevance sorting based on search term
        if (searchTerm) {
          filtered.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
            const bTitleMatch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
            return bTitleMatch ? 1 : -1;
          });
        }
    }

    return filtered;
  }, [books, searchTerm, selectedCategory, selectedStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  // Calculate statistics
  const stats = useMemo(() => {
    const availableBooks = books.filter(book => book.status === 'Available').length;
    const checkedOutBooks = books.filter(book => book.status === 'Issued').length;
    const totalBooks = books.length;
    const avgRating = (books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.length).toFixed(1);

    return { availableBooks, checkedOutBooks, totalBooks, avgRating };
  }, [books]);

  // Simulate loading for better UX feedback
  useEffect(() => {
    if (searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Handle book selection for details
  const handleBookClick = async (book: BookWithStats) => {
    setSelectedBook(book);
    setShowDetailsModal(true);

    // Update views in database
    await LibraryService.updateBookViews(book.id);

    // Update local book views
    setBooks(prev => prev.map(b =>
      b.id === book.id ? { ...b, views: (b.views || 0) + 1 } : b
    ));

    // Add to recently viewed
    setRecentlyViewed(prev => {
      const newList = [book.id, ...prev.filter(id => id !== book.id)].slice(0, 5);
      return newList;
    });
  };

  const handleReserve = async (bookId: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmReserve = window.confirm(t('confirmReserveBook', { title }));
    if (confirmReserve) {
      try {
        const updatedBook = await LibraryService.reserveBook(bookId);
        if (updatedBook) {
          // Update local state
          setBooks(prev => prev.map(book =>
            book.id === bookId ? updatedBook : book
          ));
          alert(t('bookReserved', { title }));
        } else {
          alert('Failed to reserve book. Please try again.');
        }
      } catch (error) {
        console.error('Error reserving book:', error);
        alert('Failed to reserve book. Please try again.');
      }
    }
  };

  const handleDownload = (title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    alert(`Downloading ${title}...`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-rose-800 dark:text-white tracking-tight uppercase">{t('library')}</h1>
            <p className="text-[11px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">
              Discover knowledge through our curated collection of books, journals, and academic resources
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-200 dark:shadow-indigo-900/40">
            <BookOpen className="w-4 h-4" />
            My Reading List
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="bg-white/40 dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-rose-100 dark:border-white/5 backdrop-blur-xl shadow-2xl shadow-rose-900/5 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-rose-400 dark:text-slate-500 transition-all group-focus-within:text-rose-600 dark:group-focus-within:text-indigo-400 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="SEARCH ARCHIVES..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/50 dark:bg-slate-950/50 text-rose-950 dark:text-white border border-rose-100 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-indigo-500/10 transition-all text-[10px] font-black uppercase tracking-widest placeholder:text-rose-200 dark:placeholder-slate-600 shadow-inner"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 bg-white/50 dark:bg-slate-950/50 border border-rose-100 dark:border-white/10 text-rose-950 dark:text-white rounded-2xl py-4 px-6 focus:outline-none focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-indigo-500/10 transition-all text-[10px] font-black uppercase tracking-widest shadow-inner cursor-pointer"
            >
              <option value="relevance">RELEVANCE VECTOR</option>
              <option value="rating">POPULARITY RANK</option>
              <option value="views">TRAFFIC VOLUME</option>
              <option value="title">ALPHABETICAL</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-rose-400 dark:text-slate-500" />
            <span className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest">Protocol Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[['all', 'ALL UNITS'], ...categories.slice(0, 6).filter(c => c !== 'all').map(c => [c, c.toUpperCase()])].map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedCategory(id);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCategory === id
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 text-white border-transparent shadow-xl shadow-rose-200 dark:shadow-indigo-900/40'
                  : 'bg-white/40 dark:bg-slate-950/40 text-rose-950 dark:text-slate-300 border-rose-100 dark:border-white/5 hover:bg-rose-50 dark:hover:bg-white/5'
                  }`}
              >
                {label}
              </button>
            ))}

            <div className="h-4 w-px bg-rose-100 dark:bg-white/10 mx-2 self-center hidden md:block" />

            {[['all', 'ALL STATUS'], ['Available', 'AVAILABLE'], ['Issued', 'RESERVED']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedStatus(id);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedStatus === id
                  ? id === 'Available' ? 'bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20' : 
                    id === 'Issued' ? 'bg-amber-500 text-white border-transparent shadow-lg shadow-amber-500/20' :
                    'bg-rose-600 dark:bg-indigo-600 text-white border-transparent'
                  : 'bg-white/40 dark:bg-slate-950/40 text-rose-950 dark:text-slate-300 border-rose-100 dark:border-white/5 hover:bg-rose-50'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {[
            { label: 'ARCHIVE DENSITY', value: stats.totalBooks, icon: Book },
            { label: 'ACTIVE LINK', value: stats.availableBooks, icon: CheckCircle },
            { label: 'CRITICAL RATING', value: stats.avgRating, icon: Star },
            { label: 'VECTOR MATCHES', value: filteredBooks.length, icon: TrendingUp },
          ].map((item, i) => (
            <div key={i} className="bg-white/50 dark:bg-slate-950/50 border border-rose-100 dark:border-white/10 rounded-2xl p-6 transition-all hover:scale-105 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</span>
                <item.icon className="w-4 h-4 text-rose-500 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="text-3xl font-black text-rose-950 dark:text-white tabular-nums">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-rose-800 dark:text-white">Featured Collection</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              Showing {paginatedBooks.length} of {filteredBooks.length} books
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Back to Top
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Searching books...</p>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No books found</h4>
            <p className="text-slate-400">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Book Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {paginatedBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="group bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-100 dark:border-white/5 rounded-[2rem] p-5 hover:border-rose-400 dark:hover:border-indigo-500 hover:bg-white/60 dark:hover:bg-slate-800/80 transition-all duration-500 cursor-pointer transform hover:-translate-y-3 shadow-2xl shadow-rose-900/5 dark:shadow-indigo-900/20"
                >
                  <div className="flex flex-col h-full">
                    {/* Book Cover */}
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 shadow-lg shadow-black/20 group-hover:shadow-2xl transition-all">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-rose-900 to-indigo-900 flex items-center justify-center"><svg class="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>`;
                        }}
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl flex items-center gap-1.5 border border-white/10">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span className="text-[10px] font-black text-white">{book.rating}</span>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1">
                      <h4 className="font-black text-rose-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 line-clamp-2 text-base leading-tight uppercase tracking-tight mb-2 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[10px] font-black text-rose-400 dark:text-slate-500 mb-4 line-clamp-1 uppercase tracking-widest">{book.author}</p>

                      <div className="flex items-center justify-between mb-6">
                         <span className={`text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border transition-all ${book.status === 'Available'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                          {book.status}
                        </span>
                        <div className="flex items-center text-[9px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest">
                          <Eye className="w-4 h-4 mr-1.5" />
                          {book.views?.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto">
                        <button
                          onClick={(e) => handleReserve(book.id, book.title, e)}
                          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${book.status === 'Available'
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-600 text-white shadow-lg shadow-rose-200 dark:shadow-indigo-900/20'
                            : 'bg-white/40 dark:bg-white/5 border border-rose-100 dark:border-white/10 text-rose-800 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-white/10'
                            }`}
                        >
                          {book.status === 'Available' ? 'Acquire' : 'Reserve'}
                        </button>
                        <button
                          onClick={(e) => handleDownload(book.title, e)}
                          className="w-10 h-10 flex items-center justify-center bg-rose-500/10 dark:bg-indigo-500/10 border border-rose-100 dark:border-white/5 rounded-xl text-rose-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-all"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <span className="text-sm text-slate-400 ml-4">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <div className="bg-white/40 dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-rose-100 dark:border-white/5 backdrop-blur-xl shadow-2xl shadow-rose-900/5 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-rose-500 dark:text-indigo-400" />
            <h3 className="text-[10px] font-black text-rose-950 dark:text-white uppercase tracking-[0.2em]">Recently Synchronized</h3>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-slate-700">
            {recentlyViewed.slice(0, 5).map(bookId => {
              const book = books.find(b => b.id === bookId);
              if (!book) return null;

              return (
                <div
                  key={bookId}
                  onClick={() => handleBookClick(book)}
                  className="flex-shrink-0 w-56 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border border-rose-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-rose-400 dark:hover:border-indigo-500 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="w-full h-28 overflow-hidden relative">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-rose-900 to-indigo-900 flex items-center justify-center"><svg class="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>`;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-black text-rose-950 dark:text-white text-[11px] line-clamp-1 uppercase tracking-tight group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">{book.title}</h4>
                    <p className="text-[9px] font-black text-rose-400 dark:text-slate-500 mt-1 uppercase tracking-widest">{book.author}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                      <span className="text-[10px] font-black text-rose-950 dark:text-slate-300">{book.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {showDetailsModal && selectedBook && (
        <div className="fixed inset-0 bg-rose-950/60 dark:bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="bg-white/80 dark:bg-slate-900/80 border border-rose-100 dark:border-white/10 rounded-[3rem] max-w-2xl w-full shadow-2xl overflow-hidden relative backdrop-blur-3xl animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 dark:from-indigo-500 dark:via-violet-500 dark:to-indigo-600"></div>

            <div className="p-12">
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-3xl font-black text-rose-950 dark:text-white uppercase tracking-tighter leading-none">{selectedBook.title}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-12 h-12 flex items-center justify-center bg-rose-500/10 dark:bg-indigo-500/10 rounded-2xl text-rose-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-1">
                  <div className="w-full h-72 rounded-2xl overflow-hidden shadow-2xl relative group">
                    <img
                      src={selectedBook.coverUrl}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-rose-900 to-indigo-900 flex items-center justify-center"><svg class="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>`;
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-1">Lead Scientist / Author</h4>
                      <p className="text-rose-950 dark:text-white font-black text-lg uppercase tracking-tight">{selectedBook.author}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Dataset Category</h4>
                        <span className="px-4 py-1.5 bg-rose-500/10 text-rose-600 dark:text-indigo-400 border border-rose-100 dark:border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {selectedBook.category}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Availability Protocol</h4>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${selectedBook.status === 'Available'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}>
                          {selectedBook.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Public Rating</h4>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="text-rose-950 dark:text-white font-black tabular-nums">{selectedBook.rating} / 5.0</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Synapse Traffic</h4>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-rose-400 dark:text-slate-500" />
                          <span className="text-rose-950 dark:text-white font-black tabular-nums">{selectedBook.views?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-rose-100 dark:border-white/10">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleReserve(selectedBook.id, selectedBook.title)}
                          className={`flex-1 py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${selectedBook.status === 'Available'
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-600 text-white shadow-rose-200 dark:shadow-indigo-900/40'
                            : 'bg-white/40 dark:bg-white/5 border border-rose-100 dark:border-white/10 text-rose-800 dark:text-slate-400'
                            }`}
                        >
                          {selectedBook.status === 'Available' ? 'Acquire Sync Link' : 'Join Delta Waitlist'}
                        </button>
                        <button
                          onClick={() => handleDownload(selectedBook.title)}
                          className="w-14 h-14 flex items-center justify-center bg-rose-500/5 dark:bg-indigo-500/5 border border-rose-100 dark:border-white/10 rounded-2xl text-rose-600 dark:text-indigo-400 hover:bg-rose-100 dark:hover:bg-white/10 transition-all shadow-sm"
                        >
                          <Download className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};