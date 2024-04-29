import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


const socket = io('http://localhost:8081');

function Dashboard() {
    const [username, setUsername] = useState(localStorage.getItem('username')); // Initialize username from local storage
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const  navigate = useNavigate();

    useEffect(() => {
        if (!username) {
            navigate('/login'); // Redirect to login if no username
        }
        const fetchMessages = () => {
            axios.get('http://localhost:8081/messages')
                .then(response => {
                    setMessages(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching messages:', error);
                    setLoading(false);
                });
        };

        fetchMessages();

        socket.on('message', (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

        return () => {
            socket.off('message');
        };
    }, [username, navigate]);

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit('sendMessage', { user_name: username, message, timestamp: new Date().toISOString() });
        setMessage('');
    };

    return (
        <div className="container-d mt-5">
            <div><h1>{username}'s Dashboard</h1></div>
            <div className="card">
                <div className="card-header bg-primary text-white">Chat Room</div>
                <ul className="list-group list-group-flush">
                    {loading ? (
                        <li className="list-group-item">Loading messages...</li>
                    ) : (
                        messages.map((msg, index) => (
                            <li key={index} className="list-group-item">
                                <strong>{msg.user_name}</strong>: {msg.message}
                                <div className="text-muted small">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
                <div className="card-body">
                    <div className="input-group mb-3">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Type your message here..." 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button 
                            className="btn btn-primary" 
                            type="button" 
                            onClick={sendMessage}>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
