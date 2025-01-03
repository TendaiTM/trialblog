import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Postpage.css';

const Postpage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized. Please log in.');
          return;
        }

        // Fetch post details
        const postResponse = await axios.get(`http://localhost:5000/post/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(postResponse.data);

        // Fetch comments for the post
        const commentsResponse = await axios.get(`http://localhost:5000/post/${id}/comments`);
        setComments(commentsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching post or comments!');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError('');

    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized. Please log in.');
        return;
      }

      await axios.post(
        `http://localhost:5000/comments`,
        { post_id: id, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reload comments after successful post
      const commentsResponse = await axios.get(`http://localhost:5000/post/${id}/comments`);
      setComments(commentsResponse.data);
      setNewComment('');
      setShowCommentForm(false); // Hide the comment form after submission
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Error posting comment!');
    }
  };

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
      <div className="post-header">
        <h1>{post.title}</h1>
      </div>
      <p><strong>By {post.author}</strong></p>
      <p><em>{new Date(post.created_at).toLocaleString()}</em></p>
      <div className="post-content">{post.content}</div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Comments</h2>
        {comments.length > 0 ? (
          <ul className="comments-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment">
                <p><strong>{comment.author}</strong></p>
                <p>{comment.content}</p>
                <p><em>{new Date(comment.created_at).toLocaleString()}</em></p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        {/* Toggle Comment Form */}
        <button 
          onClick={() => setShowCommentForm((prev) => !prev)} 
          className="toggle-comment-form-button"
        >
          {showCommentForm ? 'Cancel' : 'Write a Comment'}
        </button>

        {showCommentForm && (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            className="comment-input"
          />
          {commentError && <p className="error">{commentError}</p>}
          <button type="submit" className="submit-button">Post Comment</button>
        </form>
        )}
      </div>

      <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
    </div>
  );
};

export default Postpage;
