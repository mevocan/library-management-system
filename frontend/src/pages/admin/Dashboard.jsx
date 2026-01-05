import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, authorsAPI, categoriesAPI } from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({ books: 0, authors: 0, categories: 0 });
    const [recentBooks, setRecentBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [booksRes, authorsRes, categoriesRes] = await Promise.all([
                    booksAPI.getAll(),
                    authorsAPI.getAll(),
                    categoriesAPI.getAll(),
                ]);
                setStats({
                    books: booksRes.data.length,
                    authors: authorsRes.data.length,
                    categories: categoriesRes.data.length,
                });
                setRecentBooks(booksRes.data.slice(-5).reverse());
            } catch (error) {
                console.error('Veriler yüklenemedi:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="bg-neutral text-neutral-content py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold">🎛️ Admin Panel</h1>
                    <p className="opacity-70 mt-1">Kütüphane yönetim merkezi</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <span className="text-3xl">📚</span>
                        </div>
                        <div className="stat-title">Kitaplar</div>
                        <div className="stat-value text-primary">{stats.books}</div>
                        <div className="stat-desc">
                            <Link to="/admin/books" className="link link-primary">Tümünü gör →</Link>
                        </div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <span className="text-3xl">✍️</span>
                        </div>
                        <div className="stat-title">Yazarlar</div>
                        <div className="stat-value text-secondary">{stats.authors}</div>
                        <div className="stat-desc">
                            <Link to="/admin/authors" className="link link-secondary">Tümünü gör →</Link>
                        </div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-accent">
                            <span className="text-3xl">🏷️</span>
                        </div>
                        <div className="stat-title">Kategoriler</div>
                        <div className="stat-value text-accent">{stats.categories}</div>
                        <div className="stat-desc">
                            <Link to="/admin/categories" className="link link-accent">Tümünü gör →</Link>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">⚡ Hızlı İşlemler</h2>
                            <div className="space-y-3 mt-2">
                                <Link to="/admin/books/new" className="btn btn-primary btn-block justify-start gap-2">
                                    <span>📚</span> Yeni Kitap Ekle
                                </Link>
                                <Link to="/admin/authors" className="btn btn-secondary btn-block justify-start gap-2">
                                    <span>✍️</span> Yazar Yönetimi
                                </Link>
                                <Link to="/admin/categories" className="btn btn-accent btn-block justify-start gap-2">
                                    <span>🏷️</span> Kategori Yönetimi
                                </Link>
                                <Link to="/admin/books" className="btn btn-neutral btn-block justify-start gap-2">
                                    <span>📋</span> Kitap Listesi
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Books */}
                    <div className="lg:col-span-2 card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex justify-between items-center">
                                <h2 className="card-title">📖 Son Eklenen Kitaplar</h2>
                                <Link to="/admin/books" className="btn btn-ghost btn-sm">
                                    Tümü →
                                </Link>
                            </div>

                            {recentBooks.length === 0 ? (
                                <div className="text-center py-8 text-base-content/60">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p>Henüz kitap eklenmemiş</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>Kitap</th>
                                            <th>Yazar</th>
                                            <th>Kategoriler</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentBooks.map((book) => (
                                            <tr key={book.id} className="hover">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar placeholder">
                                                            <div className="bg-primary text-primary-content rounded-lg w-10">
                                                                <span>📖</span>
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
                                                            <span key={cat.id} className="badge badge-sm badge-outline">
                                  {cat.name}
                                </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
