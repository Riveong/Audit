import { useState } from 'react'

const LoginButton = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn)
  }

  return (
    <button 
      className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 ${
        isLoggedIn 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-white text-blue-600 hover:bg-gray-50'
      }`}
      onClick={handleLogin}
    >
      {isLoggedIn ? (
        <span className="flex items-center space-x-2">
          <span>🚪</span>
          <span>Logout</span>
        </span>
      ) : (
        <span className="flex items-center space-x-2">
          <span>🔐</span>
          <span>Login</span>
        </span>
      )}
    </button>
  )
}

export default LoginButton