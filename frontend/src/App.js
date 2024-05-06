import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FrontPage from './components/FrontPage';
import Navbar from './components/Navbar';
import Registerscreen from './screen/Registerscreen';
import Loginscreen from './screen/Loginscreen';
import UserDashboard from './components/UserDashboard';
import MyFriendCircle from './components/MyFriendCircle';
import PeopleOnChatApp from './components/PeopleOnChatApp';
import MyRequests from './components/MyRequests';
import Chatwindow from './screen/Chatwindow';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} /> 
          <Route path="/register" element={<><Navbar /><Registerscreen /></>} />
          <Route path="/login" element={<><Navbar /><Loginscreen /></>} />
          <Route path="/chat" element={<><Navbar /><UserDashboard /></>}>
              <Route index element={<div>Select an option from the tabs.</div>} />
              <Route path="myfriendcircle" element={<MyFriendCircle />} />
              <Route path="peopleonchatapp" element={<PeopleOnChatApp />} />
              <Route path="myrequests" element={<MyRequests />} />
                
          </Route>
          <Route path="/chatting/:friendId/:friendName" element={<><Navbar /><UserDashboard /><Chatwindow /></>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
