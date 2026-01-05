import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="navbar bg-primary text-primary-content shadow-lg sticky top-0 z-50">
            <div className="container mx-auto">
                {/* Logo */}
                <div className="flex-1">
                    <Link to="/" className="btn btn-ghost text-xl gap-2">
                        <span className="text-2xl">📚</span>
                        <span className="hidden sm:inline">Kütüphane</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex flex-none">
                    <ul className="menu menu-horizontal px-1 gap-1">
                        <li>
                            <Link to="/" className={isActive('/') ? 'active' : ''}>
                                Ana Sayfa
                            </Link>
                        </li>
                        <li>
                            <Link to="/books" className={isActive('/books') ? 'active' : ''}>
                                Kitaplar
                            </Link>
                        </li>
                        {isAdmin() && (
                            <li>
                                <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                                    ⚙️ Admin
                                </Link>
                            </li>
                        )}
                    </ul>

                    {/* Auth Section */}
                    {user ? (
                        <div className="dropdown dropdown-end ml-2">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                                <div className="bg-neutral text-neutral-content w-10 rounded-full">
                                    <span>{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu dropdown-content bg-base-100 text-base-content rounded-box z-[1] w-52 p-2 shadow mt-2">
                                <li className="menu-title">
                                    <span>{user.name}</span>
                                </li>
                                <li><span className="text-xs opacity-60">{user.email}</span></li>
                                <div className="divider my-1"></div>
                                <li>
                                    <button onClick={handleLogout} className="text-error">
                                        🚪 Çıkış Yap
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="flex gap-2 ml-2">
                            <Link to="/login" className="btn btn-ghost btn-sm">
                                Giriş
                            </Link>
                            <Link to="/register" className="btn btn-accent btn-sm">
                                Kayıt Ol
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="flex-none md:hidden">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </div>
                        <ul tabIndex={0} className="menu dropdown-content bg-base-100 text-base-content rounded-box z-[1] w-52 p-2 shadow mt-2">
                            <li><Link to="/">🏠 Ana Sayfa</Link></li>
                            <li><Link to="/books">📚 Kitaplar</Link></li>
                            {isAdmin() && <li><Link to="/admin">⚙️ Admin Panel</Link></li>}
                            <div className="divider my-1"></div>
                            {user ? (
                                <>
                                    <li className="menu-title"><span>{user.name}</span></li>
                                    <li><button onClick={handleLogout} className="text-error">🚪 Çıkış</button></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/login">Giriş Yap</Link></li>
                                    <li><Link to="/register">Kayıt Ol</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
