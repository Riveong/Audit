import { useState, useEffect } from 'react'
import LoginButton from './LoginButton'

const Header = ({ isLoggedIn, setIsLoggedIn, currentPage, setCurrentPage, user, setUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', requiresLogin: false },
    { id: 'admin', label: 'Admin', icon: '⚙️', requiresLogin: true }
  ]

  const visibleNavItems = navItems.filter(item => !item.requiresLogin || isLoggedIn)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => handleNavClick('home')}
            >
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold">Inspection Pro</h1>
                <p className="text-blue-100 text-xs hidden sm:block">Streamline your audits</p>
              </div>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-2">
              {visibleNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-white bg-opacity-20 text-blue-600'
                      : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* User status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-blue-100 hidden sm:block">
                  {isLoggedIn ? (user?.empid || 'Admin') : 'Guest'}
                </span>
              </div>

              {/* Desktop login button */}
              <div className="hidden md:block">
                <LoginButton 
                  isLoggedIn={isLoggedIn} 
                  setIsLoggedIn={setIsLoggedIn}
                  user={user}
                  setUser={setUser}
                />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all text-gray-600 hover:text-black"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="bg-white w-64 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile menu header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold">Menu</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation items */}
            <div className="p-4 space-y-2">
              {visibleNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* User status and login */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isLoggedIn ? `${user?.empid || 'Admin'}` : 'Guest'}
                  </span>
                </div>
              </div>
              <LoginButton 
                isLoggedIn={isLoggedIn} 
                setIsLoggedIn={setIsLoggedIn}
                user={user}
                setUser={setUser}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header