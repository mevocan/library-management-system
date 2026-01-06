import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI, borrowingsAPI, readBooksAPI, wantToReadAPI } from '../services/api';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('borrowings');
    const [favorites, setFavorites] = useState([]);
    const [borrowings, setBorrowings] = useState([]);
    const [readBooks, setReadBooks] = useState([]);
    const [wantToRead, setWantToRead] = useState([]);
    const [stats, setStats] = useState({ totalRead: 0, totalRated: 0, averageRating: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [favRes, borrowRes, readRes, statsRes, wtrRes] = await Promise.all([
                favoritesAPI.getMyFavorites().catch(() => ({ data: [] })),
                borrowingsAPI.getMyBorrowings().catch(() => ({ data: [] })),
                readBooksAPI.getMyReadBooks().catch(() => ({ data: [] })),
                readBooksAPI.getStats().catch(() => ({ data: { totalRead: 0, totalRated: 0, averageRating: 0 } })),
                wantToReadAPI.getMyList().catch(() => ({ data: [] })),
            ]);

            setFavorites(favRes.data);
            setBorrowings(borrowRes.data);
            setReadBooks(readRes.data);
            setStats(statsRes.data);
            setWantToRead(wtrRes.data);
        } catch (err) {
            console.error('Veri yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (bookId) => {
        try {
            await favoritesAPI.removeFromFavorites(bookId);
            setFavorites(favorites.filter((f) => f.bookId !== bookId));
        } catch (err) {
            console.error('Silinemedi:', err);
        }
    };

    const cancelBorrowing = async (id) => {
        if (!window.confirm('İptal etmek istediğinize emin misiniz?')) return;
        try {
            await borrowingsAPI.cancel(id);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'İptal edilemedi');
        }
    };

    const removeFromRead = async (bookId) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await readBooksAPI.remove(bookId);
            setReadBooks(readBooks.filter((r) => r.bookId !== bookId));
            fetchData();
        } catch (err) {
            console.error('Silinemedi:', err);
        }
    };

    const removeFromWantToRead = async (bookId) => {
        try {
            await wantToReadAPI.remove(bookId);
            setWantToRead(wantToRead.filter((w) => w.bookId !== bookId));
        } catch (err) {
            console.error('Silinemedi:', err);
        }
    };

    const statusBadge = (status) => {
        const map = {
            pending: { class: 'badge-warning', text: '⏳ Onay Bekliyor' },
            borrowed: { class: 'badge-success', text: '📚 Ödünçte' },
            returned: { class: 'badge-info', text: '✓ İade Edildi' },
            cancelled: { class: 'badge-error', text: '✕ İptal' },
        };
        const s = map[status] || { class: 'badge-ghost', text: status };
        return <span className={`badge ${s.class}`}>{s.text}</span>;
    };

    const renderStars = (rating) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
            ))}
        </div>
    );

    const priorityBadge = (priority) => {
        const map = {
            1: { class: 'badge-ghost', text: 'Düşük' },
            2: { class: 'badge-info', text: 'Orta' },
            3: { class: 'badge-error', text: 'Yüksek' },
        };
        const p = map[priority] || map[2];
        return <span className={`badge badge-sm ${p.class}`}>{p.text}</span>;
    };

    const activeBorrowings = borrowings.filter(b => b.status === 'pending' || b.status === 'borrowed');
    const pastBorrowings = borrowings.filter(b => b.status === 'returned' || b.status === 'cancelled');

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-24">
                                <span className="text-4xl">{user?.name?.charAt(0)}</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{user?.name}</h1>
                            <p className="opacity-80">{user?.email}</p>
                            <span className="badge badge-accent mt-2">
                {user?.role === 'admin' ? '👑 Admin' : '👤 Üye'}
              </span>
                        </div>

                        <div className="stats stats-vertical lg:stats-horizontal bg-white/10 backdrop-blur">
                            <div className="stat py-3 px-4">
                                <div className="stat-title text-primary-content/60 text-xs">Okunan</div>
                                <div className="stat-value text-primary-content text-2xl">{stats.totalRead}</div>
                            </div>
                            <div className="stat py-3 px-4">
                                <div className="stat-title text-primary-content/60 text-xs">Okuyacak</div>
                                <div className="stat-value text-primary-content text-2xl">{wantToRead.length}</div>
                            </div>
                            <div className="stat py-3 px-4">
                                <div className="stat-title text-primary-content/60 text-xs">Favori</div>
                                <div className="stat-value text-primary-content text-2xl">{favorites.length}</div>
                            </div>
                            <div className="stat py-3 px-4">
                                <div className="stat-title text-primary-content/60 text-xs">Ort. Puan</div>
                                <div className="stat-value text-primary-content text-2xl">{stats.averageRating.toFixed(1)}★</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6 flex-wrap">
                    <button className={`tab gap-2 ${activeTab === 'borrowings' ? 'tab-active' : ''}`} onClick={() => setActiveTab('borrowings')}>
                        📚 Ödünç ({activeBorrowings.length})
                    </button>
                    <button className={`tab gap-2 ${activeTab === 'wantToRead' ? 'tab-active' : ''}`} onClick={() => setActiveTab('wantToRead')}>
                        📋 Okuyacaklarım ({wantToRead.length})
                    </button>
                    <button className={`tab gap-2 ${activeTab === 'read' ? 'tab-active' : ''}`} onClick={() => setActiveTab('read')}>
                        ✅ Okuduklarım ({readBooks.length})
                    </button>
                    <button className={`tab gap-2 ${activeTab === 'favorites' ? 'tab-active' : ''}`} onClick={() => setActiveTab('favorites')}>
                        ❤️ Favoriler ({favorites.length})
                    </button>
                    <button className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`} onClick={() => setActiveTab('history')}>
                        📜 Geçmiş
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : (
                    <>
                        {/* Ödünç Aldıklarım */}
                        {activeTab === 'borrowings' && (
                            <div>
                                {activeBorrowings.length === 0 ? (
                                    <div className="card bg-base-100 shadow-xl">
                                        <div className="card-body items-center text-center py-12">
                                            <div className="text-6xl mb-4">📭</div>
                                            <h3 className="text-xl font-bold">Aktif ödünç alma yok</h3>
                                            <Link to="/books" className="btn btn-primary mt-4">Kitapları Keşfet</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeBorrowings.map((b) => (
                                            <div key={b.id} className="card bg-base-100 shadow-xl">
                                                <div className="card-body">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                        <div className="avatar">
                                                            <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-primary to-secondary">
                                                                {b.book?.coverImage ? (
                                                                    <img src={b.book.coverImage} alt="" className="object-cover" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full"><span className="text-3xl text-white/80">📖</span></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold">{b.book?.title}</h3>
                                                            <p className="text-base-content/70">{b.book?.author?.name}</p>
                                                            <div className="mt-2">{statusBadge(b.status)}</div>
                                                            <div className="mt-2 text-sm opacity-70">
                                                                📅 {new Date(b.startDate).toLocaleDateString('tr-TR')} - {new Date(b.endDate).toLocaleDateString('tr-TR')}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Link to={`/books/${b.bookId}`} className="btn btn-outline btn-sm">Detay</Link>
                                                            {b.status === 'pending' && (
                                                                <button onClick={() => cancelBorrowing(b.id)} className="btn btn-error btn-sm">İptal</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Okuyacaklarım */}
                        {activeTab === 'wantToRead' && (
                            <div>
                                {wantToRead.length === 0 ? (
                                    <div className="card bg-base-100 shadow-xl">
                                        <div className="card-body items-center text-center py-12">
                                            <div className="text-6xl mb-4">📋</div>
                                            <h3 className="text-xl font-bold">Okuma listeniz boş</h3>
                                            <p className="text-base-content/60">Kitap detay sayfasından "Okuyacaklarıma Ekle" butonuna tıklayın</p>
                                            <Link to="/books" className="btn btn-primary mt-4">Kitapları Keşfet</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {wantToRead.map((w) => (
                                            <div key={w.id} className="card bg-base-100 shadow-xl">
                                                <figure className="h-40 bg-gradient-to-br from-warning to-orange-500 relative">
                                                    {w.book?.coverImage ? (
                                                        <img src={w.book.coverImage} alt="" className="object-cover h-full w-full" />
                                                    ) : (
                                                        <span className="text-5xl text-white/80">📖</span>
                                                    )}
                                                    <div className="absolute top-2 right-2">{priorityBadge(w.priority)}</div>
                                                </figure>
                                                <div className="card-body">
                                                    <h3 className="card-title text-lg line-clamp-1">{w.book?.title}</h3>
                                                    <p className="text-sm text-base-content/70">{w.book?.author?.name}</p>
                                                    {w.note && <p className="text-xs text-base-content/50 italic line-clamp-2">"{w.note}"</p>}
                                                    <div className="card-actions justify-between mt-2">
                                                        <Link to={`/books/${w.bookId}`} className="btn btn-sm btn-primary">Detay</Link>
                                                        <button onClick={() => removeFromWantToRead(w.bookId)} className="btn btn-sm btn-ghost text-error">🗑️</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Okuduklarım */}
                        {activeTab === 'read' && (
                            <div>
                                {readBooks.length === 0 ? (
                                    <div className="card bg-base-100 shadow-xl">
                                        <div className="card-body items-center text-center py-12">
                                            <div className="text-6xl mb-4">📚</div>
                                            <h3 className="text-xl font-bold">Henüz okuduğunuz kitap yok</h3>
                                            <Link to="/books" className="btn btn-primary mt-4">Kitapları Keşfet</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {readBooks.map((r) => (
                                            <div key={r.id} className="card bg-base-100 shadow-xl">
                                                <figure className="h-40 bg-gradient-to-br from-green-500 to-emerald-600 relative">
                                                    {r.book?.coverImage ? (
                                                        <img src={r.book.coverImage} alt="" className="object-cover h-full w-full" />
                                                    ) : (
                                                        <span className="text-5xl text-white/80">📖</span>
                                                    )}
                                                    <div className="absolute top-2 right-2 badge badge-success">✓ Okundu</div>
                                                </figure>
                                                <div className="card-body">
                                                    <h3 className="card-title text-lg line-clamp-1">{r.book?.title}</h3>
                                                    <p className="text-sm text-base-content/70">{r.book?.author?.name}</p>
                                                    {r.rating && (
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(r.rating)}
                                                            <span className="text-sm">({r.rating}/5)</span>
                                                        </div>
                                                    )}
                                                    {r.review && <p className="text-sm text-base-content/60 line-clamp-2 italic">"{r.review}"</p>}
                                                    <div className="card-actions justify-between mt-2">
                                                        <Link to={`/books/${r.bookId}`} className="btn btn-sm btn-primary">Detay</Link>
                                                        <button onClick={() => removeFromRead(r.bookId)} className="btn btn-sm btn-ghost text-error">🗑️</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Favoriler */}
                        {activeTab === 'favorites' && (
                            <div>
                                {favorites.length === 0 ? (
                                    <div className="card bg-base-100 shadow-xl">
                                        <div className="card-body items-center text-center py-12">
                                            <div className="text-6xl mb-4">💔</div>
                                            <h3 className="text-xl font-bold">Favori kitabınız yok</h3>
                                            <Link to="/books" className="btn btn-primary mt-4">Kitapları Keşfet</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {favorites.map((fav) => (
                                            <div key={fav.id} className="card bg-base-100 shadow-xl">
                                                <figure className="h-40 bg-gradient-to-br from-pink-500 to-rose-600 relative">
                                                    {fav.book?.coverImage ? (
                                                        <img src={fav.book.coverImage} alt="" className="object-cover h-full w-full" />
                                                    ) : (
                                                        <span className="text-5xl text-white/80">📖</span>
                                                    )}
                                                    <div className="absolute top-2 right-2 badge badge-error">❤️</div>
                                                </figure>
                                                <div className="card-body">
                                                    <h3 className="card-title text-lg line-clamp-1">{fav.book?.title}</h3>
                                                    <p className="text-sm text-base-content/70">{fav.book?.author?.name}</p>
                                                    <div className="card-actions justify-between mt-2">
                                                        <Link to={`/books/${fav.bookId}`} className="btn btn-sm btn-primary">Detay</Link>
                                                        <button onClick={() => removeFavorite(fav.bookId)} className="btn btn-sm btn-ghost text-error">🗑️</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Geçmiş */}
                        {activeTab === 'history' && (
                            <div>
                                {pastBorrowings.length === 0 ? (
                                    <div className="card bg-base-100 shadow-xl">
                                        <div className="card-body items-center text-center py-12">
                                            <div className="text-6xl mb-4">📜</div>
                                            <h3 className="text-xl font-bold">Geçmiş kaydınız yok</h3>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card bg-base-100 shadow-xl">
                                        <div className="overflow-x-auto">
                                            <table className="table">
                                                <thead>
                                                <tr>
                                                    <th>Kitap</th>
                                                    <th>Tarihler</th>
                                                    <th>Durum</th>
                                                    <th></th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {pastBorrowings.map((b) => (
                                                    <tr key={b.id} className="hover">
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <div className="avatar placeholder">
                                                                    <div className="bg-neutral text-neutral-content rounded w-10"><span>📖</span></div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold">{b.book?.title}</div>
                                                                    <div className="text-xs opacity-50">{b.book?.author?.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-sm">
                                                            {new Date(b.startDate).toLocaleDateString('tr-TR')} - {new Date(b.endDate).toLocaleDateString('tr-TR')}
                                                        </td>
                                                        <td>{statusBadge(b.status)}</td>
                                                        <td><Link to={`/books/${b.bookId}`} className="btn btn-ghost btn-xs">Detay</Link></td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
