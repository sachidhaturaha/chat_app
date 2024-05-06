import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PeopleOnChatApp() {
    const [users, setUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState(new Set()); // Using a Set to track sent requests

    useEffect(() => {
        const token = localStorage.getItem('token'); // Ensure the token is being retrieved correctly
        if (!token) {
            console.log('No token found');
            return;
        }

            
    
        axios.get('http://localhost:8081/available_users', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setUsers(response.data);
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });

        // Fetch sent friend requests
    axios.get('http://localhost:8081/sent_friend_requests', {
        headers: { 
            Authorization: `Bearer ${token}`
         }
    }).then(response => {
        const sentRequestSet = new Set(response.data);
        setSentRequests(sentRequestSet);
    })
    .catch(error => {
        console.error('Error fetching sent friend requests:', error);
    });

    }, []);
    

    function sendFriendRequest(userId) {
        axios.post('http://localhost:8081/send_friend_request', {
            recipientId: userId
            
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            alert('Friend request sent!');
            setSentRequests(new Set([...sentRequests, userId])); // Add this user ID to the sent requests set
            
            // Optionally update the UI to reflect the change
        })
        .catch(error => {
            console.error('Error sending friend request:', error);
        });
    }


    function withdrawFriendRequest(userId) {
        axios.post('http://localhost:8081/withdraw_friend_request', {
            recipientId: userId
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            alert('Friend request withdrawn!');
            setSentRequests(new Set([...sentRequests].filter(id => id !== userId))); // Remove this user ID from the sent requests set
        })
        .catch(error => {
            console.error('Error withdrawing friend request:', error);
        });
    }
    
    return (
        <div className='container mt-5'>
            <h5>Total count: {users.length}</h5>
            <table className="table table-info">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Username</th>
                        <th scope="col">Send Request</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index} className="table-light">
                            <td>{index + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.user_name}</td>
                            <td>
                            {sentRequests.has(user.user_id) ? (
                                    <button type="button" className="btn btn-warning" onClick={() => withdrawFriendRequest(user.user_id)}>
                                        Withdraw Request 
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-info" onClick={() => sendFriendRequest(user.user_id)}>
                                        Send a Request
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PeopleOnChatApp;
