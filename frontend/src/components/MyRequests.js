import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MyRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8081/received_friend_requests', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setRequests(response.data);
        })
        .catch(error => {
            console.error('Error fetching received friend requests:', error);
        });
    }, []);

    
    const acceptRequest = (requestId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:8081/accept-request`, { requestId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            alert('Request accepted successfully!');
            // Optionally update the list or modify the state to reflect the change
            setRequests(prev => prev.filter(request => request.request_id !== requestId));
        })
        .catch(error => {
            console.error('Error accepting friend request:', error);
        });
    };

    const declineRequest = (requestId) => {
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:8081/decline-request`, { requestId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            alert('Request declined successfully!');
            // Optionally update the list or modify the state to reflect the change
            setRequests(prev => prev.filter(request => request.request_id !== requestId));
        })
        .catch(error => {
            console.error('Error declining friend request:', error);
        });
    };

    return (
        <div className='container mt-5'>
            <h5>Total count: {requests.length}</h5>
            <table className="table table-info">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Username</th>
                        <th scope="col">Accept/Decline</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request, index) => (
                        <tr key={index} className="table-light">
                            <td>{index + 1}</td>
                            <td>{request.sender_name}</td>
                            <td>{request.sender_username}</td>
                            <td>
                                <button type="button" className="btn btn-success" onClick={() => acceptRequest(request.request_id)}>
                                    Accept
                                </button>
                                <button type="button" className="btn btn-danger mx-3" onClick={() => declineRequest(request.request_id)}>
                                    Decline
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MyRequests;
