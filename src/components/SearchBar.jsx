import { useState } from "react";
import { Search, X, Plus } from "lucide-react";
import suggestionService from "../services/suggestionService";

const SearchBar = ({ onAddItem }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [priceFilter, setPriceFilter] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const priceRange = priceFilter ? { max: parseInt(priceFilter) } : null;
    const results = suggestionService.searchProducts(query, priceRange);
    setSearchResults(results);
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setPriceFilter("");
  };

  const handleAddItem = (product) => {
    onAddItem(product.name, product.category, product.price);
    clearSearch();
  };

  return (
    <div className="glass-effect rounded-2xl p-6 mb-6">
      <h2 className="text-white text-xl font-bold flex items-center mb-4">
        <Search className="w-6 h-6 mr-2" />
        Search Products
      </h2>

      {/* Search Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for products (e.g., milk, bread, apples)..."
          className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-opacity-50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-4">
        <label className="block text-white text-sm font-semibold mb-2">
          Maximum Price (₹)
        </label>
        <input
          type="number"
          value={priceFilter}
          onChange={(e) => {
            setPriceFilter(e.target.value);
            if (searchQuery) handleSearch(searchQuery);
          }}
          placeholder="e.g., 100"
          className="w-full px-4 py-2 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-opacity-50 transition-all"
        />
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="bg-white bg-opacity-95 rounded-lg max-h-64 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {searchResults.map((product, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-100 transition-all flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {product.name}
                    </h4>
                    <div className="flex items-center mt-1 text-sm">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs mr-2">
                        {product.category}
                      </span>
                      <span className="font-semibold text-green-600">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddItem(product)}
                    className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all ml-3"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-600">
              <p>No products found matching "{searchQuery}"</p>
              <p className="text-sm mt-1">
                Try different keywords or adjust price filter
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
