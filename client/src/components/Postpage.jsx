import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Postpage.css';

const Postpage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized. Please log in.');
          return;
        }

        const response = await axios.get(`http://localhost:5000/post/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPost(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching post!');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="post-page">
      <h1>{post.title}</h1>
      <p><strong>By {post.author}</strong></p>
      <p><em>{new Date(post.created_at).toLocaleString()}</em></p>
      <div className="post-content">{post.content}</div>
      <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
    </div>
  );
};

export default Postpage;
