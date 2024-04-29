import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Loginscreen() {  
    const [username, setUsernameLocal] = useState(''); 
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = (event) => {
        event.preventDefault();
        if (!username || !password) {
            setErrorMessage('Both username and password are required.');
            return;
        }
        
        axios.post('http://localhost:8081/login', { user_name: username, password })
        .then(response => {
            if (response.data.message === 'Login successful') {
                localStorage.setItem('token', response.data.token);  // Save token to local storage
                localStorage.setItem('username', username); // Save username to local storage
                setUsernameLocal(username);
                navigate('/chat');

                axios.get('http://localhost:8081/protectedRoute', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }).then(protectedResponse => {
                    console.log('Protected route data:', protectedResponse.data);
                }).catch(error => {
                    console.log('Error accessing protected route:', error);
                });

            } else {
                setErrorMessage('Invalid username or password.');
            }
        })
        
        
            .catch(error => {
                console.error('Login error:', error);
                setErrorMessage('Failed to login. Please try again later.');
            });
    };

    return (
        <div className='container my-3'>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="exampleInputUserName1">User Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="exampleInputUserName1"
                        value={username}
                        onChange={e => setUsernameLocal(e.target.value)} // Update local username
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="exampleInputPassword1"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success">Log In</button>
                {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            </form>
        </div>
    );
}

export default Loginscreen;
