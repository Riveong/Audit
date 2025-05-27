import { useState } from 'react'

const ChecklistCard = ({ checklist, isLoggedIn, onOpenChecklist }) => {
  // Use the data from API
  const completedCount = parseInt(checklist.completed_items) || 0
  const totalCount = parseInt(checklist.total_items) || checklist.criterias?.length || 0
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleCardClick = () => {
    onOpenChecklist(checklist.id)
  }

  const getImageUrl = () => {
    if (checklist.img_url) {
      return checklist.img_url.startsWith('http') 
        ? checklist.img_url 
        : `http://localhost:3001${checklist.img_url}`
    }
    return 'https://via.placeholder.com/400x200?text=No+Image'
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img 
          src={getImageUrl()}
          alt={checklist.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            📍 {checklist.site}
          </span>
        </div>
        
        {/* Progress Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
            progressPercentage === 100 
              ? 'bg-green-500 text-white' 
              : progressPercentage > 0 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-500 text-white'
          }`}>
            {Math.round(progressPercentage)}%
          </span>
        </div>

        {/* Completion Badge */}
        {progressPercentage === 100 && (
          <div className="absolute bottom-4 right-4">
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Complete!
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">{checklist.name}</h2>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                progressPercentage === 100 
                  ? 'bg-green-500' 
                  : progressPercentage > 0 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-sm text-blue-600">Total Items</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
        </div>

        {/* Action Area */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {checklist.created_at && (
                <span>Created {new Date(checklist.created_at).toLocaleDateString()}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!isLoggedIn && (
                <span className="text-xs text-gray-400">👁️ View Only</span>
              )}
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChecklistCard