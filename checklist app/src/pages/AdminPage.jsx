import { useState } from "react";
import Header from "../components/Header";
import ChecklistForm from "../components/ChecklistForm";
import SiteManager from "../components/SiteManager";
import ViolationManager from "../components/ViolationManager";

const AdminPage = ({
  currentPage,
  setCurrentPage,
  isLoggedIn,
  setIsLoggedIn,
  user,
  setUser,
}) => {
  const [activeTab, setActiveTab] = useState("checklists");

  const tabs = [
    { id: "checklists", label: "Manage Checklists", icon: "📋", shortLabel: "Checklists" },
    { id: "sites", label: "Manage Sites", icon: "📍", shortLabel: "Sites" },
    { id: "violations", label: "Manage Violations", icon: "⚠️", shortLabel: "Violations" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        setUser={setUser}
      />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your inspection checklists, sites, and violations
          </p>
        </div>

        {/* Tab Navigation - Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* Mobile Tab Navigation - Horizontal Scroll */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-max sm:min-w-0 px-4 sm:px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap flex items-center space-x-1 sm:space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  {/* Show short label on mobile, full label on desktop */}
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "checklists" && <ChecklistForm />}
            {activeTab === "sites" && <SiteManager />}
            {activeTab === "violations" && <ViolationManager />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
