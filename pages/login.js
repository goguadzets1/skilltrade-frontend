import { useState } from 'react';
import supabase from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else setSent(true);
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '400px' }}>
        <h1 className="title">Login / Register</h1>
        {sent ? (
          <div className="notification is-success">
            A magic link has been sent to <strong>{email}</strong>. Please check your inbox.
          </div>
        ) : (
          <>
            <div className="field">
              <label className="label">Email</label>
              <div className="control">
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button className="button is-link" onClick={handleLogin}>
              Send Magic Link
            </button>
          </>
        )}
      </div>
    </section>
  );
}
