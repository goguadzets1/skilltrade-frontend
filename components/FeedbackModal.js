import Modal from 'react-modal';
import { useState, useEffect } from 'react';

Modal.setAppElement('#__next');

export default function FeedbackModal({ isOpen, onRequestClose, onSubmit, theme, match }) {
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStars(5);
      setFeedback('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit({ stars, feedback });
    onRequestClose();
  };

  const customStyles = {
    content: {
      backgroundColor: theme === 'dark' ? '#2b2b2b' : '#ffffff',
      color: theme === 'dark' ? '#fff' : '#000',
      borderRadius: '8px',
      maxWidth: '500px',
      margin: 'auto',
      padding: '2rem',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <h2 className="title is-4">Give Feedback to {match?.full_name}</h2>

      <div className="field">
        <label className="label">Rating</label>
        <div className="control">
          <input
            className="input"
            type="number"
            min={1}
            max={5}
            value={stars}
            onChange={(e) => setStars(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Feedback</label>
        <textarea
          className="textarea"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your experience..."
        />
      </div>

      <div className="buttons mt-4 is-right">
        <button className="button" onClick={onRequestClose}>Cancel</button>
        <button className="button is-primary" onClick={handleSubmit}>Submit</button>
      </div>
    </Modal>
  );
}
