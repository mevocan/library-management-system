import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [loading, setLoading] = useState(false);

    // Dışarı tıklandığında dropdown'ları kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
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

    const toggleNotifications = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
        setShowUserMenu(false);
    };

    const handleMarkAsRead = async (id, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
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

    const handleMarkAllAsRead = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Toplu okundu işareti başarısız:', err);
        }
    };

    const handleNotificationClick = async (notification, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        setShowNotifications(false);

        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleLogout = () => {
        setShowUserMenu(false);
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
        <nav className="navbar bg-primary text-primary-content sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link to="/" className="btn btn-ghost text-xl gap-2">
                        <span>📚</span>
                        <span className="hidden sm:inline">Kütüphane</span>
                    </Link>
                </div>

                {/* Desktop Menu - Orta */}
                <div className="hidden md:flex items-center">
                    <ul className="menu menu-horizontal px-1 gap-1">
                        <li>
                            <Link
                                to="/books"
                                className={location.pathname === '/books' ? 'active' : ''}
                            >
                                📖 Kitaplar
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/stats"
                                className={location.pathname === '/stats' ? 'active' : ''}
                            >
                                📊 İstatistikler
                            </Link>
                        </li>
                        {user?.role === 'admin' && (
                            <li>
                                <Link
                                    to="/admin"
                                    className={location.pathname.startsWith('/admin') ? 'active' : ''}
                                >
                                    ⚙️ Admin
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Sağ Taraf - Bildirimler & User */}
                <div className="flex items-center gap-2">
                    {/* Mobile Menu Button */}
                    <div className="dropdown dropdown-end md:hidden">
                        <label tabIndex={0} className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </label>
                        <ul tabIndex={0} className="menu dropdown-content mt-3 z-[100] p-2 shadow-lg bg-base-100 rounded-box w-52 text-base-content">
                            <li><Link to="/books">📖 Kitaplar</Link></li>
                            <li><Link to="/stats">📊 İstatistikler</Link></li>
                            {user?.role === 'admin' && <li><Link to="/admin">⚙️ Admin</Link></li>}
                        </ul>
                    </div>

                    {/* Bildirimler */}
                    {user && (
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={toggleNotifications}
                                className="btn btn-ghost btn-circle"
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
                            </button>

                            {/* Bildirim Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-base-100 rounded-box shadow-xl z-[100] text-base-content">
                                    {/* Header */}
                                    <div className="p-3 border-b border-base-200 flex items-center justify-between">
                                        <h3 className="font-bold text-base-content">🔔 Bildirimler</h3>
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
                                    <div className="max-h-80 overflow-y-auto">
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
                                            <div>
                                                {notifications.slice(0, 10).map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={(e) => handleNotificationClick(notification, e)}
                                                        className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-base-200 transition-colors border-b border-base-200 last:border-b-0 ${
                                                            !notification.isRead ? 'bg-primary/5' : ''
                                                        }`}
                                                    >
                            <span className="text-2xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                                                        <div className="flex-1 min-w-0">
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
                                                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
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
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                    setShowNotifications(false);
                                }}
                                className="btn btn-ghost btn-circle"
                            >
                                {/* User Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-3 w-56 bg-base-100 rounded-box shadow-xl z-[100] text-base-content">
                                    {/* User Info */}
                                    <div className="p-4 border-b border-base-200">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                    <span className="text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold">{user.name}</p>
                                                <p className="text-xs text-base-content/60">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className={`badge mt-2 ${user.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 Üye'}
                    </span>
                                    </div>

                                    {/* Menu Items */}
                                    <ul className="menu p-2">
                                        <li>
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profilim
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/notifications"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                                Bildirimler
                                                {unreadCount > 0 && (
                                                    <span className="badge badge-error badge-sm">{unreadCount}</span>
                                                )}
                                            </Link>
                                        </li>
                                        {user?.role === 'admin' && (
                                            <li className="md:hidden">
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin Panel
                                                </Link>
                                            </li>
                                        )}
                                    </ul>

                                    {/* Logout */}
                                    <div className="p-2 border-t border-base-200">
                                        <button
                                            onClick={handleLogout}
                                            className="btn btn-ghost btn-sm btn-block text-error justify-start gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Çıkış Yap
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="btn btn-ghost btn-sm">
                                Giriş
                            </Link>
                            <Link to="/register" className="btn btn-accent btn-sm">
                                Kayıt Ol
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
