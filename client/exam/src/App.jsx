import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import UpdateProfile from './pages/UpdateProfile';
import Friends from './pages/Friends';
import GameAnyone from './pages/GameAnyone';
import GameFriends from './pages/GameFriends';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome/>}/> 
        <Route path="/login" element={<Login/>}/> 
        <Route path="/signup" element={<SignUp/>}/> 
        <Route path="/dashboard" element={<Dashboard/>}/> 
        <Route path="/update_profile" element={<UpdateProfile/>}/> 
        <Route path="/friends" element={<Friends/>}/> 
        <Route path="/newgame/anyone" element={<GameAnyone/>}/> 
        <Route path="/newgame/friends" element={<GameFriends/>}/> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
