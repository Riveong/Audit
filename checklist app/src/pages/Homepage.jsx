import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import ChecklistCard from "../components/ChecklistCard";
import ChecklistView from "../components/ChecklistView";
import StatsOverview from "../components/StatsOverview";
import { checklistsAPI, violationsAPI, sitesAPI } from "../services/api";

const ITEMS_PER_PAGE = 6;

const Homepage = ({
  currentPage,
  setCurrentPage,
  isLoggedIn,
  setIsLoggedIn,
  user,        // Add this
  setUser,     // Add this
}) => {
  const [checklists, setChecklists] = useState([]);
  const [violations, setViolations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [completionFilter, setCompletionFilter] = useState("all"); // 'all', 'completed', 'incomplete'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'name-asc', 'name-desc', 'progress-asc', 'progress-desc'
  const [currentPageNum, setCurrentPageNum] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [checklistsResponse, violationsResponse, sitesResponse] =
        await Promise.all([
          checklistsAPI.getAll(),
          violationsAPI.getAll(),
          sitesAPI.getAll(),
        ]);

      setChecklists(checklistsResponse.data.data);
      setViolations(violationsResponse.data.data);
      setSites(sitesResponse.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load checklists. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort checklists
  const filteredAndSortedChecklists = useMemo(() => {
    let filtered = checklists.filter((checklist) => {
      // Search filter
      const matchesSearch =
        checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.site.toLowerCase().includes(searchTerm.toLowerCase());

      // Site filter
      const matchesSite =
        selectedSite === "" || checklist.site === selectedSite;

      // Completion filter
      const completedItems = parseInt(checklist.completed_items) || 0;
      const totalItems = parseInt(checklist.total_items) || 0;
      const progressPercentage =
        totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      let matchesCompletion = true;
      if (completionFilter === "completed") {
        matchesCompletion = progressPercentage === 100;
      } else if (completionFilter === "incomplete") {
        matchesCompletion = progressPercentage < 100;
      }

      return matchesSearch && matchesSite && matchesCompletion;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      const aCompleted = parseInt(a.completed_items) || 0;
      const aTotal = parseInt(a.total_items) || 0;
      const aProgress = aTotal > 0 ? (aCompleted / aTotal) * 100 : 0;

      const bCompleted = parseInt(b.completed_items) || 0;
      const bTotal = parseInt(b.total_items) || 0;
      const bProgress = bTotal > 0 ? (bCompleted / bTotal) * 100 : 0;

      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "progress-asc":
          return aProgress - bProgress;
        case "progress-desc":
          return bProgress - aProgress;
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [checklists, searchTerm, selectedSite, completionFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedChecklists.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPageNum - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChecklists = filteredAndSortedChecklists.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPageNum(1);
  }, [searchTerm, selectedSite, completionFilter, sortBy]);

  const handleOpenChecklist = (checklistId) => {
    setSelectedChecklistId(checklistId);
  };

  const handleCloseChecklist = () => {
    setSelectedChecklistId(null);
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSite("");
    setCompletionFilter("all");
    setSortBy("newest");
    setCurrentPageNum(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedSite ||
    completionFilter !== "all" ||
    sortBy !== "newest";

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Loading inspection checklists...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          setUser={setUser}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Inspection Checklists
          </h1>
          <p className="text-gray-600">
            Manage and track inspection findings across all sites (
            {violations.length} standard violations)
          </p>
          {!isLoggedIn && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                💡 <strong>Tip:</strong> Login to mark violations found and add
                inspection notes!
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {checklists.length > 0 && (
          <StatsOverview checklists={checklists} sites={sites} />
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Search by name or site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Site Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Filter by Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.sites}>
                    {site.sites}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ✅ Completion Status
              </label>
              <select
                value={completionFilter}
                onChange={(e) => setCompletionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Checklists</option>
                <option value="completed">Fully Inspected</option>
                <option value="incomplete">Inspection Pending</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="progress-desc">Most Violations Found</option>
                <option value="progress-asc">Fewest Violations Found</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
              <span>
                Showing{" "}
                <span className="font-medium">{currentChecklists.length}</span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredAndSortedChecklists.length}
                </span>{" "}
                checklists
                {checklists.length !== filteredAndSortedChecklists.length && (
                  <span className="text-gray-400">
                    {" "}
                    (filtered from {checklists.length} total)
                  </span>
                )}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
              >
                <span>🗑️</span>
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredAndSortedChecklists.length === 0 ? (
          <div className="text-center py-12">
            {checklists.length === 0 ? (
              <>
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  No inspection checklists yet
                </h2>
                <p className="text-gray-500 mb-4">
                  {isLoggedIn
                    ? "Create your first inspection checklist in the Admin panel."
                    : "Login to create inspection checklists."}
                </p>
                {isLoggedIn && (
                  <button
                    onClick={() => setCurrentPage("admin")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Go to Admin
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  No checklists match your filters
                </h2>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or clearing filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Checklists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentChecklists.map((checklist) => (
                <ChecklistCard
                  key={checklist.id}
                  checklist={checklist}
                  isLoggedIn={isLoggedIn}
                  onOpenChecklist={handleOpenChecklist}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page <span className="font-medium">{currentPageNum}</span>{" "}
                    of <span className="font-medium">{totalPages}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setCurrentPageNum((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPageNum === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => {
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPageNum - 1 &&
                              pageNum <= currentPageNum + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPageNum(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                  pageNum === currentPageNum
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === currentPageNum - 2 ||
                            pageNum === currentPageNum + 2
                          ) {
                            return (
                              <span
                                key={pageNum}
                                className="px-2 text-gray-400"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() =>
                        setCurrentPageNum((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={currentPageNum === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredAndSortedChecklists.length)} of{" "}
                    {filteredAndSortedChecklists.length}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Checklist Detail Modal */}
      {selectedChecklistId && (
        <ChecklistView
          checklistId={selectedChecklistId}
          onClose={handleCloseChecklist}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
};

export default Homepage;
