import './App.css'
import { Link } from 'react-router-dom'

function App() {
  return (
    <>
    <div className="cont">
      <div className="card">
        <Link to="/host">Host</Link>
        <Link to="/join">Join</Link>
      </div>
    </div>
    </>
  )
}

export default App
