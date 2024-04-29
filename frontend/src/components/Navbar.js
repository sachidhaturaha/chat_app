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
            <nav className="navbar navbar-light bg-light">
                <span className="navbar-brand mb-0 h1">Welcome to Chit-Chat!!</span>
            </nav>
            {showButtons && (
                <div className="container-fp d-flex justify-content-center mt-3">
                    <button className="btn btn-outline-secondary mx-2" type="button" onClick={register} aria-label="Register new user">
                        New User
                    </button>
                    <button className="btn btn-outline-success mx-2" type="button" onClick={login} aria-label="Login existing user">
                        Existing User
                    </button>
                </div>
            )}
        </>
    );
}

export default Navbar;
