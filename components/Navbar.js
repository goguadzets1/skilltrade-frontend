import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  const toggleTheme = () => {
    const current = localStorage.getItem('theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };
  
  return (
    <nav className="navbar is-light">
      <div className="navbar-brand">
        <Link href="/" className="navbar-item has-text-weight-bold">SkillTrade</Link>
      </div>
      {user && (
        <div className="navbar-menu">
          <div className="navbar-start">
            <Link href="/profile" className="navbar-item">Profile</Link>
            <Link href="/matches" className="navbar-item">Matches</Link>
          </div>
          <div className="navbar-end">
            <div className="navbar-item">Hi, {user.email}</div>
            <button className="button is-danger ml-2" onClick={handleLogout}>Logout</button>
            <button className="button is-warning ml-2" onClick={toggleTheme}>Toggle Theme</button>

          </div>
        </div>
      )}
    </nav>
  );
}
