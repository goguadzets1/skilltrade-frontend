import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const skillsWant = myProfile.skills_want || [];

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .filter('skills_have', 'cs', `{${skillsWant.join(',')}}`);

      setMatches(data.filter(p => p.id !== user.id));
      setLoading(false);
    };
    fetchMatches();
  }, []);

  if (loading) return <p className="section">Loading...</p>;

  return (
    <section className="section">
      <div className="container">
        <h2 className="title">Matching Profiles</h2>
        {matches.map(profile => (
          <div key={profile.id} className="box">
            <p><strong>Name:</strong> {profile.full_name}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
            <p><strong>Skills:</strong> {profile.skills_have.join(', ')}</p>
            <Link href={`/rate/${profile.id}`} className="button is-small is-link mt-2">Rate</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
