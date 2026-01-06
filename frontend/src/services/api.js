import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

// Books API
export const booksAPI = {
    getAll: () => api.get('/books'),
    getOne: (id) => api.get(`/books/${id}`),
    search: (query) => api.get(`/books/search?q=${query}`),
    filter: (filters) => {
        const params = new URLSearchParams();
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.authorId) params.append('authorId', filters.authorId);
        if (filters.yearFrom) params.append('yearFrom', filters.yearFrom);
        if (filters.yearTo) params.append('yearTo', filters.yearTo);
        if (filters.minRating) params.append('minRating', filters.minRating);
        if (filters.search) params.append('search', filters.search);
        return api.get(`/books/filter?${params.toString()}`);
    },
    getStats: () => api.get('/books/stats'),
    create: (data) => api.post('/books', data),
    update: (id, data) => api.put(`/books/${id}`, data),
    delete: (id) => api.delete(`/books/${id}`),
};

// Authors API
export const authorsAPI = {
    getAll: () => api.get('/authors'),
    getOne: (id) => api.get(`/authors/${id}`),
    create: (data) => api.post('/authors', data),
    update: (id, data) => api.put(`/authors/${id}`, data),
    delete: (id) => api.delete(`/authors/${id}`),
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getOne: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Favorites API
export const favoritesAPI = {
    getMyFavorites: () => api.get('/favorites'),
    addToFavorites: (bookId) => api.post(`/favorites/${bookId}`),
    removeFromFavorites: (bookId) => api.delete(`/favorites/${bookId}`),
    checkFavorite: (bookId) => api.get(`/favorites/check/${bookId}`),
};

// Borrowings API
export const borrowingsAPI = {
    create: (data) => api.post('/borrowings', data),
    getMyBorrowings: () => api.get('/borrowings/my'),
    getAll: () => api.get('/borrowings'),
    getOne: (id) => api.get(`/borrowings/${id}`),
    getAvailability: (bookId) => api.get(`/borrowings/availability/${bookId}`),
    getBookBorrowings: (bookId) => api.get(`/borrowings/book/${bookId}`),
    updateStatus: (id, data) => api.put(`/borrowings/${id}/status`, data),
    cancel: (id) => api.put(`/borrowings/${id}/cancel`),
};

// Read Books API
export const readBooksAPI = {
    getMyReadBooks: () => api.get('/read-books'),
    getStats: () => api.get('/read-books/stats'),
    checkRead: (bookId) => api.get(`/read-books/check/${bookId}`),
    getBookRating: (bookId) => api.get(`/read-books/rating/${bookId}`),
    getBookReviews: (bookId) => api.get(`/read-books/reviews/${bookId}`),
    markAsRead: (data) => api.post('/read-books', data),
    update: (bookId, data) => api.put(`/read-books/${bookId}`, data),
    remove: (bookId) => api.delete(`/read-books/${bookId}`),
};

// Want To Read API
export const wantToReadAPI = {
    getMyList: () => api.get('/want-to-read'),
    getCount: () => api.get('/want-to-read/count'),
    checkInList: (bookId) => api.get(`/want-to-read/check/${bookId}`),
    addToList: (data) => api.post('/want-to-read', data),
    update: (bookId, data) => api.put(`/want-to-read/${bookId}`, data),
    remove: (bookId) => api.delete(`/want-to-read/${bookId}`),
};

// Notifications API
export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    deleteAll: () => api.delete('/notifications'),
};
export default api;
