import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getRating, postRating } from '../../utils/api';
import supabase from '../../lib/supabaseClient';

export default function RatePage() {
  const router = useRouter();
  const { userId } = router.query;
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [fromUser, setFromUser] = useState('');
  const [ratingInfo, setRatingInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setFromUser(user.id);

      if (userId) {
        const rating = await getRating(userId);
        setRatingInfo(rating);
      }
    };
    load();
  }, [userId]);

  const submit = async () => {
    await postRating({ from_user: fromUser, to_user: userId, stars, feedback });
    alert('Thanks for the feedback!');
    router.push('/matches');
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Rate this user</h1>

        {ratingInfo && (
          <p className="mb-4">This user has an average rating of {ratingInfo.average.toFixed(2)} from {ratingInfo.count} ratings.</p>
        )}

        <div className="field">
          <label className="label">Stars</label>
          <input className="input" type="number" min="1" max="5" value={stars} onChange={(e) => setStars(Number(e.target.value))} />
        </div>

        <div className="field">
          <label className="label">Feedback</label>
          <textarea className="textarea" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>

        <button className="button is-primary mt-3" onClick={submit}>Submit</button>
      </div>
    </section>
  );
}
