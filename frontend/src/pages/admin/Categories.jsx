import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ name: '' });
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
        } catch (err) {
            setError('Kategoriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setFormLoading(true);

        try {
            if (editingId) {
                await categoriesAPI.update(editingId, formData);
                setSuccess('Kategori güncellendi');
            } else {
                await categoriesAPI.create(formData);
                setSuccess('Kategori eklendi');
            }
            setFormData({ name: '' });
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'İşlem başarısız');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setFormData({ name: cat.name });
        setEditingId(cat.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await categoriesAPI.delete(id);
            setSuccess('Kategori silindi');
            fetchCategories();
        } catch (err) {
            setError('Silme başarısız');
        }
    };

    const colors = ['badge-primary', 'badge-secondary', 'badge-accent', 'badge-info', 'badge-success', 'badge-warning'];

    return (
        <div className="min-h-screen bg-base-200">
            <div className="bg-gradient-to-r from-secondary to-purple-600 text-secondary-content py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold">🏷️ Kategori Yönetimi</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">
                                {editingId ? '✏️ Düzenle' : '➕ Yeni Kategori'}
                            </h2>

                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Kategori Adı *</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ name: e.target.value })}
                                        className="input input-bordered"
                                        placeholder="Örn: Bilim Kurgu"
                                        required
                                    />
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className={`btn btn-secondary flex-1 ${formLoading ? 'loading' : ''}`}>
                                        {editingId ? 'Güncelle' : 'Ekle'}
                                    </button>
                                    {editingId && (
                                        <button type="button" onClick={() => { setFormData({ name: '' }); setEditingId(null); }} className="btn btn-ghost">
                                            İptal
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">📋 Kategoriler ({categories.length})</h2>

                            {loading ? (
                                <div className="text-center py-8">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-8 text-base-content/60">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p>Henüz kategori yok</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {categories.map((cat, index) => (
                                        <div key={cat.id} className="card card-compact bg-base-200">
                                            <div className="card-body flex-row items-center gap-3">
                        <span className={`badge ${colors[index % colors.length]} badge-lg`}>
                          {cat.name}
                        </span>
                                                <span className="text-xs opacity-60">{cat.books?.length || 0} kitap</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleEdit(cat)} className="btn btn-ghost btn-xs">✏️</button>
                                                    <button onClick={() => handleDelete(cat.id)} className="btn btn-ghost btn-xs text-error">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
