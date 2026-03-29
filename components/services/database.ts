const API_BASE_URL = '/api';

export const db = {
    notices: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/notices`);
            if (!response.ok) throw new Error('Failed to fetch notices');
            return response.json();
        },
        add: async (notice: any) => {
            const response = await fetch(`${API_BASE_URL}/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notice),
            });
            if (!response.ok) throw new Error('Failed to add notice');
            return response.json();
        },
        update: async (id: string, notice: any) => {
            const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notice),
            });
            if (!response.ok) throw new Error('Failed to update notice');
            return response.json();
        },
        delete: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete notice');
            return response.json();
        }
    }
};
