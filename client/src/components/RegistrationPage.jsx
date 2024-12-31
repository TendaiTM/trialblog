import React, { useState } from 'react';
import axios from 'axios';
import './RegistrationPage.css';
import { useNavigate } from 'react-router-dom';


const RegistrationPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };


  const createUser = async (e) => {
    e.preventDefault(); // Prevent form default submission behavior

    // Client-side validation
    if (!name || !email || !password) {
      setError("All fields are required!");
      setSuccess("");
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and include a letter and a number.');
      setSuccess('');
      return;
    }
    
    try {
      // Sending registration request to the backend
      const response = await axios.post('http://localhost:5000/RegistrationPage', {
        name,
        email,
        password,
      });

      setSuccess(response.data.message || "User created successfully!");
      setError("");
      setName('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        navigate('/Homepage');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Error creating user!");
      setSuccess("");
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={createUser} className="form">
          <div className="input-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
            />
          </div>
      
          <button type="submit" className="button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
