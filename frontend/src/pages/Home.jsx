import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="hero min-h-[70vh] bg-gradient-to-br from-primary to-secondary text-primary-content">
                <div className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Kütüphane Yönetim
                            <span className="block text-accent">Sistemi</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-8 opacity-90">
                            Kitaplarınızı kolayca yönetin, keşfedin ve organize edin.
                            Modern ve kullanıcı dostu arayüz ile kütüphanenizi dijitalleştirin.
                        </p>

                        {!user ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register" className="btn btn-accent btn-lg gap-2">
                                    🚀 Hemen Başla
                                </Link>
                                <Link to="/books" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary">
                                    📖 Kitapları Keşfet
                                </Link>
                            </div>
                        ) : (
                            <div className="card bg-white/10 backdrop-blur">
                                <div className="card-body items-center">
                                    <h2 className="card-title text-2xl">Hoş geldin, {user.name}! 👋</h2>
                                    <p className="opacity-80">
                                        {user.role === 'admin'
                                            ? 'Admin panelinizden kütüphaneyi yönetebilirsiniz.'
                                            : 'Kitapları keşfetmeye başlayabilirsiniz.'}
                                    </p>
                                    <div className="card-actions mt-4">
                                        <Link
                                            to={user.role === 'admin' ? '/admin' : '/books'}
                                            className="btn btn-accent"
                                        >
                                            {user.role === 'admin' ? '⚙️ Admin Paneli' : '📚 Kitapları Keşfet'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Özellikler</h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Kütüphane yönetimini kolaylaştıran modern özellikler
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature Cards */}
                        {[
                            { icon: '📚', title: 'Kitap Koleksiyonu', desc: 'Tüm kitaplarınızı tek bir yerden yönetin', color: 'primary' },
                            { icon: '✍️', title: 'Yazar Yönetimi', desc: 'Yazarları ve eserlerini kolayca takip edin', color: 'secondary' },
                            { icon: '🏷️', title: 'Kategori Sistemi', desc: 'Kitapları kategorilere ayırın ve filtreleyin', color: 'accent' },
                            { icon: '🔍', title: 'Gelişmiş Arama', desc: 'Kitap veya yazar adına göre hızlı arama', color: 'info' },
                            { icon: '🔐', title: 'Güvenli Erişim', desc: 'JWT tabanlı kimlik doğrulama sistemi', color: 'success' },
                            { icon: '📱', title: 'Responsive Tasarım', desc: 'Her cihazda mükemmel görünüm', color: 'warning' },
                        ].map((feature, index) => (
                            <div key={index} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="card-body">
                                    <div className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center text-3xl mb-2`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="card-title">{feature.title}</h3>
                                    <p className="text-base-content/70">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                        <div className="stat">
                            <div className="stat-figure text-primary text-3xl">📚</div>
                            <div className="stat-title">Kitaplar</div>
                            <div className="stat-value text-primary">∞</div>
                            <div className="stat-desc">Sınırsız kitap ekleyin</div>
                        </div>
                        <div className="stat">
                            <div className="stat-figure text-secondary text-3xl">✍️</div>
                            <div className="stat-title">Yazarlar</div>
                            <div className="stat-value text-secondary">∞</div>
                            <div className="stat-desc">Tüm yazarlarınız</div>
                        </div>
                        <div className="stat">
                            <div className="stat-figure text-accent text-3xl">🏷️</div>
                            <div className="stat-title">Kategoriler</div>
                            <div className="stat-value text-accent">∞</div>
                            <div className="stat-desc">Esnek kategorilendirme</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            {!user && (
                <div className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-content">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Hemen Başlayın</h2>
                        <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                            Ücretsiz hesap oluşturun ve kütüphanenizi dijitalleştirmeye başlayın.
                        </p>
                        <Link to="/register" className="btn btn-accent btn-lg">
                            Ücretsiz Kayıt Ol →
                        </Link>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="footer footer-center p-10 bg-neutral text-neutral-content">
                <aside>
                    <p className="text-lg font-bold">📚 Kütüphane Yönetim Sistemi</p>
                    <p>CENG 307 Dönem Projesi © 2024</p>
                </aside>
            </footer>
        </div>
    );
};

export default Home;
