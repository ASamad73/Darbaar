import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Design/css/update_profile.css';

export default function UpdateProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ coins: 0, username: '', profilePic: '' });
  const [form, setForm] = useState({ username: '', password: '', profilePic: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const curr_username= localStorage.getItem('username');

        const res = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({username: curr_username}),
        });
        const data = await res.json();


        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        setUserData({
          userId: data._id,
          username: data.username,
          games: data.games,
        });
        setForm({
          username: data.username,
          password: '',
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load user data.');
      }
    };
    fetchUserData();
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const check_username=localStorage.getItem('username')

      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.username,
          check_username:check_username,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update profile');
      } else {
        setUserData(prev => ({
          ...prev,
          username: form.username,
        }));
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Network error, please try again');
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

        <div className="update-container">
            <h1 className="title">UPDATE PROFILE</h1>
            <form className="update-form" onSubmit={handleSubmit}>
                <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleChange}
                />

                <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                />
                <button type="submit" className="btn btn-primary" >
                    Save Changes
                </button>
            </form>
            <button className="btn btn-secondary go-back" onClick={()=>navigate('/dashboard')}>
            GO BACK
            </button>
        </div>
    </>
  );
}
