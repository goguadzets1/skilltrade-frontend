// const BASE_API = 'https://skilltrade-backend-3wy5.onrender.com';
// const BASE_API = 'https://skilltrade-backend-3wy5.onrender.com';
const BASE_API = 'http://localhost:8000';

export const fetchMatches = async (userId) => {
  const res = await fetch(`${BASE_API}/match/${userId}`);
  return await res.json();
};

export const fetchSkills = async () => {
  try {
    const res = await fetch(`${BASE_API}/skills`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('❌ Failed to fetch skills:', err);
    return [];
  }
};

export const addSkill = async (name) => {
  const res = await fetch(`${BASE_API}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return await res.json();
};

export const postRating = async (data) => {
  const res = await fetch(`${BASE_API}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const getProfile = async (userId) => {
  try {
    const res = await fetch(`${BASE_API}/rating/${userId}`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('❌ Error fetching profile with ratings:', err);
    return null;
  }
};

export const saveProfile = async (profileData) => {
  const res = await fetch(`${BASE_API}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  return await res.json();
};


export const recalculateMatches = async (userId) => {
    const res = await fetch(`${BASE_API}/recalculate-matches/${userId}`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error('Failed to recalculate matches');
    }
    return await res.json();
  };
  