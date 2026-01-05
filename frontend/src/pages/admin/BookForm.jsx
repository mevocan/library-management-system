import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { booksAPI, authorsAPI, categoriesAPI } from '../../services/api';

const BookForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '', isbn: '', description: '', publishedYear: '', authorId: '', categoryIds: [],
    });
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [authorsRes, categoriesRes] = await Promise.all([
                    authorsAPI.getAll(),
                    categoriesAPI.getAll(),
                ]);
                setAuthors(authorsRes.data);
                setCategories(categoriesRes.data);

                if (isEditing) {
                    const bookRes = await booksAPI.getOne(id);
                    const book = bookRes.data;
                    setFormData({
                        title: book.title,
                        isbn: book.isbn,
                        description: book.description || '',
                        publishedYear: book.publishedYear || '',
                        authorId: book.author?.id || '',
                        categoryIds: book.categories?.map((c) => c.id) || [],
                    });
                }
            } catch (err) {
                setError('Veriler yüklenemedi');
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [id, isEditing]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (catId) => {
        const ids = formData.categoryIds;
        setFormData({
            ...formData,
            categoryIds: ids.includes(catId) ? ids.filter((i) => i !== catId) : [...ids, catId],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.authorId) { setError('Yazar seçin'); return; }
        if (formData.categoryIds.length === 0) { setError('En az bir kategori seçin'); return; }

        setLoading(true);
        try {
            const bookData = {
                ...formData,
                publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
                authorId: parseInt(formData.authorId),
                categoryIds: formData.categoryIds.map((i) => parseInt(i)),
            };

            if (isEditing) await booksAPI.update(id, bookData);
            else await booksAPI.create(bookData);

            navigate('/admin/books');
        } catch (err) {
            setError(err.response?.data?.message || 'Kaydetme başarısız');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <div className="bg-gradient-to-r from-primary to-blue-600 text-primary-content py-8">
                <div className="container mx-auto px-4">
                    <div className="breadcrumbs text-sm opacity-80">
                        <ul>
                            <li><Link to="/admin">Admin</Link></li>
                            <li><Link to="/admin/books">Kitaplar</Link></li>
                            <li>{isEditing ? 'Düzenle' : 'Yeni'}</li>
                        </ul>
                    </div>
                    <h1 className="text-3xl font-bold mt-2">
                        {isEditing ? '📝 Kitabı Düzenle' : '📚 Yeni Kitap'}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {error && <div className="alert alert-error mb-6">{error}</div>}

                    {(authors.length === 0 || categories.length === 0) && (
                        <div className="alert alert-warning mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>
                Önce {authors.length === 0 && <Link to="/admin/authors" className="link">yazar</Link>}
                                {authors.length === 0 && categories.length === 0 && ' ve '}
                                {categories.length === 0 && <Link to="/admin/categories" className="link">kategori</Link>} ekleyin.
              </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div className="form-control md:col-span-2">
                                    <label className="label"><span className="label-text font-semibold">Kitap Başlığı *</span></label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        placeholder="Suç ve Ceza"
                                        required
                                    />
                                </div>

                                {/* ISBN */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">ISBN *</span></label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        placeholder="978-3-16-148410-0"
                                        required
                                    />
                                </div>

                                {/* Year */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Yayın Yılı</span></label>
                                    <input
                                        type="number"
                                        name="publishedYear"
                                        value={formData.publishedYear}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        placeholder="2024"
                                    />
                                </div>

                                {/* Author Select */}
                                <div className="form-control md:col-span-2">
                                    <label className="label">
                                        <span className="label-text font-semibold">Yazar *</span>
                                        <span className="label-text-alt text-base-content/50">Select Author</span>
                                    </label>
                                    <select
                                        name="authorId"
                                        value={formData.authorId}
                                        onChange={handleChange}
                                        className="select select-bordered"
                                        required
                                    >
                                        <option value="">-- Yazar Seçin --</option>
                                        {authors.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Categories Multi-Select */}
                                <div className="form-control md:col-span-2">
                                    <label className="label">
                                        <span className="label-text font-semibold">Kategoriler *</span>
                                        <span className="label-text-alt text-base-content/50">Birden fazla seçilebilir</span>
                                    </label>
                                    <div className="bg-base-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        {categories.length === 0 ? (
                                            <p className="text-base-content/50">Kategori yok</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map((cat) => (
                                                    <label
                                                        key={cat.id}
                                                        className={`cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                                                            formData.categoryIds.includes(cat.id)
                                                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                                                : 'border-base-300 hover:border-primary/50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.categoryIds.includes(cat.id)}
                                                            onChange={() => handleCategoryChange(cat.id)}
                                                            className="hidden"
                                                        />
                                                        {cat.name}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {formData.categoryIds.length > 0 && (
                                        <label className="label">
                                            <span className="label-text-alt text-success">✓ {formData.categoryIds.length} kategori seçildi</span>
                                        </label>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="form-control md:col-span-2">
                                    <label className="label"><span className="label-text font-semibold">Açıklama</span></label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered"
                                        rows="3"
                                        placeholder="Kitap hakkında..."
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="card-actions justify-end mt-6 pt-4 border-t border-base-200">
                                <button type="button" onClick={() => navigate('/admin/books')} className="btn btn-ghost">
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                    disabled={loading || authors.length === 0 || categories.length === 0}
                                >
                                    {isEditing ? '✓ Güncelle' : '+ Ekle'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookForm;
