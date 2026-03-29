export interface BookWithStats {
    id: string;
    title: string;
    author: string;
    category: string;
    status: 'Available' | 'Issued' | 'Reserved';
    coverUrl: string;
    rating?: number;
    views?: number;
    createdAt?: string;
    updatedAt?: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const LibraryService = {
    getBooks: async (filters?: { search?: string; category?: string; status?: string }) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.status) params.append('status', filters.status);

        const response = await fetch(`${API_BASE_URL}/library/books?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch books');
        return response.json();
    },

    getCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/library/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/library/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    updateBookViews: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/library/books/${id}/views`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to update views');
        return response.json();
    },

    reserveBook: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/library/books/${id}/reserve`, {
            method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to reserve book');
        return response.json();
    },

    getBookById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/library/books/${id}`);
        if (!response.ok) throw new Error('Failed to fetch book');
        return response.json();
    }
};
