import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyFriendCircle() {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);

    const unfriendUser = (friendUserId) =>{
        axios.post('http://localhost:8081/unfriend', { friendUserId }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            alert('Friend removed.');
            setFriends(currentFriends => currentFriends.filter(friend => friend.user_id !== friendUserId));
        })
        .catch(error => {
            console.error('Error removing friend:', error);
        });
    }
    const handleChatNow = (friendId, friendName) => {
        navigate(`/chatting/${friendId}/${friendName}`);
        localStorage.setItem('friendId', friendId);
        localStorage.setItem('friendName', friendName);
    };


    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8081/my-friends', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setFriends(response.data);
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });
    }, []);

    return (
        <div className='container mt-5'>
            <h5>Total count: {friends.length}</h5>
            <table className="table table-info">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Username</th>
                        <th scope="col">Chat now</th>
                        <th scope="col">Unfriend</th>
                    </tr>
                </thead>
                <tbody>
                    {friends.map((friend, index) => (
                        <tr key={index} className="table-light">
                            <td>{index + 1}</td>
                            <td>{friend.name}</td>
                            <td>{friend.user_name}</td>
                            <td><button type="button" className="btn btn-success" onClick={() => handleChatNow(friend.user_id, friend.user_name)}>Chat Now</button></td>
                            <td><button type="button" className="btn btn-danger" onClick={() => unfriendUser(friend.user_id, friend.user_name)}>Unfriend</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MyFriendCircle;
