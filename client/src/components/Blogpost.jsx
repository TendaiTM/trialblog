import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Blogpost.css';

const Blogpost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      if (!token) {
        return setMessage('Unauthorized. Please log in.');
      }

      const response = await axios.post('http://localhost:5000/Blogpost',
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } } // Include token in the header
      );

      setMessage(response.data.message);
      setTitle('');
      setContent('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding post!');
    }
  };

  return (
    <div className= "blogpost">
      <h2>Create a New Post</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            placeholder='Enter your title'
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Post</button>
      </form>
    </div>
  );
};

export default Blogpost;
