import { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [theme, setTheme] = useState('light');
  const [selectedUser, setSelectedUser] = useState(null);  // Ensure selectedUser is defined
  const router = useRouter();
  const { chat_id } = router.query; // Get chat_id from URL

  useEffect(() => {
    const loadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Fetch messages for the specific chat
      const res = await fetch(`http://localhost:8000/get_chat_messages/${chat_id}`);
      const data = await res.json();
      setMessages(data);

      // Load theme from local storage
      const localTheme = localStorage.getItem('theme') || 'light';
      setTheme(localTheme);

      // Fetch the selectedUser info (the user you're chatting with)
      const chatRes = await fetch(`http://localhost:8000/get_chat/${chat_id}`);
      const chatData = await chatRes.json();
      const otherUserId = chatData.user1_id === user.id ? chatData.user2_id : chatData.user1_id;
      const userRes = await fetch(`http://localhost:8000/get_user_profile/${otherUserId}`);
      const userData = await userRes.json();
      setSelectedUser(userData);  // Set selectedUser after fetching profile
    };

    if (chat_id) {
      loadMessages();
    }
  }, [chat_id]);

  const handleMessageSend = async () => {
    if (message.trim() === '') return;

    const res = await fetch(`http://localhost:8000/send_message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        sender_id: userId,
        receiver_id: selectedUser.id,  // Now we have selectedUser
        content: message
      })
    });

    const data = await res.json();
    if (data.success) {
      setMessages((prevMessages) => [...prevMessages, { sender_id: userId, content: message, sent_at: new Date().toISOString() }]);
      setMessage('');
    } else {
      console.error('Failed to send message');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 className="title">Chat with {selectedUser ? selectedUser.full_name : 'Loading...'}</h2>

        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender_id === userId ? 'is-primary' : 'is-info'}`}>
            <div className="message-body">
              {msg.content}
            </div>
          </div>
        ))}

        <div className="field">
          <textarea
            className="textarea"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button className="button is-success" onClick={handleMessageSend}>
          Send
        </button>
      </div>
    </section>
  );
}
