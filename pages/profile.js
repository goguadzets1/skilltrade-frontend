import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [skillsHave, setSkillsHave] = useState('');
  const [skillsWant, setSkillsWant] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarURL, setAvatarURL] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setSkillsHave((profile.skills_have || []).join(', '));
        setSkillsWant((profile.skills_want || []).join(', '));
        setAvatarURL(profile.avatar_url || '');
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const uploadAvatar = async () => {
    if (!avatarFile || !userId) return avatarURL;

    const ext = avatarFile.name.split('.').pop();
    const filePath = `avatars/${userId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      alert('Failed to upload avatar');
      return avatarURL;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    const avatar_url = await uploadAvatar();

    const updates = {
      id: userId,
      full_name: fullName,
      bio,
      skills_have: skillsHave.split(',').map((s) => s.trim()),
      skills_want: skillsWant.split(',').map((s) => s.trim()),
      avatar_url
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) alert(error.message);
    else alert('Profile saved!');
  };

  if (loading) return <section className="section">Loading...</section>;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 className="title">Your Profile</h1>

        {avatarURL && (
          <div className="mb-4">
            <img src={avatarURL} alt="avatar" style={{ height: 100, borderRadius: '50%' }} />
          </div>
        )}

        <div className="field">
          <label className="label">Full Name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="field">
          <label className="label">Bio</label>
          <textarea className="textarea" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="field">
          <label className="label">Skills You Have</label>
          <input
            className="input"
            placeholder="e.g., Guitar, Swimming"
            value={skillsHave}
            onChange={(e) => setSkillsHave(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Skills You Want</label>
          <input
            className="input"
            placeholder="e.g., Coding, Piano"
            value={skillsWant}
            onChange={(e) => setSkillsWant(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Avatar (Optional)</label>
          <input type="file" onChange={(e) => setAvatarFile(e.target.files[0])} />
        </div>

        <button className="button is-primary mt-4" onClick={handleSave}>Save Profile</button>
      </div>
    </section>
  );
}
