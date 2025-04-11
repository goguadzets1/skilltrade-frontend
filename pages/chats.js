import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function ChatList() {
  const [userId, setUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  useEffect(() => {
    const loadChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Fetch chats for the current user
      const res = await fetch(`http://localhost:8000/get_user_chats/${user.id}`);
      const data = await res.json();
      setChats(data);

      // Load theme from local storage
      const localTheme = localStorage.getItem('theme') || 'light';
      setTheme(localTheme);
    };

    loadChats();
  }, []);

  const handleChatClick = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <section className="section">
      <div className="container">
        <h2 className="title">Your Chats</h2>

        {chats.length === 0 && <p>No chats yet.</p>}

        {chats.map((chat) => (
          <div key={chat.chat_id} className="box">
            <article className="media">
              <div className="media-content">
                <div className="content">
                  <p>
                    <strong>Chat with {chat.user1_id === userId ? chat.user2_name : chat.user1_name}</strong>
                    <br />
                    Last message: {chat.last_message || 'No messages yet.'}
                  </p>
                  <button
                    className="button is-small is-info"
                    onClick={() => handleChatClick(chat.chat_id)}
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
