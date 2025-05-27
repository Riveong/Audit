import LoginButton from './LoginButton'

const Header = ({ isLoggedIn, setIsLoggedIn, currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', requiresLogin: false },
    { id: 'admin', label: 'Admin', icon: '⚙️', requiresLogin: true }
  ]

  // Filter navigation items based on login status
  const visibleNavItems = navItems.filter(item => !item.requiresLogin || isLoggedIn)

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl">
      <div className="container mx-auto px-2 md:px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-lg">✅</span>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold tracking-tight">Checklist App</h1>
              <p className="text-blue-100 text-xs">Streamline your audit</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-white bg-opacity-20 text-blue-700 shadow-lg'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center space-x-1">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                }`}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
              </button>
            ))}
          </nav>

          {/* Login Button and Status */}
          <div className="flex items-center space-x-4">
            {/* User Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-blue-100">
                {isLoggedIn ? 'Logged In' : 'Guest'}
              </span>
            </div>
            
            <LoginButton isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
    </header>
  )
}

export default Header