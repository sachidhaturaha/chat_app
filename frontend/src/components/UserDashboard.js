import React, {useEffect, useState} from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function UserDashboard() {
    const [username, setUsername] = useState(localStorage.getItem('username')); // Initialize username from local storage

    return (
        <>
        <div><h1>{username}'s Dashboard</h1></div>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <NavLink className="nav-link" to="/chat/myfriendcircle">My Friend Circle</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/chat/peopleonchatapp">People on ChatApp</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/chat/myrequests">My Requests</NavLink>
                </li>
            </ul>
            <Outlet />  
        </>
    );
}

export default UserDashboard;
