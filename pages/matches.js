import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from next/router
import supabase from '../lib/supabaseClient';
import { postRating } from '../utils/api';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [theme, setTheme] = useState('light');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [notification, setNotification] = useState(null);
  const [chats, setChats] = useState([]);

  const router = useRouter(); // Use the router here

  useEffect(() => {
    const loadMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const res = await fetch(`https://skilltrade-backend-3wy5.onrender.com/match/${user.id}`);
      const data = await res.json();
      setMatches(data);

      const localTheme = localStorage.getItem('theme') || 'light';
      setTheme(localTheme);
    };

    loadMatches();
  }, []);

  const loadChats = async () => {
    const res = await fetch(`https://skilltrade-backend-3wy5.onrender.com/get_user_chats/${userId}`);
    const data = await res.json();
    setChats(data);
  };

  const openModal = (match) => {
    setSelectedUser(match);
    setRating(5);
    setFeedback('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      await postRating({
        from_user: userId,
        to_user: selectedUser.matched_user_id,
        stars: rating,
        feedback: feedback,
      });
      setNotification({ type: 'success', message: 'Feedback submitted!' });
      closeModal();

      const res = await fetch(`https://skilltrade-backend-3wy5.onrender.com/match/${userId}`);
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error('❌ Failed to submit feedback:', err);
      setNotification({ type: 'danger', message: 'Could not submit feedback.' });
    }
  };

  const handleChat = async (match) => {
    const existingChat = chats.find(
      (chat) =>
        chat.user1_id === match.matched_user_id || chat.user2_id === match.matched_user_id
    );
    
    if (!existingChat) {
      // Create a new chat if it doesn't exist
      const response = await fetch("https://skilltrade-backend-3wy5.onrender.com/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1_id: userId,
          user2_id: match.matched_user_id,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        // Chat created successfully, navigate to chat page
        setChats((prevChats) => [...prevChats, responseData]);
        setNotification({ type: 'success', message: 'Chat created!' });
        router.push(`/chat/${responseData.id}`); // Navigate to the chat page
      } else {
        setNotification({ type: 'danger', message: 'Failed to create chat.' });
      }
    } else {
      // If chat exists, navigate to chat page
      router.push(`/chat/${existingChat.chat_id}`);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 className="title">Your Matches</h2>

        {notification && (
          <div className={`notification is-${notification.type}`}>
            <button className="delete" onClick={() => setNotification(null)}></button>
            {notification.message}
          </div>
        )}

        {matches.map((match) => (
          <div key={match.id} className="box">
            <article className="media">
              {match.matched_user_avatar && (
                <figure className="media-left">
                  <p className="image is-64x64">
                    <img className="is-rounded" src={match.matched_user_avatar} alt="avatar" />
                  </p>
                </figure>
              )}
              <div className="media-content">
                <div className="content">
                  <p>
                    <strong>{match.matched_user_name}</strong>
                    <br />
                    Matched on: {new Date(match.matched_on).toLocaleString()}
                  </p>

                  {match.matched_skills && (
                    <p><strong>Matched Skills:</strong> {match.matched_skills}</p>
                  )}

                  {match.existing_rating ? (
                    <>
                      <p><strong>⭐ You rated:</strong> {match.existing_rating}/5</p>
                      {match.existing_feedback && (
                        <p><strong>Feedback:</strong> {match.existing_feedback}</p>
                      )}
                    </>
                  ) : (
                    <button className="button is-small is-info mt-2" onClick={() => openModal(match)}>
                      Rate
                    </button>
                  )}

                  {/* Chat Icon */}
                  <button
                    className="button is-small is-primary mt-2"
                    onClick={() => handleChat(match)}
                  >
                    Chat
                  </button>
                </div>
              </div>
            </article>
          </div>
        ))}

        {modalOpen && selectedUser && (
          <div className="modal is-active">
            <div className="modal-background" onClick={closeModal}></div>
            <div className={`modal-card ${theme === 'dark' ? 'has-background-dark has-text-light' : ''}`}>
              <header className="modal-card-head">
                <p className="modal-card-title">Rate {selectedUser.matched_user_name}</p>
                <button className="delete" aria-label="close" onClick={closeModal}></button>
              </header>
              <section className="modal-card-body">
                <div className="field">
                  <label className="label">Rating</label>
                  <div className="control">
                    <div className="select">
                      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        {[5, 4, 3, 2, 1].map((val) => (
                          <option key={val} value={val}>
                            {val} Star{val !== 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label">Feedback</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      placeholder="Write a comment..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </section>
              <footer className="modal-card-foot">
                <button className="button is-success" onClick={handleSubmit}>
                  Submit
                </button>
                <button className="button" onClick={closeModal}>
                  Cancel
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
