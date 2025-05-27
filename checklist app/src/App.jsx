import { useState, useEffect } from 'react'
import Homepage from './pages/Homepage'
import AdminPage from './pages/AdminPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home' or 'admin'
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Redirect to home if user logs out while on admin page
  useEffect(() => {
    if (!isLoggedIn && currentPage === 'admin') {
      setCurrentPage('home')
    }
  }, [isLoggedIn, currentPage])

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' ? (
        <Homepage 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      ) : (
        <AdminPage 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
    </div>
  )
}

export default App
