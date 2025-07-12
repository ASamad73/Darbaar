import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Design/css/friends.css';

export default function Friends() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ games: 0, username: ''});
    const [friendUsername, setFriendUsername]=useState('');
    const [allFriends, setAllFriends] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
                    method: 'GET',
                    credentials: 'include',
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

            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };

        fetchUserData();

        const fetchFriendData = async () => {
            try {
                const curr_username= localStorage.getItem('username');
    
                const res = await fetch(`${import.meta.env.VITE_API_URL}/friends`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {'Content-type': 'application/json'},
                    body: JSON.stringify({username: curr_username}),
                });
                const data = await res.json();
    
                if (!res.ok) throw new Error(data.message || 'Failed to fetch');
                
                setAllFriends(data);
            } catch (err) {
                console.error(err);
            }};
        fetchFriendData();

    }, []);

    const addFriend = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
                method: 'GET',
                credentials: 'include', 
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to fetch');

            const resp = await fetch(`${import.meta.env.VITE_API_URL}/add_friend`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({friend: data, username: userData.username}),
            });

            // const friendData=await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Failed to fetch');

        } catch (err) {
            console.error(err); 
        }
    };

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

        <div className="friends-container">
            <h1 className="title">MY FRIENDS</h1>

            <form
                className="add-friend-form"
                onSubmit={(e) => {
                    e.preventDefault(); 
                    addFriend();
                }}
                >
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Friend’s Username" 
                    required
                    value={friendUsername}
                    onChange={(e)=>setFriendUsername(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">ADD</button>
            </form>


            <ul className="friend-list">
            {allFriends.map((entry, i)=>(    
                <li key={i} className="friend-item">
                    <span className="friend-name">{entry.friend.username}</span>
                    <span className="friend-stats">Games: {entry.friend.games}</span>
                </li>
            ))}
            </ul>
            <button className="btn btn-secondary go-back" onClick={()=>navigate('/dashboard')}>
                GO BACK
            </button>
        </div>
    </>
  );
}
