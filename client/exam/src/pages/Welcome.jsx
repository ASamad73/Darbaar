import { useNavigate, Link } from 'react-router-dom';
import '../../Design/css/welcome.css'

export default function Welcome() {
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

      <div className="welcome-container">
          <h1 className="title">DARBAAR</h1>
          <p className="subtitle">Find The WAZIR!</p>
          <div className="button-group">
          <Link to="/login" className="btn btn-primary">LOGIN</Link>
          <Link to="/signup" className="btn btn-secondary">SIGNUP</Link>
          </div>
      </div>
    </>
  );
}
