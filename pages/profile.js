import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Select from 'react-select';
import {
  fetchSkills,
  addSkill,
  getProfile,
  saveProfile,
  fetchRatings,
  recalculateMatches
} from '../utils/api';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarURL, setAvatarURL] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [selectedHave, setSelectedHave] = useState([]);
  const [selectedWant, setSelectedWant] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [notification, setNotification] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const current = localStorage.getItem('theme') || 'light';
    setTheme(current);
  }, []);

  const skillOptions = Array.isArray(allSkills)
    ? allSkills.map(skill => ({ value: skill.id, label: skill.name }))
    : [];

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    setUserId(user.id);

    const profile = await getProfile(user.id);
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setAvatarURL(profile.avatar_url || '');

      const all = profile.skills || [];
      setAllSkills(all);

      const selectedHaveOptions = all.filter(skill =>
        profile.skills_have?.includes(skill.id)
      );
      const selectedWantOptions = all.filter(skill =>
        profile.skills_want?.includes(skill.id)
      );

      setSelectedHave(selectedHaveOptions.map(s => s.id));
      setSelectedWant(selectedWantOptions.map(s => s.id));

      setRatings(profile.entries || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const uploadAvatar = async () => {
    if (!avatarFile || !userId) return avatarURL;
    const ext = avatarFile.name.split('.').pop();
    const filePath = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    if (error) {
      setNotification({ type: 'danger', message: 'Avatar upload failed' });
      return avatarURL;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    const avatar_url = await uploadAvatar();
    try {
      await saveProfile({
        id: userId,
        full_name: fullName,
        bio,
        avatar_url,
        skills_have: selectedHave,
        skills_want: selectedWant,
      });
      await recalculateMatches(userId);
      setNotification({ type: 'success', message: 'Profile saved successfully!' });
    } catch (err) {
      console.error('❌ Failed to save profile:', err);
      setNotification({ type: 'danger', message: 'Error saving profile.' });
    }
  };

  const handleAddCustomSkill = async (e) => {
    e.preventDefault();
    if (!customSkill) return;
  
    try {
      const newSkill = await addSkill(customSkill);
      setNotification({ type: 'success', message: 'Skill added!' });
      setCustomSkill('');
      await fetchData(); // 🔁 Refresh everything (including skills list and selections)
    } catch (error) {
      setNotification({ type: 'danger', message: 'Could not add skill.' });
    }
  };
  
  

  const customSelectStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#2b2b2b' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
      borderColor: theme === 'dark' ? '#555' : '#ccc',
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#2b2b2b' : '#fff',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? theme === 'dark' ? '#4a4a4a' : '#e0e0e0'
        : isFocused
        ? theme === 'dark' ? '#3a3a3a' : '#f0f0f0'
        : 'transparent',
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#444' : '#ddd',
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#fff' : '#000',
      ':hover': {
        backgroundColor: theme === 'dark' ? '#666' : '#bbb',
        color: '#fff',
      },
    }),
  };

  if (loading) return <section className="section">Loading...</section>;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '650px' }}>
        <h1 className="title has-text-centered">Your Profile</h1>

        {notification && (
          <div className={`notification is-${notification.type}`}>
            <button className="delete" onClick={() => setNotification(null)}></button>
            {notification.message}
          </div>
        )}

        {avatarURL && (
          <figure className="image is-128x128 mb-3">
            <img className="is-rounded" src={avatarURL} alt="avatar" />
          </figure>
        )}

        <div className="file has-name is-boxed mb-4">
          <label className="file-label">
            <input className="file-input" type="file" onChange={(e) => setAvatarFile(e.target.files[0])} />
            <span className="file-cta">
              <span className="file-icon">📁</span>
              <span className="file-label">Choose Avatar</span>
            </span>
            {avatarFile && <span className="file-name">{avatarFile.name}</span>}
          </label>
        </div>

        <div className="field">
          <label className="label">Full Name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="field">
          <label className="label">Bio</label>
          <textarea className="textarea" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="field">
          <label className="label">Skills You Can Teach</label>
          <Select
            isMulti
            options={skillOptions}
            styles={customSelectStyles}
            value={skillOptions.filter(opt => selectedHave.includes(opt.value))}
            onChange={(selected) => setSelectedHave(selected.map(s => s.value))}
          />
        </div>

        <div className="field">
          <label className="label">Skills You Want to Learn</label>
          <Select
            isMulti
            options={skillOptions}
            styles={customSelectStyles}
            value={skillOptions.filter(opt => selectedWant.includes(opt.value))}
            onChange={(selected) => setSelectedWant(selected.map(s => s.value))}
          />
        </div>

        <form className="field mt-4" onSubmit={handleAddCustomSkill}>
          <label className="label">Suggest a New Skill</label>
          <div className="field has-addons">
            <div className="control is-expanded">
              <input
                className="input"
                placeholder="e.g., Blockchain, AI Prompting"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
              />
            </div>
            <div className="control">
              <button type="submit" className="button is-link is-small">Add Skill</button>
            </div>
          </div>
        </form>

        <div className="has-text-centered mt-5">
          <button className="button is-primary is-medium" onClick={handleSave}>
            💾 Save Profile
          </button>
        </div>

        <hr className="my-5" />
        <h2 className="title is-4">Received Reviews</h2>

        {ratings.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          ratings.map((r, index) => (
            <article key={index} className="box">
              <p><strong>From:</strong> {r.from_user_email || r.from_user}</p>
              <p><strong>Stars:</strong> {'⭐'.repeat(r.stars)} ({r.stars}/5)</p>
              {r.feedback && <p><strong>Feedback:</strong> {r.feedback}</p>}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
