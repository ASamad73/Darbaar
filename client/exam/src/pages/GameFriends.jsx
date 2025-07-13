import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Design/css/game.css';
import socket from '../../socket.js'

export default function GameFriends() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ games: 0, username: ''});
    const [start, setStart]=useState(false);
    const [gameRole, setGameRole]=useState(null);
    const [playersUsernames, setPlayersUsernames]=useState(null);
    const [vote, setVote]=useState(null);
    const [allvotes, setAllVotes]=useState(null);
    const [guess, setGuess]=useState(false);
    const [roleRecords, setRoleRecords]=useState(null);
    const [result, setResult]=useState('In Game');
    const [message, setMessage]=useState('');
    const [allMessages, setAllMessages]=useState([]);
    const [timeout, setTimeout]=useState(false);
    const hasJoinedRef = useRef(false); 
    const gameRoleRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
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

                if (!hasJoinedRef.current) {
                    socket.emit('joining_friend', me); 
                    hasJoinedRef.current = true;
                }
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };

        fetchData();
        
        socket.on('start_game', (role, other_usernames)=>{
            setStart(true);
            console.log('role set: ', role);
            setGameRole(role);
            gameRoleRef.current = role;
            setPlayersUsernames(other_usernames);
        });

        socket.on('votes', (votes)=>{
            console.log('votes recieved');
            setAllVotes(votes);
        })

        socket.on('guessed', ()=>{
            console.log('guessed received');
            setGuess(true);
        })

        socket.on('reveal_roles', (records)=>{
            setRoleRecords(records);
        })

        socket.on('msg_info', (info)=>{
            console.log('message recived by', gameRoleRef.current);
            console.log('message recieved', info);
            setAllMessages(prev=>[...prev, info]);
        })
        
        socket.on('end', (records)=>{
            console.log('end received by:', gameRoleRef.current); // now logs correct role
            setRoleRecords(records);
            if (gameRoleRef.current === 'Chor') {
                setResult('You Won');
            } else {
                setResult('You Lost');
            }
        })

        socket.on('won', ()=>{
            setResult('You Won');
        })

        socket.on('lost', ()=>{
            setResult('You Lost');
        })
        

        socket.on('timeout', (msg)=>{
            setResult(msg);
            setTimeout(true);
        })

        return()=>{
            socket.off('start_game');
            socket.off('votes');
            socket.off('guessed');
            socket.off('reveal_roles');
            socket.off('msg_info');
            socket.off('end');
            socket.off('won');
            socket.off('lost');
            socket.off('timeout');
        }

    }, []);

    useEffect(()=>{
        if(vote){
            console.log('voted for: ', vote);
            if(guess){
                console.log('final voting');
                socket.emit('final_vote', vote);
            }
            else{
                socket.emit('vote', userData.username, vote);
            }
        }
    }, [vote])

    const handleVote=(user)=>{
        if(start && !vote){
            alert('vote casted')
            setVote(user)
        }
    }

    const handleGuess=()=>{
        if(start && result==='In Game'){
            socket.emit('guess')
            setGuess(true);
        }
    }

    const handleEndGame=()=>{
        if(start){
            console.log('end emitted');
            socket.emit('end');
        }
    }

    const sendMessage=()=>{
        console.log('message: ', message);
        setMessage('');
        socket.emit('message', [[userData.username, gameRole], message])
    }

    const handleReturn=async ()=>{
        if(!timeout){
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/game`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({username: userData.username}),
            });
            
            if (!resp.ok) throw new Error(data.message || 'Failed to fetch');
        }


        navigate('/dashboard');
    }

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

        <div className="game-container">
            <h1 className="title">DARBAAR</h1>
            <p className="subtitle">{!timeout ? start ? result==='In Game' ? 'Game On' : 'Game End' : 'Waiting For Players..' : 'Game End'}</p>
            <div className="game-wrapper">
            <div className="chat-container">
                <ul className="messages">
                {allMessages.map((info, i)=>(    
                    <li key={i} className="message">
                        <span className="sender">({info[0][0]}) {info[0][1]}:</span>
                        {info[1]}
                    </li>
                ))}
                </ul>
                <form className="chat-input" action="#" method="GET">
                <input type="text" placeholder="Type a message..." value={message} onChange={(e)=>setMessage(e.target.value)} required />
                <button type="submit" className="btn btn-primary" onClick={()=>sendMessage()}>SEND</button>
                </form>
            </div>

            <div className="player-container">
                <div className="player-grid">
                    <div className="player-tile">
                        <span className="player-name">
                            {playersUsernames
                            ? playersUsernames[0]
                            : result === 'Not enough players joined your friends room in time.'
                                ? 'Not Found'
                                : 'Joining..'}
                        </span>
                        <span className="player-role">
                            <span className="player-role">
                            {
                                gameRole
                                ? gameRole === 'BadShah'
                                    ? roleRecords
                                        ? roleRecords[playersUsernames[0]]
                                        : 'Role Hidden'
                                    : roleRecords
                                        ? roleRecords[playersUsernames[0]]
                                        : 'BadShah'
                                : 'Role Hidden'
                            }
                            </span>
                        </span>
                        {gameRole && gameRole === 'BadShah' && allvotes && (
                            <span className="player-role">
                                Voted For: {allvotes[playersUsernames[0]] ? allvotes[playersUsernames[0]] : 'None'}
                            </span>
                        )}
                        {gameRole && gameRole==='BadShah' && guess && <button className="btn btn-primary" onClick={()=>handleVote(playersUsernames[0])}>VOTE</button>}
                    </div>
                    <div className="player-tile">
                        <span className="player-name">
                            {playersUsernames
                            ? playersUsernames[1]
                            : result === 'Not enough players joined your friends room in time.'
                                ? 'Not Found'
                                : 'Joining..'}
                        </span>
                        <span className="player-role">{roleRecords ? roleRecords[playersUsernames[1]] : 'Role Hidden'}</span>
                        {gameRole && gameRole === 'BadShah' && allvotes && (
                            <span className="player-role">
                                Voted For: {allvotes[playersUsernames[1]] ? allvotes[playersUsernames[1]] : 'None'}
                            </span>
                        )}
                        {gameRole && (
                            (gameRole === 'BadShah' && guess) ||
                            (gameRole !== 'BadShah' && !guess && !roleRecords)
                        ) && (
                            <button className="btn btn-primary" onClick={() => handleVote(playersUsernames[1])}>VOTE</button>
                        )}
                    </div>
                    <div className="player-tile">
                        <span className="player-name">
                            {playersUsernames
                            ? playersUsernames[2]
                            : result === 'Not enough players joined your friends room in time.'
                                ? 'Not Found'
                                : 'Joining..'}
                        </span>
                        <span className="player-role">{roleRecords ? roleRecords[playersUsernames[2]] : 'Role Hidden'}</span>
                        {gameRole && gameRole === 'BadShah' && allvotes && (
                            <span className="player-role">
                                Voted For: {allvotes[playersUsernames[2]] ? allvotes[playersUsernames[2]] : 'None'}
                            </span>
                        )}
                        {gameRole && (
                            (gameRole === 'BadShah' && guess) ||
                            (gameRole !== 'BadShah' && !guess && !roleRecords)
                        ) && (
                            <button className="btn btn-primary" onClick={() => handleVote(playersUsernames[2])}>VOTE</button>
                        )}
                    </div>
                    <div className="player-tile">
                        <span className="player-name">{userData.username}</span>
                        <span className="player-role">{gameRole ? gameRole + ' (You)' : 'You'}</span>
                        {gameRole && (
                            gameRole === 'BadShah' && result === 'In Game' && (
                            <button className="btn btn-secondary" onClick={()=>handleGuess()}>GUESS</button>
                            ) 
                        )}
                    </div>
                </div>
                <div className="result">Result: {result}</div>
                    {timeout ? (
                    <button className="btn btn-secondary endgame" onClick={() => handleReturn()}>GO TO DASHBOARD</button>
                    ) : (
                    gameRole && (
                        gameRole === 'BadShah' ? (
                        result === 'In Game' ? (
                            <button className="btn btn-secondary endgame" onClick={handleEndGame}>END GAME</button>
                        ) : (
                            <button className="btn btn-secondary endgame" onClick={() => handleReturn()}>GO TO DASHBOARD</button>
                        )
                        ) : (
                        result !== 'In Game' && (
                            <button className="btn btn-secondary endgame" onClick={() => handleReturn()}>GO TO DASHBOARD</button>
                        )
                        )
                    )
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
