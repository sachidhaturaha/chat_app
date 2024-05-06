const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const http = require('http'); //change during websocket implementation
const socketIo = require('socket.io'); //change during websocket implementation

const app = express();

app.use(cors({
    origin: "http://localhost:3000",  // Allow only client origin 
    methods: ["GET", "POST"]          // Allowed request methods
  }));


const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",  // Specify allowed origin
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

  
app.use(bodyParser.json());  // To parse JSON bodies


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat_app'
});


app.get('/', (req, res) => {
    return res.json({message: 'Hello World, this is the server for chat app!'});
});


app.get('/users', (req, res) => {
    const query = "SELECT * FROM user"
    db.query(query, (err, results) => {
        if (err) throw err;
        return res.json(results);
    });
});

// Handle user registration
app.post('/register', async (req, res) => {  // Make the main function async
    const { fullname, user_name, email, password } = req.body;
    if (!fullname || !user_name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO user (name, user_name, email, password) VALUES (?, ?, ?, ?)';
        db.query(query, [fullname, user_name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error occurred: ", err);
                return res.status(500).json({ message: 'Error registering user', error: err.message });
            }
            return res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        return res.status(500).json({ message: 'Error processing your request', error: error.message });
    }
});

// Handle user login
app.post('/login', (req, res) => {
    const { user_name, password } = req.body;
    if (!user_name || !password) {
        return res.status(400).json({ message: 'Both username and password are required' });
    }
    const query = 'SELECT * FROM user WHERE user_name = ?';

    db.query(query, [user_name], (err, results) => {
        if (err) {
            console.error("Error occurred: ", err);
            return res.status(500).json({ message: 'Error logging in', error: err.message });
        }
        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(password, user.password, (err, result) => {
            console.log("Password matched? :", result, err);
            

                if (result) {
                    const token = jwt.sign(
                        { userId: user.id, username: user.user_name },
                        '1234@5678', 
                        { expiresIn: '1y' } 
                    );
                    return res.status(200).json({ message: 'Login successful', user: user, token: token });
                } else {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, '1234@5678', (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
};

// Use this middleware in routes that require authentication
app.get('/protectedRoute', authenticateToken, (req, res) => {
    res.json({ message: "You're authenticated" });
});


// Get all messages
app.get('/messages', (req, res) => {
    db.query('SELECT * FROM messages ORDER BY timestamp ASC', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving messages', error: err.message });
        }
        res.json(results);
    });
});

// Post a new message
app.post('/messages', (req, res) => {
    const { user_name, message } = req.body;
    if (!message || !user_name) {
        return res.status(400).json({ message: 'Message and username are required' });
    }
    db.query('INSERT INTO messages (user_name, message) VALUES (?, ?)', [user_name, message], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error posting message', error: err.message });
        }
        res.status(201).json({ message: 'Message posted successfully' });
    });
});

// WebSocket setup
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sendMessage', data => {
        console.log('Message received:', data);  // Log received message
        db.query('INSERT INTO messages (user_name, message) VALUES (?, ?)', [data.user_name, data.message], (err, result) => {
            if (err) {
                console.error('Error posting message:', err);
            } else {
                io.emit('message', data); // Emit the message to all clients
                console.log('Message sent to all clients:', data);
            }
        });
    });
    
    
    

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


const port = 8081;
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});










