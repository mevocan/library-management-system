import { useState, useEffect } from 'react';
import { authorsAPI } from '../../services/api';

const Authors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ name: '', bio: '' });
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => { fetchAuthors(); }, []);

    const fetchAuthors = async () => {
        try {
            setLoading(true);
            const response = await authorsAPI.getAll();
            setAuthors(response.data);
        } catch (err) {
            setError('Yazarlar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setFormLoading(true);

        try {
            if (editingId) {
                await authorsAPI.update(editingId, formData);
                setSuccess('Yazar güncellendi');
            } else {
                await authorsAPI.create(formData);
                setSuccess('Yazar eklendi');
            }
            setFormData({ name: '', bio: '' });
            setEditingId(null);
            fetchAuthors();
        } catch (err) {
            setError(err.response?.data?.message || 'İşlem başarısız');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (author) => {
        setFormData({ name: author.name, bio: author.bio || '' });
        setEditingId(author.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await authorsAPI.delete(id);
            setSuccess('Yazar silindi');
            fetchAuthors();
        } catch (err) {
            setError('Silme başarısız');
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="bg-gradient-to-r from-success to-emerald-600 text-success-content py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold">✍️ Yazar Yönetimi</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">
                                {editingId ? '✏️ Düzenle' : '➕ Yeni Yazar'}
                            </h2>

                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Yazar Adı *</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input input-bordered"
                                        placeholder="Örn: Orhan Pamuk"
                                        required
                                    />
                                </div>

                                <div className="form-control mt-3">
                                    <label className="label"><span className="label-text">Biyografi</span></label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="textarea textarea-bordered"
                                        rows="3"
                                        placeholder="Yazar hakkında..."
                                    />
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className={`btn btn-success flex-1 ${formLoading ? 'loading' : ''}`}>
                                        {editingId ? 'Güncelle' : 'Ekle'}
                                    </button>
                                    {editingId && (
                                        <button type="button" onClick={() => { setFormData({ name: '', bio: '' }); setEditingId(null); }} className="btn btn-ghost">
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
                            <h2 className="card-title">📋 Yazarlar ({authors.length})</h2>

                            {loading ? (
                                <div className="text-center py-8">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : authors.length === 0 ? (
                                <div className="text-center py-8 text-base-content/60">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p>Henüz yazar yok</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>Yazar</th>
                                            <th>Kitap Sayısı</th>
                                            <th>İşlemler</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {authors.map((author) => (
                                            <tr key={author.id} className="hover">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar placeholder">
                                                            <div className="bg-success text-success-content rounded-full w-10">
                                                                <span>{author.name.charAt(0)}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{author.name}</div>
                                                            {author.bio && <div className="text-xs opacity-50 truncate max-w-xs">{author.bio}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-ghost">{author.books?.length || 0} kitap</span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleEdit(author)} className="btn btn-ghost btn-xs">✏️</button>
                                                        <button onClick={() => handleDelete(author.id)} className="btn btn-ghost btn-xs text-error">🗑️</button>
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

export default Authors;
