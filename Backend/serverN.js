const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

const http = require('http'); //change during websocket implementation
const socketIo = require('socket.io'); //change during websocket implementation

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // Allow only client origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
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
            return res.status(201).json({ message: 'User registered successfully. You may proceed with log in now!!' });
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
                        { userId: user.user_id, name: user.name, username: user.user_name },
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

// Assuming authentication is correctly set up and the user ID is included in the JWT payload
app.get('/available_users', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.userId; // Extract user ID from JWT payload
    // Query to exclude users who are friends (either direction) with the logged-in user
    const query = `
        SELECT u.user_id, u.name, u.user_name 
        FROM user u
        WHERE u.user_id != ?
        AND u.user_id NOT IN (
            SELECT fr.sender_id FROM friend_requests fr WHERE fr.receiver_id = ? AND fr.status = 'accepted'
            UNION
            SELECT fr.receiver_id FROM friend_requests fr WHERE fr.sender_id = ? AND fr.status = 'accepted'
            UNION
            SELECT fr.sender_id FROM friend_requests fr WHERE fr.receiver_id = ? AND fr.status = 'pending'
        )
    `;

    db.query(query, [loggedInUserId, loggedInUserId, loggedInUserId, loggedInUserId], (err, results) => {
        if (err) {
            console.error("Error occurred: ", err);
            return res.status(500).json({ message: 'Error retrieving users', error: err.message });
        }
        return res.json(results);
    });
});

// Fetch received friend requests
app.get('/received_friend_requests', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.userId;

    const query = `
        SELECT fr.request_id, fr.sender_id, fr.sender_name, fr.sender_username, u.name, u.user_name
        FROM friend_requests fr
        JOIN user u ON fr.sender_id = u.user_id
        WHERE fr.receiver_id = ? AND fr.status = 'pending'
    `;
    db.query(query, [loggedInUserId], (err, results) => {
        if (err) {
            console.error("Error occurred retrieving friend requests: ", err);
            return res.status(500).json({ message: 'Error retrieving friend requests', error: err.message });
        }
        res.json(results);
    });
});

// Send Friend request
app.post('/send_friend_request', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.userId;
    const loggedInUserName = req.user.name;
    const loggedInUserUsername = req.user.username;

    console.log(loggedInUserName)
    console.log(loggedInUserUsername)


    const recieverId = req.body.recipientId;
    const query = "INSERT INTO friend_requests (sender_id, sender_name, sender_username, receiver_id) VALUES (?, ?, ?, ?)"
    db.query(query, [loggedInUserId,  loggedInUserName, loggedInUserUsername, recieverId], (err, results) =>{
        if (err) {
            console.error("Error occurred: ", err);
            return res.status(500).json({message: 'Error sending request', error: err.message });
        }
        return res.json(results);
    })

})


//Withdraw friend request
app.post('/withdraw_friend_request', authenticateToken, (req, res) => {
    const recieverId = req.body.recipientId;
    const senderId = req.user.userId; // Extracted from JWT token

    const query = 'DELETE FROM friend_requests WHERE sender_id = ? AND receiver_id = ?';
    db.query(query, [senderId, recieverId], (err, result) => {
        if (err) {
            console.error("Error withdrawing friend request: ", err);
            return res.status(500).json({ message: 'Error withdrawing friend request', error: err.message });
        }
        return res.status(200).json({ message: 'Friend request withdrawn successfully' });
    });
});


// Sent requests
app.get('/sent_friend_requests', authenticateToken, (req, res) => {
    const sender_id = req.user.userId;
    
    const query = `
        SELECT receiver_id FROM friend_requests
        WHERE sender_id = ? AND status = 'pending';
    `;
    db.query(query, [sender_id], (err, results) => {
        if (err) {
            console.error("Error retrieving sent friend requests: ", err);
            return res.status(500).json({ message: 'Error retrieving sent friend requests', error: err.message });
        }
        const receiverIds = results.map(result => result.receiver_id);
        res.json(receiverIds);
    });
});

app.post('/accept-request', authenticateToken, (req, res) => {
    const { requestId } = req.body; // ID of the friend request
    const userId = req.user.userId; // Extracted from JWT token
    const queryGetSender = 'SELECT sender_id FROM friend_requests WHERE request_id = ? AND receiver_id = ? AND status = "pending"';
    db.query(queryGetSender, [requestId, userId], (err, results) => {
        if (err) {
            console.error("Error fetching sender id: ", err);
            return res.status(500).json({ message: 'Error fetching friend request', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Friend request not found or already accepted' });
        }

        const senderId = results[0].sender_id;

    // First, update the friend request status to 'accepted'
    const queryUpdateRequest = 'UPDATE friend_requests SET status = "accepted" WHERE request_id = ? AND receiver_id = ?';
    db.query(queryUpdateRequest, [requestId, userId], (err, result) => {
        if (err) {
            console.error("Error accepting friend request: ", err);
            return res.status(500).json({ message: 'Error accepting friend request', error: err.message });
        }

        if (result.affectedRows > 0) {
                // Assuming the friend request table contains sender_id and receiver_id
                const queryAddFriends = 'INSERT INTO friends (friend_id1, friend_id2) VALUES (?, ?), (?, ?)';
                db.query(queryAddFriends, [senderId, userId, userId, senderId], (err, result) => {
                    if (err) {
                        console.error("Error adding to friends table: ", err);
                        return res.status(500).json({ message: 'Error adding to friends table', error: err.message });
                    }
                    return res.status(200).json({ message: 'Friend request accepted successfully' });
                });
            } else {
                return res.status(404).json({ message: 'Friend request not found or already accepted' });
            }
        });
    });
});

app.post('/decline-request', authenticateToken, (req, res) => {
    const { requestId } = req.body; // ID of the friend request
    const userId = req.user.userId; // Extracted from JWT token
    const queryGetSender = 'SELECT sender_id FROM friend_requests WHERE request_id = ? AND receiver_id = ? AND status = "pending"';
    db.query(queryGetSender, [requestId, userId], (err, results) => {
        if (err) {
            console.error("Error fetching sender id: ", err);
            return res.status(500).json({ message: 'Error fetching friend request', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Friend request not found or already accepted' });
        }

        const senderId = results[0].sender_id;

        // First, update the friend request status to 'accepted'
        const queryUpdateRequest = 'UPDATE friend_requests SET status = "declined" WHERE request_id = ? AND receiver_id = ?';
        db.query(queryUpdateRequest, [requestId, userId], (err, result) => {
            if (err) {
                console.error("Error declining friend request: ", err);
                return res.status(500).json({ message: 'Error declining friend request', error: err.message });
            }

            if (result.affectedRows > 0) {
                return res.status(200).json({ message: 'Friend request declined successfully' });

            }

        });

    });
});


// Get the list of friends for the logged-in user
app.get('/my-friends', authenticateToken, (req, res) => {
    const userId = req.user.userId; // Extracted from JWT token

    const query = `
        SELECT DISTINCT u.user_id, u.name, u.user_name 
        FROM friends f 
        JOIN user u ON u.user_id = f.friend_id1 OR u.user_id = f.friend_id2 
        WHERE (f.friend_id1 = ? OR f.friend_id2 = ?) AND u.user_id != ?;
    `;
    db.query(query, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error("Error retrieving friends: ", err);
            return res.status(500).json({ message: 'Error retrieving friends', error: err.message });
        }
        res.json(results);
    });
});

app.post('/unfriend', authenticateToken, (req, res) => {
    const userId = req.user.userId; // Logged-in user's ID
    const { friendUserId } = req.body; // ID of the friend to remove

    // Start a transaction
    db.beginTransaction(err => {
        if (err) {
            console.error("Error starting transaction: ", err);
            return res.status(500).json({ message: 'Error starting transaction', error: err.message });
        }

        // First, delete from friends
        db.query('DELETE FROM friends WHERE (friend_id1 = ? AND friend_id2 = ?) OR (friend_id1 = ? AND friend_id2 = ?)', 
        [userId, friendUserId, friendUserId, userId], (err, results) => {
            if (err) {
                db.rollback(() => {
                    console.error("Error unfriending: ", err);
                    return res.status(500).json({ message: 'Error unfriending', error: err.message });
                });
            }

            // Then, delete from friend_requests
            db.query('DELETE FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)', 
            [userId, friendUserId, friendUserId, userId], (err, results) => {
                if (err) {
                    db.rollback(() => {
                        console.error("Error deleting friend requests: ", err);
                        return res.status(500).json({ message: 'Error deleting friend requests', error: err.message });
                    });
                }

                // If everything is okay, commit the transaction
                db.commit(err => {
                    if (err) {
                        db.rollback(() => {
                            console.error("Error committing transaction: ", err);
                            return res.status(500).json({ message: 'Error committing transaction', error: err.message });
                        });
                    }
                    return res.json({ message: 'Unfriended successfully' });
                });
            });
        });
    });
});


app.post('/send_message', authenticateToken, async (req, res) => {
    const { text, receiverId } = req.body;
    const senderId = req.user.userId; // Extracted from JWT token decoded in middleware

    try {
        // Fetch both usernames
        const getUserNames = (userId) => {
            return new Promise((resolve, reject) => {
                const query = `SELECT user_name FROM user WHERE user_id = ?`;
                db.query(query, [userId], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results[0].user_name);
                });
            });
        };

        const senderName = await getUserNames(senderId);
        const receiverName = await getUserNames(receiverId);

        // Now insert the message with all details
        const query = `INSERT INTO messages (sender_id, receiver_id, sender_name, receiver_name, message, timestamp) 
                       VALUES (?, ?, ?, ?, ?, NOW())`;
        db.query(query, [senderId, receiverId, senderName, receiverName, text], (err, result) => {
            if (err) {
                console.error('Error sending message:', err);
                return res.status(500).json({ error: 'Database error sending message', details: err.message });
            }
            const insertedMessage = {
                text,
                senderId,
                receiverId,
                senderName,
                receiverName,
                messageId: result.insertId,
                timestamp: new Date()
            };
            io.emit('receiveMessage', insertedMessage);
            res.status(200).json({ message: 'Message sent successfully', message: insertedMessage });
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Failed to fetch user details', details: error.message });
    }
});


app.get('/messages/:username/:friendId/:friendName', authenticateToken, (req, res) => {
    const { username, friendId } = req.params;
    // First, fetch the userId for the logged-in user based on the username
    const getUserIdQuery = `SELECT user_id FROM user WHERE user_name = ?`;

    db.query(getUserIdQuery, [username], (err, results) => {
        if (err) {
            console.error('Error fetching userId:', err);
            return res.status(500).json({ error: 'Database error fetching userId' });
        }
        
        if (results.length > 0) {
            const userId = results[0].user_id;

            // Now fetch messages using the retrieved userId and friendId
            const query = `
                SELECT m.*, u.user_name as senderName
                FROM messages m
                JOIN user u ON u.user_id = m.sender_id
                WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
                ORDER BY timestamp ASC`;
            
            db.query(query, [userId, friendId, friendId, userId], (err, messageResults) => {
                if (err) {
                    console.error('Error fetching messages:', err);
                    return res.status(500).json({ error: 'Database error fetching messages' });
                }
                res.json(messageResults.map(msg => ({
                    ...msg,
                    senderName: msg.sender_id === userId ? 'Me' : msg.senderName,
                    timestamp: new Date(msg.timestamp).toLocaleString(),
                    message  : msg.message
                })));
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    });
});


// WebSocket setup
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('handleSendMessage', (data) => {
        console.log('Message received on server:', data);
        io.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


const port = 8081;
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});










