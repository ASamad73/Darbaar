import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Design/css/dashboard.css'
import socket from '../../socket.js'

export default function Dashboard() {
    const navigate = useNavigate();
    const [userData, setUserData]=useState({})

    useEffect(()=>{
        socket.connect();

        const fetchData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
                    method: 'GET',
                    credentials: 'include', 
                });

                const data = await res.json();
                console.log('username: ', data.username);

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
                
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };

        fetchData();
    }, []);

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
