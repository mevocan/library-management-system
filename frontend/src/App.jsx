import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Notifications from './pages/Notifications';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Authors from './pages/admin/Authors';
import Categories from './pages/admin/Categories';
import BookForm from './pages/admin/BookForm';
import BookList from './pages/admin/BookList';
import AdminBorrowings from './pages/admin/Borrowings';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-base-100">
                    <Navbar />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/books" element={<Books />} />
                        <Route path="/books/:id" element={<BookDetail />} />
                        <Route path="/stats" element={<Stats />} />


                        {/* Protected Routes */}
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <PrivateRoute>
                                    <Notifications />
                                </PrivateRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <PrivateRoute adminOnly>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/authors"
                            element={
                                <PrivateRoute adminOnly>
                                    <Authors />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/categories"
                            element={
                                <PrivateRoute adminOnly>
                                    <Categories />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/books"
                            element={
                                <PrivateRoute adminOnly>
                                    <BookList />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/books/new"
                            element={
                                <PrivateRoute adminOnly>
                                    <BookForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/books/edit/:id"
                            element={
                                <PrivateRoute adminOnly>
                                    <BookForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/borrowings"
                            element={
                                <PrivateRoute adminOnly>
                                    <AdminBorrowings />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
