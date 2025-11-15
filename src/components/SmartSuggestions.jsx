import {
  Lightbulb,
  Plus,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";

import suggestionService from "../services/suggestionService";

const SmartSuggestions = ({ suggestions, onAddSuggestion }) => {
  const handleAddWithPrice = (itemName, category) => {
    // Get price from product database
    const products = suggestionService.searchProducts(itemName);
    const price = products.length > 0 ? products[0].price : 50;
    onAddSuggestion(itemName, category, price);
  };

  if (
    !suggestions ||
    ((!suggestions.frequent || suggestions.frequent.length === 0) &&
      (!suggestions.due || suggestions.due.length === 0) &&
      (!suggestions.seasonal || suggestions.seasonal.length === 0))
  ) {
    return null;
  }

  return (
    <div className="glass-effect rounded-2xl p-6 mb-6">
      <h2 className="text-white text-xl font-bold flex items-center mb-4">
        <Lightbulb className="w-6 h-6 mr-2 text-yellow-300" />
        Smart Suggestions
      </h2>

      {/* Frequently Bought */}
      {suggestions.frequent && suggestions.frequent.length > 0 && (
        <div className="mb-4">
          <h3 className="text-white text-sm font-semibold flex items-center mb-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            Frequently Bought
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.frequent.map((item, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-20 rounded-lg p-3 flex justify-between items-center hover:bg-opacity-30 transition-all"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-gray-200 text-xs">
                    Bought {item.count} times
                  </p>
                </div>
                <button
                  onClick={() => onAddSuggestion(item.name, item.category)}
                  className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Due for Purchase */}
      {suggestions.due && suggestions.due.length > 0 && (
        <div className="mb-4">
          <h3 className="text-white text-sm font-semibold flex items-center mb-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            Running Low?
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.due.map((item, index) => (
              <div
                key={index}
                className="bg-orange-500 bg-opacity-30 rounded-lg p-3 flex justify-between items-center hover:bg-opacity-40 transition-all"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-gray-200 text-xs">Not bought recently</p>
                </div>
                <button
                  onClick={() => onAddSuggestion(item.name, item.category)}
                  className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal Items */}
      {suggestions.seasonal && suggestions.seasonal.length > 0 && (
        <div>
          <h3 className="text-white text-sm font-semibold flex items-center mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Seasonal Items
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.seasonal.map((item, index) => (
              <div
                key={index}
                className="bg-blue-500 bg-opacity-30 rounded-lg p-3 flex justify-between items-center hover:bg-opacity-40 transition-all"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-gray-200 text-xs capitalize">
                    {item.reason}
                  </p>
                </div>
                <button
                  onClick={() => onAddSuggestion(item.name, "Produce")}
                  className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
