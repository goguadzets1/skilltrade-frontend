import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabaseClient';

export default function RateUser() {
  const router = useRouter();
  const { userId } = router.query;
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    };
    checkAuth();
  }, []);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('ratings').insert({
      from_user: user.id,
      to_user: userId,
      stars,
      feedback
    });

    if (error) alert(error.message);
    else {
      alert('Thanks for the rating!');
      router.push('/matches');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 className="title">Rate This User</h2>
        <div className="field">
          <label className="label">Stars (1–5)</label>
          <input
            className="input"
            type="number"
            min="1"
            max="5"
            value={stars}
            onChange={(e) => setStars(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label className="label">Feedback</label>
          <textarea className="textarea" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>
        <button className="button is-success mt-4" onClick={handleSubmit}>Submit Rating</button>
      </div>
    </section>
  );
}
