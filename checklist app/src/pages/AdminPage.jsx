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
  user,        // Add this
  setUser,     // Add this
}) => {
  const [activeTab, setActiveTab] = useState("checklists");

  const tabs = [
    { id: "checklists", label: "Manage Checklists", icon: "📋" },
    { id: "sites", label: "Manage Sites", icon: "📍" },
    { id: "violations", label: "Manage Violations", icon: "⚠️" },
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your inspection checklists, sites, and violations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
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
