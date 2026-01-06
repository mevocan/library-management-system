import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, authorsAPI, categoriesAPI } from '../services/api';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtre state'leri
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        categoryId: '',
        authorId: '',
        yearFrom: '',
        yearTo: '',
        minRating: '',
    });
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Aktif filtre sayısını hesapla
        const count = Object.values(filters).filter(v => v !== '').length;
        setActiveFiltersCount(count);
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [booksRes, authorsRes, categoriesRes] = await Promise.all([
                booksAPI.getAll(),
                authorsAPI.getAll(),
                categoriesAPI.getAll(),
            ]);
            setBooks(booksRes.data);
            setAuthors(authorsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            setError('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = async () => {
        try {
            setLoading(true);
            setError('');

            // Hiç filtre yoksa tüm kitapları getir
            const hasFilters = Object.values(filters).some(v => v !== '');

            if (!hasFilters) {
                const res = await booksAPI.getAll();
                setBooks(res.data);
            } else {
                const res = await booksAPI.filter(filters);
                setBooks(res.data);
            }
        } catch (err) {
            setError('Filtreleme sırasında hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = async () => {
        setFilters({
            search: '',
            categoryId: '',
            authorId: '',
            yearFrom: '',
            yearTo: '',
            minRating: '',
        });

        try {
            setLoading(true);
            const res = await booksAPI.getAll();
            setBooks(res.data);
        } catch (err) {
            setError('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // Yıl seçenekleri oluştur
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = currentYear; year >= 1900; year -= 10) {
        yearOptions.push(year);
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">📚 Kitap Koleksiyonu</h1>
                            <p className="opacity-80 mt-1">{books.length} kitap bulundu</p>
                        </div>

                        {/* Arama */}
                        <form onSubmit={handleSearch} className="join w-full md:w-auto">
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Kitap, yazar ara..."
                                className="input input-bordered join-item w-full md:w-64"
                            />
                            <button type="submit" className="btn btn-accent join-item">
                                🔍
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Filtre Toggle */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn ${showFilters ? 'btn-primary' : 'btn-outline btn-primary'} gap-2`}
                    >
                        🎛️ Filtreler
                        {activeFiltersCount > 0 && (
                            <span className="badge badge-secondary">{activeFiltersCount}</span>
                        )}
                    </button>

                    {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="btn btn-ghost btn-sm text-error">
                            ✕ Filtreleri Temizle
                        </button>
                    )}
                </div>

                {/* Filtre Paneli */}
                {showFilters && (
                    <div className="card bg-base-100 shadow-xl mb-6">
                        <div className="card-body">
                            <h3 className="card-title text-lg mb-4">🎛️ Gelişmiş Filtreler</h3>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                {/* Kategori */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">📂 Kategori</span>
                                    </label>
                                    <select
                                        value={filters.categoryId}
                                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                                        className="select select-bordered"
                                    >
                                        <option value="">Tümü</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Yazar */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">✍️ Yazar</span>
                                    </label>
                                    <select
                                        value={filters.authorId}
                                        onChange={(e) => handleFilterChange('authorId', e.target.value)}
                                        className="select select-bordered"
                                    >
                                        <option value="">Tümü</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>{author.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Yıl Başlangıç */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">📅 Yıl (Min)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.yearFrom}
                                        onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                                        placeholder="1900"
                                        min="1900"
                                        max={currentYear}
                                        className="input input-bordered"
                                    />
                                </div>

                                {/* Yıl Bitiş */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">📅 Yıl (Max)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.yearTo}
                                        onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                                        placeholder={currentYear.toString()}
                                        min="1900"
                                        max={currentYear}
                                        className="input input-bordered"
                                    />
                                </div>

                                {/* Minimum Puan */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">⭐ Min Puan</span>
                                    </label>
                                    <select
                                        value={filters.minRating}
                                        onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                        className="select select-bordered"
                                    >
                                        <option value="">Tümü</option>
                                        <option value="4">4+ ⭐⭐⭐⭐</option>
                                        <option value="3">3+ ⭐⭐⭐</option>
                                        <option value="2">2+ ⭐⭐</option>
                                        <option value="1">1+ ⭐</option>
                                    </select>
                                </div>

                                {/* Uygula Butonu */}
                                <div className="form-control justify-end">
                                    <button onClick={applyFilters} className="btn btn-primary">
                                        🔍 Filtrele
                                    </button>
                                </div>
                            </div>

                            {/* Aktif Filtreler */}
                            {activeFiltersCount > 0 && (
                                <div className="mt-4 pt-4 border-t border-base-200">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-sm text-base-content/60">Aktif filtreler:</span>
                                        {filters.search && (
                                            <span className="badge badge-outline gap-1">
                        🔍 "{filters.search}"
                        <button onClick={() => handleFilterChange('search', '')} className="text-error">×</button>
                      </span>
                                        )}
                                        {filters.categoryId && (
                                            <span className="badge badge-outline gap-1">
                        📂 {categories.find(c => c.id === parseInt(filters.categoryId))?.name}
                                                <button onClick={() => handleFilterChange('categoryId', '')} className="text-error">×</button>
                      </span>
                                        )}
                                        {filters.authorId && (
                                            <span className="badge badge-outline gap-1">
                        ✍️ {authors.find(a => a.id === parseInt(filters.authorId))?.name}
                                                <button onClick={() => handleFilterChange('authorId', '')} className="text-error">×</button>
                      </span>
                                        )}
                                        {filters.yearFrom && (
                                            <span className="badge badge-outline gap-1">
                        📅 {filters.yearFrom}+
                        <button onClick={() => handleFilterChange('yearFrom', '')} className="text-error">×</button>
                      </span>
                                        )}
                                        {filters.yearTo && (
                                            <span className="badge badge-outline gap-1">
                        📅 -{filters.yearTo}
                                                <button onClick={() => handleFilterChange('yearTo', '')} className="text-error">×</button>
                      </span>
                                        )}
                                        {filters.minRating && (
                                            <span className="badge badge-outline gap-1">
                        ⭐ {filters.minRating}+
                        <button onClick={() => handleFilterChange('minRating', '')} className="text-error">×</button>
                      </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6">{error}</div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : books.length === 0 ? (
                    /* Empty State */
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body items-center text-center py-16">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-2xl font-bold">Kitap bulunamadı</h3>
                            <p className="text-base-content/60 mt-2">
                                {activeFiltersCount > 0 ? 'Farklı filtreler deneyebilirsiniz' : 'Henüz kitap eklenmemiş'}
                            </p>
                            {activeFiltersCount > 0 && (
                                <button onClick={clearFilters} className="btn btn-primary mt-4">
                                    Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Kitap Grid */
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book, index) => (
                            <Link
                                key={book.id}
                                to={`/books/${book.id}`}
                                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Book Cover */}
                                <figure className={`h-48 bg-gradient-to-br ${
                                    ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600',
                                        'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600', 'from-cyan-500 to-cyan-600'][index % 6]
                                } relative`}>
                                    {book.coverImage ? (
                                        <img src={book.coverImage} alt={book.title} className="object-cover h-full w-full" />
                                    ) : (
                                        <span className="text-6xl text-white/80">📖</span>
                                    )}
                                </figure>

                                <div className="card-body p-4">
                                    <h2 className="card-title text-base line-clamp-2">{book.title}</h2>

                                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                                        <span>✍️</span>
                                        <span className="line-clamp-1">{book.author?.name || 'Bilinmiyor'}</span>
                                    </div>

                                    {book.publishedYear && (
                                        <div className="text-xs text-base-content/50">
                                            📅 {book.publishedYear}
                                        </div>
                                    )}

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {book.categories?.slice(0, 2).map((cat) => (
                                            <span key={cat.id} className="badge badge-outline badge-xs">
                        {cat.name}
                      </span>
                                        ))}
                                        {book.categories?.length > 2 && (
                                            <span className="badge badge-ghost badge-xs">+{book.categories.length - 2}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;
