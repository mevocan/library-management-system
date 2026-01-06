import { useState, useEffect } from 'react';
import { borrowingsAPI } from '../../services/api';

const AdminBorrowings = () => {
    const [borrowings, setBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchBorrowings();
    }, []);

    const fetchBorrowings = async () => {
        try {
            setLoading(true);
            const response = await borrowingsAPI.getAll();
            setBorrowings(response.data);
        } catch (err) {
            console.error('Yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await borrowingsAPI.updateStatus(id, { status });
            fetchBorrowings();
        } catch (err) {
            alert('Güncelleme başarısız');
        }
    };

    const filteredBorrowings = filter === 'all'
        ? borrowings
        : borrowings.filter((b) => b.status === filter);

    // Basitleştirilmiş durum gösterimi
    const statusBadge = (status) => {
        const map = {
            pending: { class: 'badge-warning', text: '⏳ Onay Bekliyor' },
            borrowed: { class: 'badge-success', text: '📚 Ödünçte' },
            returned: { class: 'badge-info', text: '✓ İade Edildi' },
            cancelled: { class: 'badge-error', text: '✕ İptal/Red' },
        };
        const s = map[status] || { class: 'badge-ghost', text: status };
        return <span className={`badge ${s.class}`}>{s.text}</span>;
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="bg-gradient-to-r from-warning to-orange-500 text-warning-content py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold">📅 Ödünç Alma Yönetimi</h1>
                    <p className="opacity-80">{borrowings.length} kayıt</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filtre */}
                <div className="tabs tabs-boxed mb-6">
                    {[
                        { key: 'all', label: 'Tümü', count: borrowings.length },
                        { key: 'pending', label: '⏳ Bekleyen', count: borrowings.filter(b => b.status === 'pending').length },
                        { key: 'borrowed', label: '📚 Ödünçte', count: borrowings.filter(b => b.status === 'borrowed').length },
                        { key: 'returned', label: '✓ İade', count: borrowings.filter(b => b.status === 'returned').length },
                        { key: 'cancelled', label: '✕ İptal', count: borrowings.filter(b => b.status === 'cancelled').length },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            className={`tab gap-2 ${filter === tab.key ? 'tab-active' : ''}`}
                            onClick={() => setFilter(tab.key)}
                        >
                            {tab.label}
                            {tab.count > 0 && <span className="badge badge-sm">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : filteredBorrowings.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body items-center text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold">Kayıt bulunamadı</h3>
                        </div>
                    </div>
                ) : (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Kullanıcı</th>
                                    <th>Kitap</th>
                                    <th>Tarihler</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredBorrowings.map((b) => (
                                    <tr key={b.id} className="hover">
                                        <td className="font-mono text-xs">#{b.id}</td>
                                        <td>
                                            <div>
                                                <div className="font-bold">{b.user?.name}</div>
                                                <div className="text-xs opacity-50">{b.user?.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-primary text-primary-content rounded w-10">
                                                        {b.book?.coverImage ? (
                                                            <img src={b.book.coverImage} alt="" className="object-cover" />
                                                        ) : (
                                                            <span>📖</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{b.book?.title}</div>
                                                    <div className="text-xs opacity-50">{b.book?.author?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(b.startDate).toLocaleDateString('tr-TR')}
                                                </div>
                                                <div className="text-xs opacity-50">
                                                    → {new Date(b.endDate).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{statusBadge(b.status)}</td>
                                        <td>
                                            {/* Bekleyen için: Onayla veya Reddet */}
                                            {b.status === 'pending' && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => updateStatus(b.id, 'borrowed')}
                                                        className="btn btn-success btn-xs"
                                                        title="Onayla ve Teslim Et"
                                                    >
                                                        ✓ Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(b.id, 'cancelled')}
                                                        className="btn btn-error btn-xs"
                                                        title="Reddet"
                                                    >
                                                        ✕ Reddet
                                                    </button>
                                                </div>
                                            )}

                                            {/* Ödünçte için: İade Al */}
                                            {b.status === 'borrowed' && (
                                                <button
                                                    onClick={() => updateStatus(b.id, 'returned')}
                                                    className="btn btn-info btn-xs"
                                                    title="İade Al"
                                                >
                                                    ↩️ İade Al
                                                </button>
                                            )}

                                            {/* Tamamlanmış durumlar */}
                                            {(b.status === 'returned' || b.status === 'cancelled') && (
                                                <span className="text-xs opacity-50">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Durum Açıklaması */}
                <div className="mt-8">
                    <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                            <h3 className="font-bold">Durum Akışı</h3>
                            <div className="text-sm mt-1">
                                <span className="badge badge-warning badge-sm mr-2">Onay Bekliyor</span>
                                → Admin onaylar →
                                <span className="badge badge-success badge-sm mx-2">Ödünçte</span>
                                → Kitap iade edilince →
                                <span className="badge badge-info badge-sm ml-2">İade Edildi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBorrowings;
