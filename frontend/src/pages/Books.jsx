import { useState, useEffect } from 'react';
import { booksAPI } from '../services/api';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await booksAPI.getAll();
            setBooks(response.data);
        } catch (err) {
            setError('Kitaplar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchBooks();
            return;
        }

        try {
            setLoading(true);
            const response = await booksAPI.search(searchQuery);
            setBooks(response.data);
        } catch (err) {
            setError('Arama yapılırken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">📚 Kitap Koleksiyonu</h1>
                    <p className="opacity-80 mb-6">{books.length} kitap bulundu</p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="join w-full max-w-xl">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Kitap veya yazar ara..."
                            className="input input-bordered join-item flex-1"
                        />
                        <button type="submit" className="btn btn-accent join-item">
                            🔍 Ara
                        </button>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(''); fetchBooks(); }}
                                className="btn btn-ghost join-item"
                            >
                                ✕
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {error && (
                    <div className="alert alert-error mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : books.length === 0 ? (
                    <div className="hero min-h-[40vh]">
                        <div className="hero-content text-center">
                            <div>
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-2xl font-bold">Kitap bulunamadı</h3>
                                <p className="text-base-content/60 mt-2">
                                    {searchQuery ? 'Farklı bir arama terimi deneyin' : 'Henüz kitap eklenmemiş'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book, index) => (
                            <div key={book.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                {/* Book Cover */}
                                <figure className={`h-48 bg-gradient-to-br ${
                                    ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600',
                                        'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600', 'from-cyan-500 to-cyan-600'][index % 6]
                                }`}>
                                    <span className="text-6xl text-white/80">📖</span>
                                </figure>

                                <div className="card-body">
                                    <h2 className="card-title text-lg line-clamp-2">{book.title}</h2>

                                    <div className="flex items-center gap-2 text-base-content/70">
                                        <span>✍️</span>
                                        <span>{book.author?.name || 'Bilinmiyor'}</span>
                                    </div>

                                    <div className="text-xs text-base-content/50">
                                        ISBN: {book.isbn}
                                        {book.publishedYear && ` • ${book.publishedYear}`}
                                    </div>

                                    {/* Categories */}
                                    <div className="card-actions justify-start mt-2">
                                        {book.categories?.slice(0, 3).map((cat) => (
                                            <div key={cat.id} className="badge badge-outline badge-sm">
                                                {cat.name}
                                            </div>
                                        ))}
                                        {book.categories?.length > 3 && (
                                            <div className="badge badge-ghost badge-sm">
                                                +{book.categories.length - 3}
                                            </div>
                                        )}
                                    </div>

                                    {book.description && (
                                        <p className="text-sm text-base-content/60 mt-2 line-clamp-2">
                                            {book.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;
