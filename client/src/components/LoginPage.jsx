import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !password) {
      setError("Both fields are required!");
      setSuccess("");
      return;
    }

    setIsLoading(true);
    
    try {
      // Sending login request to backend
      const response = await axios.post("http://localhost:5000/LoginPage", {
        email,
        password,
      });

      // On successful login, store the token and redirect
      const { token } = response.data;
      localStorage.setItem('token', token); // Store token in local storage


      setSuccess(response.data.message);
      setError("");
      setEmail('');
      setPassword('');

      // Navigate to the Homepage
      navigate("/Homepage"); 
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials!");
      setSuccess("");
    }finally{
      setIsLoading(false)
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/RegistrationPage");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
            />
          </div>
          <button type="submit" className="button" disabled={isLoading} > {isLoading ? "Loading..." : "Login"}
          </button>
        </form>
        <button onClick={handleRegisterRedirect} className="button-register">
          Don't have an account? Register here
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
