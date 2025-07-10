import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Design/css/dashboard.css'
import { createSocket } from '../../socket.js';

export default function Dashboard() {
    const navigate = useNavigate();
    const [userData, setUserData]=useState({});
    const socket = useRef(null);

    useEffect(()=>{
        socket.current=createSocket();
        socket.current.connect();

        const fetchData = async () => {
            const curr_username= localStorage.getItem('username');

            const res = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({username: curr_username}),
            });
            const data = await res.json();

            if (!res.ok) {
                console.error('Failed to fetch user');
                return;
            }

            const me = {
                userId: data._id,
                username: data.username,
                games: data.games,
            };

            setUserData(me);
        }

        fetchData();

        return () => {
            socket.current.disconnect();
        };
    }, []);
    
    // useEffect(() => {
    //     const fetchData = async () => {
    //     const token = localStorage.getItem('token'); 
    //     const res = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
    //         method: 'GET',
    //         headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${token}`,
    //         },
    //     });

    //     const data = await res.json();

    //     if (!res.ok) {
    //         console.log('Error fetching user data for game');
    //         return;
    //     }

    //     setUserData({'userId':data._id, 'username': data.username, 'profilePic': data.profile_picture, 'coins': data.coins});
    //     console.log('User data:', data); 
    //     };

    //     fetchData(); 
    // }, []); 

  return (
    <>
        <div className="background-crowns">
            <span className="crown crown1">👑</span>
            <span className="crown crown2">👑</span>
            <span className="crown crown3">👑</span>
            <span className="crown crown4">👑</span>
            <span className="crown crown5">👑</span>
            <span className="crown crown6">👑</span>
            <span className="crown crown7">👑</span>
            <span className="crown crown8">👑</span>
            <span className="crown crown9">👑</span>
            <span className="crown crown10">👑</span>
        </div>

        <div className="container">
            <h1 className="title">DARBAAR</h1>
            <div className="stats">Games Played: {userData ? userData.games : '0'}</div>
            <div className="button-group">
            <button className="btn btn-primary" onClick={()=>navigate('/newgame/anyone')} >
                PLAY ANYONE
            </button>
            <button className="btn btn-primary" onClick={()=>navigate('/newgame/friends')}>
                PLAY FRIENDS
            </button>
            <button className="btn btn-secondary" onClick={()=>navigate('/friends')}>
                MY FRIENDS
            </button>
            <button className="btn btn-secondary" onClick={()=>navigate('/update_profile')}>
                UPDATE PROFILE
            </button>
            </div>
        </div>
    </>
  );
}
