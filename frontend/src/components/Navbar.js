import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ showButtons = false }) {
    const navigate = useNavigate();

    function login() {
        navigate('/login');
    }

    function register() {
        navigate('/register');
    }

    return (
        <>      
            <nav className="navbar navbar-dark bg-dark">
                <span className="navbar-brand mb-0 h1">Welcome to Chit-Chat!!</span>
            
            {showButtons && (
                <div className="container-fp d-flex justify-content-center">
                    <button className="btn btn-outline-info" type="button" onClick={register} aria-label="Register new user">
                        New User
                    </button>
                    <button className="btn btn-outline-success" type="button" onClick={login} aria-label="Login existing user">
                        Existing User
                    </button>
            
                </div>
                
            )}
            </nav>
        </>
    );
}

export default Navbar;
