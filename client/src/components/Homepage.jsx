import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
              setError('Unauthorized. Please log in.');
              return;
            }

        const response = await axios.get('http://localhost:5000/Homepage',{
            headers: {Authorization:`Bearer ${token}`},
        });

         setPosts(response.data);
      } catch (err) {
        setError('Failed to fetch posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1>Blog App</h1>
        <ul className="nav-links">
          <li>
            <Link to="/Blogpost" className="nav-link">Create Blog Post</Link>
          </li>
        </ul>
      </nav>
  
      {/* Main Content */}
      <h1>All Topics</h1>
      {Object.keys(posts).map((title) => (
        <div key={title} className="topic-section">
          <h2>{title}</h2>
          <ul>
            {posts[title].map((post, index) => (
              <li key={index}>
                <Link to={`/post/${post.id}`} className="post-link">
                  {post.title}
                </Link>
                <p>By {post.author}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
  
};

export default Homepage;
