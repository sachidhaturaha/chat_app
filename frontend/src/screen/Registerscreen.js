import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Registerscreen() {
    const navigate = useNavigate();

    // State hooks for each input field
    const [fullname, setFullname] = useState('');
    const [user_name, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Function to handle the form submission
    function handleRegister(event) {
        event.preventDefault();
        if (fullname && user_name && email && password) {
            fetch('http://localhost:8081/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullname, user_name, email, password })

            })
                .then(response => response.json())
                .then(data => alert(data.message))
                .then(navigate('/login'))
                .catch(error => console.error('Error:', error));
        } else {
            alert("Please fill all the fields!");
        }
    }




    return (
        <div className='container my-3'>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label htmlFor="exampleInputName1">Full Name</label>
                    <input type="text" className="form-control" id="exampleInputName1" aria-describedby="nameHelp" required
                        value={fullname} onChange={e => setFullname(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputUserName1">User Name</label>
                    <input type="text" className="form-control" id="exampleInputUserName1" aria-describedby="usernameHelp" required
                        value={user_name} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required
                        value={email} onChange={e => setEmail(e.target.value)} />
                    <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword1" required
                        value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-success">Register</button>
            </form>
        </div>
    );
}

export default Registerscreen;
