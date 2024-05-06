import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// Assuming the server and client are running on localhost
const socket = io('http://localhost:8081');

function Chatwindow({ friendId, friendName }) {
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    friendId = localStorage.getItem('friendId')
    friendName = localStorage.getItem('friendName');

    
    useEffect(() => {

        const fetchMessages = () => {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            axios.get(`http://localhost:8081/messages/${username}/${friendId}/${friendName}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                console.log('Messages fetched:', response.data);  // Check what's being returned
                setMessages(response.data);
            })
            .catch(error => {
                console.error('Error fetching messages:', error);
            });
        };
    
        fetchMessages();
        socket.on('receiveMessage', message => {
            console.log('Message received via WebSocket:', message);
            if (message.senderId === parseInt(friendId) || message.receiverId === parseInt(friendId)) {
                setMessages(prevMessages => [...prevMessages, {
                    ...message,
                    senderName: message.sendername === parseInt(localStorage.getItem('username')) ? 'Me' : friendName,
                    message: message.text, // Ensure you are using the correct field for the message text
                    timestamp: new Date(message.timestamp).toLocaleString()
                }]);
            }
        });
        

        // Clean up on unmount
        return () => {
            socket.off('receiveMessage');
        };
    }, [friendId]);
    

    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const token = localStorage.getItem('token');
        const sendername = localStorage.getItem('username'); // Assuming userID is stored after login
    
        const messageData = {
            sendername: sendername,
            friendName: friendName,
            receiverId: friendId,
            message: newMessage,
            senderName: 'Me', 
            timestamp: new Date().toLocaleString() 
        };
    
        // Optimistically update UI
        setMessages(prev => [...prev, messageData]);
        
        setNewMessage('');
    
        // Send the new message to the server
        axios.post('http://localhost:8081/send_message', {
            text: newMessage,
            receiverId: friendId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            socket.emit('sendMessage', response.data.message); // Emitting the message might be redundant if server does it
        })
        .catch(error => {
            console.error('Error sending message:', error);
            // Optionally handle message send failure (e.g., remove message from UI)
        });
    };
    
    return (
        <div className='container mt-5'>
        <h2>Chat with {friendName}</h2>
        <div>
        {messages.map((msg, index) => (
    <div className="card my-2" key={index}>
        <div className="card-body">
            <h4 className="card-title">{msg.senderName}</h4>
            <h6 className="card-subtitle mb-2 text-muted">{msg.timestamp}</h6>
            <p className="card-text">{msg.message}</p> 
        </div>
    </div>
))}

        </div>
        <form onSubmit={handleSendMessage}>
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary mt-3">Send</button>
            </div>
        </form>
    </div>
);
}

export default Chatwindow;
