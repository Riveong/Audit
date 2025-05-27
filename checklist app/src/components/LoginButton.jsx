import { useState } from 'react'
import LoginModal from './LoginModal'

const LoginButton = ({ isLoggedIn, setIsLoggedIn, user, setUser }) => {
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <>
      <button
        onClick={isLoggedIn ? handleLogout : () => setShowLoginModal(true)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
          isLoggedIn
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        <span className="text-base">
          {isLoggedIn ? '🚪' : '🔐'}
        </span>
        <span>
          {isLoggedIn ? 'Logout' : 'Login'}
        </span>
      </button>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

export default LoginButton