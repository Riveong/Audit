import { useState, useEffect } from 'react'
import Homepage from './pages/Homepage'
import AdminPage from './pages/AdminPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  // Check for existing auth on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'admin':
        return (
          <AdminPage 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            user={user}
            setUser={setUser}
          />
        )
      case 'home':
      default:
        return (
          <Homepage 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            user={user}
            setUser={setUser}
          />
        )
    }
  }

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  )
}

export default App
