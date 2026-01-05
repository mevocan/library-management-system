import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../../services/api';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await booksAPI.getAll();
            setBooks(response.data);
        } catch (err) {
            setError('Yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`"${title}" silinsin mi?`)) return;
        try {
            await booksAPI.delete(id);
            fetchBooks();
        } catch (err) {
            setError('Silinemedi');
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="bg-gradient-to-r from-primary to-blue-600 text-primary-content py-8">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">📚 Kitap Listesi</h1>
                        <p className="opacity-80">{books.length} kitap</p>
                    </div>
                    <Link to="/admin/books/new" className="btn btn-accent">
                        + Yeni Kitap
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {error && <div className="alert alert-error mb-6">{error}</div>}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : books.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body items-center text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold">Kitap yok</h3>
                            <p className="text-base-content/60">İlk kitabınızı ekleyin</p>
                            <Link to="/admin/books/new" className="btn btn-primary mt-4">
                                + Kitap Ekle
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Kitap</th>
                                    <th>Yazar</th>
                                    <th>Kategoriler</th>
                                    <th>Yıl</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {books.map((book) => (
                                    <tr key={book.id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-primary text-primary-content rounded-lg w-12">
                                                        <span className="text-xl">📖</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{book.title}</div>
                                                    <div className="text-xs opacity-50">{book.isbn}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{book.author?.name || '-'}</td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {book.categories?.slice(0, 2).map((cat) => (
                                                    <span key={cat.id} className="badge badge-outline badge-sm">{cat.name}</span>
                                                ))}
                                                {book.categories?.length > 2 && (
                                                    <span className="badge badge-ghost badge-sm">+{book.categories.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{book.publishedYear || '-'}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                <Link to={`/admin/books/edit/${book.id}`} className="btn btn-ghost btn-sm">✏️</Link>
                                                <button onClick={() => handleDelete(book.id, book.title)} className="btn btn-ghost btn-sm text-error">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookList;
