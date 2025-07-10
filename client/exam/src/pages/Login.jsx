import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Design/css/login.css'

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem('username', form.username)

      navigate('/dashboard');
      console.log('Login successful')
    } catch (err) {
      setError('Network error, please try again.');
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

        <div className="auth-container">
            <h1 className="title">LOGIN</h1>
            <form onSubmit={handleSubmit}>
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
                    required 
                    value={form.password}
                    onChange={handleChange}
                />
                <button type="submit" className="btn btn-primary">SUBMIT</button>
                {error && <p className="error-text">{error}</p>}
            </form>
            <p className="subtitle">
            Don't have an account?
            <Link to="/signup" className="link-inline">SIGNUP</Link>
            </p>
        </div>
    </>
  );
}
