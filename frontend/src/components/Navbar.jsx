import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Her 30 saniyede bir kontrol et
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationsAPI.getUnreadCount();
            setUnreadCount(res.data);
        } catch (err) {
            console.error('Bildirim sayısı alınamadı:', err);
        }
    };

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

    const toggleNotifications = () => {
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Okundu işareti başarısız:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Toplu okundu işareti başarısız:', err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        setShowNotifications(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Az önce';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} dk önce`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} saat önce`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} gün önce`;
        return new Date(date).toLocaleDateString('tr-TR');
    };

    return (
        <div className="navbar bg-primary text-primary-content sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto">
                {/* Logo */}
                <div className="flex-1">
                    <Link to="/" className="btn btn-ghost text-xl gap-2">
                        <span>📚</span>
                        <span className="hidden sm:inline">Kütüphane</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex flex-none">
                    <ul className="menu menu-horizontal px-1 gap-1">
                        <li>
                            <Link to="/books" className={location.pathname === '/books' ? 'active' : ''}>
                                📖 Kitaplar
                            </Link>
                        </li>
                        <li>
                            <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
                                📊 İstatistikler
                            </Link>
                        </li>
                        {user?.role === 'admin' && (
                            <li>
                                <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>
                                    ⚙️ Admin
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Notifications & User */}
                <div className="flex-none flex items-center gap-2">
                    {/* Bildirimler */}
                    {user && (
                        <div className="dropdown dropdown-end">
                            <label
                                tabIndex={0}
                                className="btn btn-ghost btn-circle"
                                onClick={toggleNotifications}
                            >
                                <div className="indicator">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="badge badge-error badge-sm indicator-item">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                                    )}
                                </div>
                            </label>

                            {showNotifications && (
                                <div
                                    tabIndex={0}
                                    className="dropdown-content mt-3 z-[1] shadow-lg bg-base-100 rounded-box w-80 sm:w-96 text-base-content"
                                >
                                    {/* Header */}
                                    <div className="p-3 border-b border-base-200 flex items-center justify-between">
                                        <h3 className="font-bold">🔔 Bildirimler</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="btn btn-ghost btn-xs"
                                            >
                                                Tümünü okundu yap
                                            </button>
                                        )}
                                    </div>

                                    {/* Bildirim Listesi */}
                                    <div className="max-h-96 overflow-y-auto">
                                        {loading ? (
                                            <div className="p-8 text-center">
                                                <span className="loading loading-spinner loading-md"></span>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-8 text-center text-base-content/60">
                                                <div className="text-4xl mb-2">🔕</div>
                                                <p>Bildirim yok</p>
                                            </div>
                                        ) : (
                                            <ul className="menu p-0">
                                                {notifications.slice(0, 10).map((notification) => (
                                                    <li key={notification.id}>
                                                        <button
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className={`flex items-start gap-3 p-3 ${
                                                                !notification.isRead ? 'bg-primary/5' : ''
                                                            }`}
                                                        >
                              <span className="text-2xl">
                                {getNotificationIcon(notification.type)}
                              </span>
                                                            <div className="flex-1 text-left">
                                                                <p className={`text-sm ${!notification.isRead ? 'font-bold' : ''}`}>
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-xs text-base-content/60 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-base-content/40 mt-1">
                                                                    {timeAgo(notification.createdAt)}
                                                                </p>
                                                            </div>
                                                            {!notification.isRead && (
                                                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {notifications.length > 0 && (
                                        <div className="p-2 border-t border-base-200">
                                            <Link
                                                to="/notifications"
                                                className="btn btn-ghost btn-sm btn-block"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Tüm bildirimleri gör
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Menu */}
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full w-10">
                                    <span>{user.name?.charAt(0)}</span>
                                </div>
                            </label>
                            <ul
                                tabIndex={0}
                                className="menu dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 text-base-content"
                            >
                                <li className="menu-title"><span>{user.name}</span></li>
                                <li><Link to="/profile">👤 Profilim</Link></li>
                                <li><Link to="/notifications">🔔 Bildirimler</Link></li>
                                {user?.role === 'admin' && (
                                    <li className="md:hidden"><Link to="/admin">⚙️ Admin Panel</Link></li>
                                )}
                                <div className="divider my-1"></div>
                                <li>
                                    <button onClick={handleLogout} className="text-error">🚪 Çıkış Yap</button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link to="/login" className="btn btn-ghost btn-sm">Giriş</Link>
                            <Link to="/register" className="btn btn-accent btn-sm">Kayıt Ol</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="dropdown dropdown-end md:hidden">
                    <label tabIndex={0} className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </label>
                    <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 text-base-content">
                        <li><Link to="/books">📖 Kitaplar</Link></li>
                        <li><Link to="/stats">📊 İstatistikler</Link></li>
                        {user?.role === 'admin' && <li><Link to="/admin">⚙️ Admin</Link></li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
