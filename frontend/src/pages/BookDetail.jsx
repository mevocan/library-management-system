import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, favoritesAPI, borrowingsAPI, readBooksAPI, wantToReadAPI } from '../services/api';

const BookDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowing, setBorrowing] = useState(false);

    // Ödünç alma formu
    const [showBorrowForm, setShowBorrowForm] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [borrowError, setBorrowError] = useState('');
    const [borrowSuccess, setBorrowSuccess] = useState('');

    // Okudum özelliği
    const [isRead, setIsRead] = useState(false);
    const [readData, setReadData] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [bookRating, setBookRating] = useState({ average: 0, count: 0 });

    // Yorumlar
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // Okuyacaklarım
    const [inWantToRead, setInWantToRead] = useState(false);
    const [wantToReadData, setWantToReadData] = useState(null);

    useEffect(() => {
        fetchData();
        fetchReviews();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookRes, availRes] = await Promise.all([
                booksAPI.getOne(id),
                borrowingsAPI.getAvailability(id),
            ]);
            setBook(bookRes.data);
            setAvailability(availRes.data);

            // Kitabın ortalama puanını al
            try {
                const ratingRes = await readBooksAPI.getBookRating(id);
                setBookRating(ratingRes.data);
            } catch (e) {}

            // Kullanıcı giriş yaptıysa
            if (user) {
                // Favorilerde mi
                try {
                    const favRes = await favoritesAPI.checkFavorite(id);
                    setIsFavorite(favRes.data.isFavorite);
                } catch (e) {}

                // Okundu mu
                try {
                    const readRes = await readBooksAPI.checkRead(id);
                    setIsRead(readRes.data.isRead);
                    setReadData(readRes.data.data);
                    if (readRes.data.data) {
                        setRating(readRes.data.data.rating || 0);
                        setReview(readRes.data.data.review || '');
                    }
                } catch (e) {}

                // Okuyacaklarımda mı
                try {
                    const wtrRes = await wantToReadAPI.checkInList(id);
                    setInWantToRead(wtrRes.data.inList);
                    setWantToReadData(wtrRes.data.data);
                } catch (e) {}
            }
        } catch (err) {
            console.error('Veri yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const res = await readBooksAPI.getBookReviews(id);
            setReviews(res.data);
        } catch (err) {
            console.error('Yorumlar yüklenemedi:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!user) {
            alert('Favorilere eklemek için giriş yapmalısınız');
            return;
        }

        try {
            if (isFavorite) {
                await favoritesAPI.removeFromFavorites(id);
                setIsFavorite(false);
            } else {
                await favoritesAPI.addToFavorites(id);
                setIsFavorite(true);
            }
        } catch (err) {
            console.error('Favori işlemi başarısız:', err);
        }
    };

    const toggleWantToRead = async () => {
        if (!user) {
            alert('Giriş yapmalısınız');
            return;
        }

        try {
            if (inWantToRead) {
                await wantToReadAPI.remove(id);
                setInWantToRead(false);
                setWantToReadData(null);
            } else {
                const res = await wantToReadAPI.addToList({ bookId: parseInt(id) });
                setInWantToRead(true);
                setWantToReadData(res.data);
            }
        } catch (err) {
            console.error('İşlem başarısız:', err);
            alert(err.response?.data?.message || 'İşlem başarısız');
        }
    };

    const handleBorrow = async (e) => {
        e.preventDefault();
        setBorrowError('');
        setBorrowSuccess('');
        setBorrowing(true);

        try {
            await borrowingsAPI.create({
                bookId: parseInt(id),
                startDate,
                endDate,
            });
            setBorrowSuccess('Ödünç alma talebiniz oluşturuldu! Admin onayı bekleniyor.');
            setShowBorrowForm(false);
            setStartDate('');
            setEndDate('');
            fetchData();
        } catch (err) {
            setBorrowError(err.response?.data?.message || 'Ödünç alma başarısız');
        } finally {
            setBorrowing(false);
        }
    };

    // Okudum işlemleri
    const handleMarkAsRead = () => {
        if (!user) {
            alert('Giriş yapmalısınız');
            return;
        }
        setShowRatingModal(true);
    };

    const submitReadBook = async () => {
        try {
            if (isRead) {
                await readBooksAPI.update(id, {
                    rating: rating || null,
                    review: review || null,
                });
            } else {
                await readBooksAPI.markAsRead({
                    bookId: parseInt(id),
                    rating: rating || null,
                    review: review || null,
                    readDate: new Date().toISOString(),
                });

                // Okuyacaklarımdan çıkar (eğer varsa)
                if (inWantToRead) {
                    try {
                        await wantToReadAPI.remove(id);
                        setInWantToRead(false);
                        setWantToReadData(null);
                    } catch (e) {}
                }
            }
            setIsRead(true);
            setShowRatingModal(false);
            fetchData();
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || 'İşlem başarısız');
        }
    };

    const removeFromRead = async () => {
        if (!window.confirm('Okuma kaydını silmek istediğinize emin misiniz?')) return;
        try {
            await readBooksAPI.remove(id);
            setIsRead(false);
            setReadData(null);
            setRating(0);
            setReview('');
            fetchData();
            fetchReviews();
        } catch (err) {
            console.error(err);
        }
    };

    const renderStars = (count, size = 'text-xl') => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`${size} ${star <= count ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
            ★
          </span>
                ))}
            </div>
        );
    };

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '?';
    };

    const getAvatarColor = (name) => {
        const colors = [
            'bg-primary', 'bg-secondary', 'bg-accent', 'bg-info',
            'bg-success', 'bg-warning', 'bg-error', 'bg-neutral'
        ];
        const index = name?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    const today = new Date().toISOString().split('T')[0];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h2 className="text-2xl font-bold">Kitap bulunamadı</h2>
                    <Link to="/books" className="btn btn-primary mt-4">Kitaplara Dön</Link>
                </div>
            </div>
        );
    }

    const otherReviews = reviews.filter((r) => r.user.id !== user?.id);

    return (
        <div className="min-h-screen bg-base-200">
            {/* Breadcrumb */}
            <div className="bg-base-100 border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="breadcrumbs text-sm">
                        <ul>
                            <li><Link to="/">Ana Sayfa</Link></li>
                            <li><Link to="/books">Kitaplar</Link></li>
                            <li>{book.title}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sol: Kapak ve Hızlı Bilgi */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-xl sticky top-24">
                            {/* Kapak */}
                            <figure className="h-80 bg-gradient-to-br from-primary to-secondary relative">
                                {book.coverImage ? (
                                    <img src={book.coverImage} alt={book.title} className="object-cover h-full w-full" />
                                ) : (
                                    <span className="text-8xl text-white/80">📖</span>
                                )}
                                {bookRating.count > 0 && (
                                    <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="text-yellow-400">★</span>
                                        <span className="font-bold">{bookRating.average.toFixed(1)}</span>
                                        <span className="text-xs opacity-70">({bookRating.count})</span>
                                    </div>
                                )}
                            </figure>

                            <div className="card-body space-y-2">
                                {/* Kitap Durumu Butonları */}
                                {user && (
                                    <div className="flex flex-col gap-2">
                                        {/* Okuyacaklarım / Okudum seçimi */}
                                        {!isRead && (
                                            <button
                                                onClick={toggleWantToRead}
                                                className={`btn btn-block ${inWantToRead ? 'btn-warning' : 'btn-outline btn-warning'}`}
                                            >
                                                {inWantToRead ? '📋 Okuyacaklarımda' : '📋 Okuyacaklarıma Ekle'}
                                            </button>
                                        )}

                                        {isRead ? (
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => setShowRatingModal(true)}
                                                    className="btn btn-success btn-block"
                                                >
                                                    <span>✅ Okudum</span>
                                                    {readData?.rating && (
                                                        <span className="badge badge-warning ml-2">{readData.rating}★</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={removeFromRead}
                                                    className="btn btn-ghost btn-xs btn-block text-error"
                                                >
                                                    Okuma kaydını sil
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleMarkAsRead}
                                                className="btn btn-outline btn-success btn-block"
                                            >
                                                ✅ Okudum Olarak İşaretle
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="divider my-1"></div>

                                {/* Favori Butonu */}
                                <button
                                    onClick={toggleFavorite}
                                    className={`btn btn-block ${isFavorite ? 'btn-error' : 'btn-outline btn-error'}`}
                                >
                                    {isFavorite ? '❤️ Favorilerimde' : '🤍 Favorilere Ekle'}
                                </button>

                                {/* Müsaitlik Durumu */}
                                <div className="divider my-1">Ödünç Al</div>

                                {availability?.available ? (
                                    <div className="alert alert-success py-2">
                                        <span>✅ Müsait ({book.totalCopies || 1} kopya)</span>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning py-2">
                                        <div>
                                            <span>⏳ Müsait değil</span>
                                            {availability?.nextAvailable && (
                                                <p className="text-xs">
                                                    Tahmini: {new Date(availability.nextAvailable).toLocaleDateString('tr-TR')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Ödünç Al Butonu */}
                                {user ? (
                                    <button
                                        onClick={() => setShowBorrowForm(!showBorrowForm)}
                                        className="btn btn-primary btn-block"
                                    >
                                        📅 Ödünç Almak İstiyorum
                                    </button>
                                ) : (
                                    <Link to="/login" className="btn btn-primary btn-block">
                                        Giriş yapın
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sağ: Detaylar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Başlık ve Temel Bilgiler */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h1 className="card-title text-3xl">{book.title}</h1>

                                <div className="flex flex-wrap gap-4 text-base-content/70 mt-2">
                  <span className="flex items-center gap-1">
                    <span>✍️</span> {book.author?.name}
                  </span>
                                    {book.publishedYear && (
                                        <span className="flex items-center gap-1">
                      <span>📅</span> {book.publishedYear}
                    </span>
                                    )}
                                    <span className="flex items-center gap-1">
                    <span>📋</span> {book.isbn}
                  </span>
                                </div>

                                {bookRating.count > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {renderStars(Math.round(bookRating.average))}
                                        <span className="text-base-content/60">
                      {bookRating.average.toFixed(1)} / 5 ({bookRating.count} değerlendirme)
                    </span>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {book.categories?.map((cat) => (
                                        <span key={cat.id} className="badge badge-primary badge-lg">
                      {cat.name}
                    </span>
                                    ))}
                                </div>

                                {book.description && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold mb-2">Açıklama</h3>
                                        <p className="text-base-content/70 leading-relaxed">{book.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kullanıcının Kendi Değerlendirmesi */}
                        {isRead && readData && (readData.rating || readData.review) && (
                            <div className="card bg-base-100 shadow-xl border-2 border-primary">
                                <div className="card-body">
                                    <div className="flex items-center justify-between">
                                        <h2 className="card-title text-lg">📝 Benim Değerlendirmem</h2>
                                        <button onClick={() => setShowRatingModal(true)} className="btn btn-ghost btn-sm">
                                            ✏️ Düzenle
                                        </button>
                                    </div>
                                    {readData.rating && (
                                        <div className="flex items-center gap-2">
                                            {renderStars(readData.rating)}
                                            <span className="font-bold">{readData.rating}/5</span>
                                        </div>
                                    )}
                                    {readData.review && (
                                        <p className="text-base-content/70 italic mt-2">"{readData.review}"</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ödünç Alma Formu */}
                        {showBorrowForm && (
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">📅 Ödünç Alma Talebi</h2>

                                    {borrowError && <div className="alert alert-error">{borrowError}</div>}
                                    {borrowSuccess && <div className="alert alert-success">{borrowSuccess}</div>}

                                    <form onSubmit={handleBorrow} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">Başlangıç</span></label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    min={today}
                                                    className="input input-bordered"
                                                    required
                                                />
                                            </div>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">Bitiş</span></label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    min={startDate || today}
                                                    className="input input-bordered"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className={`btn btn-primary ${borrowing ? 'loading' : ''}`} disabled={borrowing}>
                                                Talep Oluştur
                                            </button>
                                            <button type="button" onClick={() => setShowBorrowForm(false)} className="btn btn-ghost">
                                                İptal
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Değerlendirmeler */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="card-title">
                                        💬 Değerlendirmeler
                                        {reviews.length > 0 && <span className="badge badge-neutral">{reviews.length}</span>}
                                    </h2>
                                </div>

                                {reviewsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <span className="loading loading-spinner loading-md"></span>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-8 text-base-content/60">
                                        <div className="text-4xl mb-2">💭</div>
                                        <p>Henüz değerlendirme yapılmamış</p>
                                        {user && !isRead && (
                                            <button onClick={handleMarkAsRead} className="btn btn-primary btn-sm mt-4">
                                                İlk değerlendirmeyi sen yap!
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((r) => (
                                            <div
                                                key={r.id}
                                                className={`p-4 rounded-lg ${r.user.id === user?.id ? 'bg-primary/10 border-2 border-primary' : 'bg-base-200'}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`avatar placeholder`}>
                                                        <div className={`${getAvatarColor(r.user.name)} text-white rounded-full w-12`}>
                                                            <span className="text-lg">{getInitials(r.user.name)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold">{r.user.name}</span>
                                                            {r.user.id === user?.id && <span className="badge badge-primary badge-sm">Sen</span>}
                                                            {r.rating && renderStars(r.rating, 'text-sm')}
                                                        </div>
                                                        {r.review && <p className="mt-2 text-base-content/80">{r.review}</p>}
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-base-content/50">
                                                            {r.readDate && <span>📅 {new Date(r.readDate).toLocaleDateString('tr-TR')}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {user && !isRead && reviews.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-base-200">
                                        <button onClick={handleMarkAsRead} className="btn btn-outline btn-primary btn-block">
                                            📝 Sen de değerlendir
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rezervasyon Takvimi */}
                        {availability?.borrowings?.length > 0 && (
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">🗓️ Rezervasyon Takvimi</h2>
                                    <div className="overflow-x-auto">
                                        <table className="table">
                                            <thead>
                                            <tr>
                                                <th>Başlangıç</th>
                                                <th>Bitiş</th>
                                                <th>Durum</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {availability.borrowings.map((b, i) => (
                                                <tr key={i}>
                                                    <td>{new Date(b.startDate).toLocaleDateString('tr-TR')}</td>
                                                    <td>{new Date(b.endDate).toLocaleDateString('tr-TR')}</td>
                                                    <td>
                              <span className={`badge ${b.status === 'borrowed' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-ghost'}`}>
                                {b.status === 'borrowed' ? '📚 Ödünçte' : b.status === 'pending' ? '⏳ Bekliyor' : b.status}
                              </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <button onClick={() => setShowRatingModal(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        <h3 className="font-bold text-lg mb-4">{isRead ? '📝 Değerlendirmeyi Düzenle' : '📖 Kitabı Değerlendir'}</h3>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                                <div className="avatar">
                                    <div className="w-16 h-20 rounded bg-gradient-to-br from-primary to-secondary">
                                        {book.coverImage ? (
                                            <img src={book.coverImage} alt={book.title} className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-2xl text-white/80">📖</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold">{book.title}</p>
                                    <p className="text-sm text-base-content/60">{book.author?.name}</p>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Puanınız</span>
                                    {rating > 0 && <span className="label-text-alt">{rating}/5</span>}
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`text-4xl transition-all hover:scale-110 ${star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    {rating > 0 && <button onClick={() => setRating(0)} className="btn btn-ghost btn-xs">Temizle</button>}
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Yorumunuz</span>
                                    <span className="label-text-alt">Opsiyonel</span>
                                </label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    className="textarea textarea-bordered h-24"
                                    placeholder="Bu kitap hakkında ne düşünüyorsunuz?"
                                />
                            </div>
                        </div>

                        <div className="modal-action">
                            <button onClick={() => setShowRatingModal(false)} className="btn btn-ghost">İptal</button>
                            <button onClick={submitReadBook} className="btn btn-success">{isRead ? '✓ Güncelle' : '✓ Kaydet'}</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/50" onClick={() => setShowRatingModal(false)}></div>
                </div>
            )}
        </div>
    );
};

export default BookDetail;
