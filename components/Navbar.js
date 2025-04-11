import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('/default-avatar.png');
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (data?.avatar_url) {
        setAvatar(data.avatar_url);
      }
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login').then(() => {
      window.location.reload();
    });
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next); // Update state
  };

  // Use is-light or is-dark based on theme
  const navbarThemeClass = theme === 'dark' ? 'is-dark' : 'is-light';

  return (
    <nav className={`navbar ${navbarThemeClass}`} role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link href="/" className="navbar-item has-text-weight-bold">SkillTrade</Link>

        <button
          className={`navbar-burger ${menuOpen ? 'is-active' : ''}`}
          aria-label="menu"
          aria-expanded="false"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      {user && (
        <div className={`navbar-menu ${menuOpen ? 'is-active' : ''}`}>
          <div className="navbar-start">
            <Link href="/profile" className="navbar-item">Profile</Link>
            <Link href="/matches" className="navbar-item">Matches</Link>
            {/* Add Chat link here */}
            <Link href="/chats" className="navbar-item">
              <i className="fas fa-comment"></i> {/* Chat Icon */}
              <span className="ml-2">Chats</span>
            </Link>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <figure className="image is-32x32 mr-2">
                <img className="is-rounded" src={avatar || '/default-avatar.png'} alt="avatar" />
              </figure>
              <span className="mr-3">Hi, {user.email}</span>

              <button className="button is-small is-danger mr-2" onClick={handleLogout}>
                <span className="icon">🔓</span>
                <span>Logout</span>
              </button>

              <button className="button is-small is-warning" onClick={toggleTheme}>
                <span className="icon">🌓</span>
                <span>{theme === 'light' ? 'Dark' : 'Light'} Theme</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
