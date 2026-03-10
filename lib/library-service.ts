import { prisma } from './database';

export interface BookWithStats {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'Available' | 'Issued' | 'Reserved';
  coverUrl: string;
  rating?: number;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LibraryService {
  // Get all books with optional filtering
  static async getBooks(filters?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<BookWithStats[]> {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return books.map(book => ({
      ...book,
      views: book.views || 0,
      rating: book.rating || 0
    }));
  }

  // Get book statistics
  static async getBookStats() {
    const totalBooks = await prisma.book.count();
    const availableBooks = await prisma.book.count({ where: { status: 'Available' } });
    const issuedBooks = await prisma.book.count({ where: { status: 'Issued' } });
    const reservedBooks = await prisma.book.count({ where: { status: 'Reserved' } });

    // Get average rating
    const books = await prisma.book.findMany({
      select: { rating: true }
    });
    const avgRating = books.length > 0 
      ? (books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.length).toFixed(1)
      : '0.0';

    return {
      totalBooks,
      availableBooks,
      issuedBooks,
      reservedBooks,
      avgRating
    };
  }

  // Get unique categories
  static async getCategories(): Promise<string[]> {
    const books = await prisma.book.findMany({
      select: { category: true },
      distinct: ['category']
    });
    
    const categories = books.map(book => book.category);
    return ['all', ...categories];
  }

  // Update book views when clicked
  static async updateBookViews(bookId: string): Promise<void> {
    await prisma.book.update({
      where: { id: bookId },
      data: {
        views: {
          increment: 1
        }
      }
    });
  }

  // Reserve a book (update status)
  static async reserveBook(bookId: string): Promise<BookWithStats | null> {
    try {
      const book = await prisma.book.update({
        where: { id: bookId },
        data: { status: 'Reserved' }
      });
      
      return {
        ...book,
        views: book.views || 0,
        rating: book.rating || 0
      };
    } catch (error) {
      console.error('Error reserving book:', error);
      return null;
    }
  }

  // Get a single book by ID
  static async getBookById(bookId: string): Promise<BookWithStats | null> {
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) return null;

    return {
      ...book,
      views: book.views || 0,
      rating: book.rating || 0
    };
  }
}
