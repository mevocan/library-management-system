import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationsAPI.getAll();
            setNotifications(res.data);
        } catch (err) {
            console.error('Bildirimler alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (err) {
            console.error('Okundu işareti başarısız:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Toplu okundu işareti başarısız:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationsAPI.delete(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error('Silme başarısız:', err);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) return;
        try {
            await notificationsAPI.deleteAll();
            setNotifications([]);
        } catch (err) {
            console.error('Toplu silme başarısız:', err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'borrow_approved': return '✅';
            case 'borrow_rejected': return '❌';
            case 'book_available': return '📗';
            case 'book_returned': return '📚';
            case 'borrow_reminder': return '⏰';
            default: return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'borrow_approved': return 'border-l-success';
            case 'borrow_rejected': return 'border-l-error';
            case 'book_available': return 'border-l-primary';
            case 'book_returned': return 'border-l-info';
            case 'borrow_reminder': return 'border-l-warning';
            default: return 'border-l-neutral';
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => !n.isRead)
            : notifications.filter(n => n.isRead);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold">🔔 Bildirimler</h1>
                    <p className="opacity-80 mt-1">
                        {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    {/* Tabs */}
                    <div className="tabs tabs-boxed">
                        <button
                            className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Tümü ({notifications.length})
                        </button>
                        <button
                            className={`tab ${filter === 'unread' ? 'tab-active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            Okunmamış ({unreadCount})
                        </button>
                        <button
                            className={`tab ${filter === 'read' ? 'tab-active' : ''}`}
                            onClick={() => setFilter('read')}
                        >
                            Okunmuş ({notifications.length - unreadCount})
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="btn btn-outline btn-sm">
                                ✓ Tümünü Okundu Yap
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button onClick={handleDeleteAll} className="btn btn-outline btn-error btn-sm">
                                🗑️ Tümünü Sil
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body items-center text-center py-16">
                            <div className="text-6xl mb-4">🔕</div>
                            <h3 className="text-xl font-bold">Bildirim yok</h3>
                            <p className="text-base-content/60">
                                {filter === 'unread' ? 'Tüm bildirimler okunmuş' : 'Henüz bildirim almadınız'}
                            </p>
                            <Link to="/books" className="btn btn-primary mt-4">
                                Kitapları Keşfet
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`card bg-base-100 shadow border-l-4 ${getNotificationColor(notification.type)} ${
                                    !notification.isRead ? 'bg-primary/5' : ''
                                }`}
                            >
                                <div className="card-body p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="text-3xl">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold ${!notification.isRead ? 'text-primary' : ''}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="badge badge-primary badge-sm">Yeni</span>
                                                )}
                                            </div>
                                            <p className="text-base-content/70 mt-1">{notification.message}</p>
                                            <p className="text-xs text-base-content/50 mt-2">
                                                {new Date(notification.createdAt).toLocaleString('tr-TR')}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="btn btn-ghost btn-xs"
                                                    title="Okundu işaretle"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="btn btn-ghost btn-xs text-error"
                                                title="Sil"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Link Button */}
                                    {notification.link && (
                                        <div className="mt-3 pt-3 border-t border-base-200">
                                            <Link
                                                to={notification.link}
                                                className="btn btn-outline btn-sm"
                                                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                            >
                                                Detayı Gör →
                                            </Link>
                                        </div>
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

export default Notifications;
