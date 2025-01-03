require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2'); 
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

    app.use(cors());
    app.use(express.json());

    // MySQL connection
    const db = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE
      });

      // Register route
    app.post('/RegistrationPage', async (req, res) => {
      const sentName = req.body.name;
      const sentEmail = req.body.email;
      const sentPassword = req.body.password;

      try {
        // Hash the password before saving it to the database
        const saltRounds = 10; // Adjust this value based on your security needs
        const hashedPassword = await bcrypt.hash(sentPassword, saltRounds);
        let name = req.body.name; // Example of defining `name`


        const SQL = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        const Values = [sentName, sentEmail, hashedPassword];

        db.query(SQL, Values, (err, results) => {
          if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).send({ message: 'Internal server error' });
          }

           // Generate a JWT token
          const token = jwt.sign({ email: sentEmail }, process.env.JWT_SECRET, {
            expiresIn: '1h',
          });

          console.log('User Inserted successfully');
          return res.status(200).send({
            message: 'User created successfully!',
            token,
            });
        });
      } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    // Login route
    app.post('/LoginPage', (req, res) => {
      const sentEmail = req.body.email;
      const sentPassword = req.body.password;

      // SQL query to find user by email
      const SQL = `SELECT * FROM users WHERE email = ?`;
      const Values = [sentEmail];

      db.query(SQL, Values, async (err, results) => {
        if (err) {
          console.error('Error during database query:', err);
          return res.status(500).send({ message: 'Internal server error' });
        }

        if (results.length > 0) {
          // Compare password
          const isMatch = await bcrypt.compare(sentPassword, results[0].password);
          if (isMatch) {
            const token = jwt.sign({ id: results[0].id, email: results[0].email },process.env.JWT_SECRET, { expiresIn:process.env.JWT_EXPIRES_IN } 
            );
            

            console.log('Login successful:', results[0].email);
            return res.status(200).send({ message: 'Login successful',token});
          } else {
            return res.status(401).send({ message: 'Invalid email or password' });
          }
        } else {
          return res.status(401).send({ message: 'Invalid email or password' });
        }
      });
    });

    // Middleware to verify token
    const verifyToken = (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer TOKEN"
      
      // Check if token exists
      if (!token) {
        return res.status(401).send({ message: 'Access denied. No token provided.' });
      }
    
      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request
        next(); // Proceed to the next middleware or route handler
      } catch (err) {
        return res.status(403).send({ message: 'Invalid token' });
      }
    };

    // Homepage Posts Route
    app.get('/Homepage', verifyToken, (req, res) => {
      const query = 'SELECT id, title, content, author, created_at FROM posts ORDER BY created_at DESC';
      
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching posts:', err);
          return res.status(500).json({ message: 'Error fetching posts!' });
        }
    
        // Group posts by title
        const groupedPosts = results.reduce((acc, post) => {
          if (!acc[post.title]) {
            acc[post.title] = [];
          }
          acc[post.title].push(post);
          return acc;
        }, {});
    
        res.status(200).json(groupedPosts);
      });
    });
    
    //Blog Post Route
    app.post('/Blogpost',verifyToken, (req, res) => {
      const { title, content} = req.body;
      const author = req.user.email;

      if (!title || !content || !author) {
        return res.status(400).json({ message: 'All fields are required!' });
      }

      const query = 'INSERT INTO posts (title, content, author, created_at) VALUES (?, ?, ?, NOW())';
      db.query(query, [title, content, author], (err, result) => {
        if (err) {
          console.error('Error adding post:', err);
          return res.status(500).json({ message: 'Error adding post!' });
        }
        res.status(200).json({ message: 'Post added successfully!' });
      });
    });

    //Postpage route 
    app.get('/post/:id', verifyToken, (req, res) => {
      const postId = req.params.id;
      console.log('Post ID:', postId);
    
      const query = 'SELECT id, title, content, author, created_at FROM posts WHERE id = ?';
      db.query(query, [postId], (err, results) => {
        if (err) {
          console.error('Error fetching post:', err);
          return res.status(500).json({ message: 'Error fetching post!' });
        }
    
        if (results.length === 0) {
          return res.status(404).json({ message: 'Post not found!' });
        }
    
        res.status(200).json(results[0]);
      });
    });
    

    //Route to Post Comments
    app.post('/comments', verifyToken, (req, res) => {
      const { post_id, content } = req.body;
      const user_id = req.user.id; // Get the logged-in user’s ID from the token
    
      if (!post_id || !content) {
        return res.status(400).json({ message: 'Post ID and content are required' });
      }
    //
      const query = 'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)';
      db.query(query, [post_id,user_id, content, new Date()], (err, result) => {
        if (err) {
          console.error('Error adding comment:', err);
          return res.status(500).json({ message: 'Error adding comment' });
        }
        res.status(200).json({ message: 'Comment added successfully' });
      });
    });
    
    //Route to Fetch Comments
    app.get('/post/:id/comments', (req, res) => {
      const postId = req.params.id;
    
      const query = 'SELECT comments.id, comments.content, comments.created_at, users.name AS author FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ? ORDER BY comments.created_at DESC';
      db.query(query, [postId], (err, results) => {
        if (err) {
          console.error('Error fetching comments:', err);
          return res.status(500).json({ message: 'Error fetching comments' });
        }
    
        res.status(200).json(results); // Return the comments
      });
    });
    



  const PORT = 5000;
  app.listen(PORT,() => console.log(`Server running on http://localhost:${PORT}`))