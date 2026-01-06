import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, authorsAPI, categoriesAPI } from '../services/api';

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [counts, setCounts] = useState({ books: 0, authors: 0, categories: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mostRead');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [statsRes, authorsRes, categoriesRes] = await Promise.all([
                booksAPI.getStats(),
                authorsAPI.getAll(),
                categoriesAPI.getAll(),
            ]);

            setStats(statsRes.data);
            setCounts({
                books: statsRes.data.totalBooks,
                authors: authorsRes.data.length,
                categories: categoriesRes.data.length,
            });
        } catch (err) {
            console.error('İstatistikler yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="text-yellow-500">★</span>);
            } else if (i === fullStars && hasHalf) {
                stars.push(<span key={i} className="text-yellow-500">★</span>);
            } else {
                stars.push(<span key={i} className="text-gray-300">★</span>);
            }
        }
        return <div className="flex">{stars}</div>;
    };

    const BookCard = ({ book, rank, type }) => {
        const getBadgeContent = () => {
            switch (type) {
                case 'read':
                    return `${book.readCount || 0} okuma`;
                case 'rated':
                    return `${book.avgRating || 0} ★`;
                case 'favorite':
                    return `${book.favoriteCount || 0} ❤️`;
                default:
                    return '';
            }
        };

        const getRankBadge = () => {
            if (rank === 1) return 'bg-yellow-500 text-yellow-900';
            if (rank === 2) return 'bg-gray-400 text-gray-900';
            if (rank === 3) return 'bg-orange-400 text-orange-900';
            return 'bg-base-300 text-base-content';
        };

        return (
            <Link
                to={`/books/${book.id}`}
                className="flex items-center gap-4 p-3 bg-base-100 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
                {/* Sıralama */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadge()}`}>
                    {rank}
                </div>

                {/* Kapak */}
                <div className="avatar">
                    <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-primary to-secondary">
                        {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <span className="text-2xl text-white/80">📖</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-base-content/60 line-clamp-1">{book.authorName}</p>
                    {type === 'rated' && book.avgRating && (
                        <div className="flex items-center gap-1 mt-1">
                            {renderStars(parseFloat(book.avgRating))}
                            <span className="text-xs text-base-content/50">({book.ratingCount})</span>
                        </div>
                    )}
                </div>

                {/* Badge */}
                <div className="badge badge-primary">{getBadgeContent()}</div>
            </Link>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-accent to-warning text-accent-content py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">📊 Kütüphane İstatistikleri</h1>
                    <p className="opacity-80">En popüler kitaplar ve trendler</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Genel İstatistikler */}
                <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <span className="text-4xl">📚</span>
                        </div>
                        <div className="stat-title">Toplam Kitap</div>
                        <div className="stat-value text-primary">{counts.books}</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <span className="text-4xl">✍️</span>
                        </div>
                        <div className="stat-title">Toplam Yazar</div>
                        <div className="stat-value text-secondary">{counts.authors}</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-accent">
                            <span className="text-4xl">🏷️</span>
                        </div>
                        <div className="stat-title">Toplam Kategori</div>
                        <div className="stat-value text-accent">{counts.categories}</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-info">
                            <span className="text-4xl">📖</span>
                        </div>
                        <div className="stat-title">Toplam Okuma</div>
                        <div className="stat-value text-info">
                            {stats?.mostReadBooks?.reduce((sum, b) => sum + parseInt(b.readCount || 0), 0) || 0}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6 justify-center">
                    <button
                        className={`tab tab-lg gap-2 ${activeTab === 'mostRead' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('mostRead')}
                    >
                        📖 En Çok Okunan
                    </button>
                    <button
                        className={`tab tab-lg gap-2 ${activeTab === 'topRated' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('topRated')}
                    >
                        ⭐ En Yüksek Puan
                    </button>
                    <button
                        className={`tab tab-lg gap-2 ${activeTab === 'mostFavorited' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('mostFavorited')}
                    >
                        ❤️ En Çok Favorilenen
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sol: Liste */}
                    <div className="lg:col-span-2">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title mb-4">
                                    {activeTab === 'mostRead' && '📖 En Çok Okunan Kitaplar'}
                                    {activeTab === 'topRated' && '⭐ En Yüksek Puanlı Kitaplar'}
                                    {activeTab === 'mostFavorited' && '❤️ En Çok Favorilenen Kitaplar'}
                                </h2>

                                {/* En Çok Okunan */}
                                {activeTab === 'mostRead' && (
                                    <div className="space-y-3">
                                        {stats?.mostReadBooks?.length > 0 ? (
                                            stats.mostReadBooks.map((book, index) => (
                                                <BookCard key={book.id} book={book} rank={index + 1} type="read" />
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-base-content/60">
                                                <div className="text-4xl mb-2">📭</div>
                                                <p>Henüz okuma kaydı yok</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* En Yüksek Puanlı */}
                                {activeTab === 'topRated' && (
                                    <div className="space-y-3">
                                        {stats?.topRatedBooks?.length > 0 ? (
                                            stats.topRatedBooks.map((book, index) => (
                                                <BookCard key={book.id} book={book} rank={index + 1} type="rated" />
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-base-content/60">
                                                <div className="text-4xl mb-2">⭐</div>
                                                <p>Henüz puanlama yapılmamış</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* En Çok Favorilenen */}
                                {activeTab === 'mostFavorited' && (
                                    <div className="space-y-3">
                                        {stats?.mostFavoritedBooks?.length > 0 ? (
                                            stats.mostFavoritedBooks.map((book, index) => (
                                                <BookCard key={book.id} book={book} rank={index + 1} type="favorite" />
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-base-content/60">
                                                <div className="text-4xl mb-2">💔</div>
                                                <p>Henüz favorilenen kitap yok</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sağ: Kategori İstatistikleri + Son Eklenenler */}
                    <div className="space-y-6">
                        {/* Kategori İstatistikleri */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-lg">📂 Kategorilere Göre</h2>
                                <div className="space-y-3 mt-2">
                                    {stats?.categoryStats?.slice(0, 8).map((cat, index) => (
                                        <div key={cat.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                        <span className={`badge badge-sm ${
                            ['badge-primary', 'badge-secondary', 'badge-accent', 'badge-info',
                                'badge-success', 'badge-warning', 'badge-error', 'badge-neutral'][index % 8]
                        }`}>
                          {cat.bookCount}
                        </span>
                                                <span className="text-sm">{cat.name}</span>
                                            </div>
                                            <div className="w-24 bg-base-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-info',
                                                            'bg-success', 'bg-warning', 'bg-error', 'bg-neutral'][index % 8]
                                                    }`}
                                                    style={{
                                                        width: `${Math.min(100, (parseInt(cat.bookCount) / (stats?.totalBooks || 1)) * 100 * 3)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Son Eklenen Kitaplar */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-lg">🆕 Son Eklenenler</h2>
                                <div className="space-y-2 mt-2">
                                    {stats?.recentBooks?.slice(0, 5).map((book) => (
                                        <Link
                                            key={book.id}
                                            to={`/books/${book.id}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                                        >
                                            <div className="avatar">
                                                <div className="w-10 h-14 rounded bg-gradient-to-br from-primary to-secondary">
                                                    {book.coverImage ? (
                                                        <img src={book.coverImage} alt="" className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <span className="text-sm text-white/80">📖</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                                                <p className="text-xs text-base-content/60">{book.authorName}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/books" className="btn btn-ghost btn-sm mt-2">
                                    Tüm Kitaplar →
                                </Link>
                            </div>
                        </div>

                        {/* Top 3 Podium */}
                        <div className="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-lg">🏆 Bu Ayın Şampiyonları</h2>
                                <div className="flex items-end justify-center gap-2 mt-4 h-32">
                                    {/* 2. Sıra */}
                                    {stats?.mostReadBooks?.[1] && (
                                        <div className="flex flex-col items-center">
                                            <div className="avatar">
                                                <div className="w-12 h-16 rounded bg-white/20">
                                                    {stats.mostReadBooks[1].coverImage ? (
                                                        <img src={stats.mostReadBooks[1].coverImage} alt="" className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">📖</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-gray-400 w-14 h-16 rounded-t-lg flex items-center justify-center mt-2">
                                                <span className="text-2xl font-bold">2</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1. Sıra */}
                                    {stats?.mostReadBooks?.[0] && (
                                        <div className="flex flex-col items-center">
                                            <div className="avatar">
                                                <div className="w-14 h-20 rounded bg-white/20">
                                                    {stats.mostReadBooks[0].coverImage ? (
                                                        <img src={stats.mostReadBooks[0].coverImage} alt="" className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">📖</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-yellow-500 w-16 h-24 rounded-t-lg flex items-center justify-center mt-2">
                                                <span className="text-3xl font-bold">👑</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Sıra */}
                                    {stats?.mostReadBooks?.[2] && (
                                        <div className="flex flex-col items-center">
                                            <div className="avatar">
                                                <div className="w-10 h-14 rounded bg-white/20">
                                                    {stats.mostReadBooks[2].coverImage ? (
                                                        <img src={stats.mostReadBooks[2].coverImage} alt="" className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">📖</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-orange-600 w-12 h-12 rounded-t-lg flex items-center justify-center mt-2">
                                                <span className="text-xl font-bold">3</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
