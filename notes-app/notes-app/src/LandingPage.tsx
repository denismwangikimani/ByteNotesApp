import './App.css'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
    const navigate = useNavigate()
    
    return (
        <div className="App-Landingpage">
        <header className="App-Landingpage-header">
            <h1 className='App-Landingpage-text'>Welcome to Bytes Notes App</h1>
            <button onClick={() => navigate('/signup')}>Signup</button>
            <button onClick={() => navigate('/login')}>Login</button>
        </header>
        </div>
    )
}

export default LandingPage