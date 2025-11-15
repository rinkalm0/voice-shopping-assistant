import { useState, useEffect } from "react";
import { Trash2, Download, Upload } from "lucide-react";
import VoiceInput from "./components/VoiceInput";
import ShoppingList from "./components/ShoppingList";
import SmartSuggestions from "./components/SmartSuggestions";
import SearchBar from "./components/SearchBar";
import suggestionService from "./services/suggestionService";
import {
  getShoppingList,
  saveShoppingList,
  addToShoppingList,
  removeFromShoppingList,
  updateShoppingListItem,
  clearShoppingList,
  addToHistory,
} from "./utils/localStorage";

// Generate random price for items without database entry
const generateRandomPrice = () => {
  return Math.round((Math.random() * 40 + 5) * 100) / 100;
};

function App() {
  const [shoppingList, setShoppingList] = useState([]);
  const [suggestions, setSuggestions] = useState({
    frequent: [],
    due: [],
    seasonal: [],
  });
  const [notification, setNotification] = useState("");
  const [showCategoryView, setShowCategoryView] = useState(false);

  // Load shopping list on mount
  useEffect(() => {
    const list = getShoppingList();
    setShoppingList(list);
    updateSuggestions(list);
  }, []);

  // Update suggestions when list changes
  const updateSuggestions = (list) => {
    const newSuggestions = suggestionService.getRecommendations(list);
    setSuggestions(newSuggestions);
  };

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handle voice command
  const handleVoiceCommand = (parsedCommand) => {
    console.log("Parsed command:", parsedCommand);

    switch (parsedCommand.command) {
      case "ADD":
        if (parsedCommand.itemName) {
          // Try to get price from database
          const products = suggestionService.searchProducts(
            parsedCommand.itemName
          );
          const price = products.length > 0
          ? products[0].price
          : generateRandomPrice();

          handleAddItem(
            parsedCommand.itemName,
            parsedCommand.category,
            price,
            parsedCommand.quantity
          );
          showNotification(
            `✅ Added ${parsedCommand.quantity}x ${parsedCommand.itemName}`
          );
        } else {
          showNotification("⚠️ Could not understand the item name");
        }
        break;

      case "REMOVE":
        if (parsedCommand.itemName) {
          handleRemoveByName(parsedCommand.itemName);
        } else {
          showNotification("⚠️ Could not understand which item to remove");
        }
        break;

      case "CLEAR":
        handleClearList();
        showNotification("🗑️ Shopping list cleared");
        break;

      case "SHOW":
        showNotification("📋 Showing your shopping list");
        break;

      case "SEARCH":
        if (parsedCommand.itemName) {
          showNotification(`🔍 Search for: ${parsedCommand.itemName}`);
        }
        break;

      default:
        showNotification(
          '❓ Command not recognized. Try "Add milk" or "Remove bread"'
        );
    }
  };

  // Add item to list
  const handleAddItem = (name, category, price = 0, quantity = 1) => {
    // Check if item already exists
    const existingItem = shoppingList.find(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    // If price not provided, try to find from database
    if (price === 0) {
      const products = suggestionService.searchProducts(name);
      if (products.length > 0) {
        price = products[0].price;
        category = category || products[0].category;
      }
    }

    if (existingItem) {
      // Update quantity
      const updatedList = updateShoppingListItem(existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });
      setShoppingList(updatedList);
      showNotification(`✅ Updated ${name} quantity`);
    } else {
      // Add new item
      const newItem = addToShoppingList({ name, category, price, quantity });
      const updatedList = getShoppingList();
      setShoppingList(updatedList);
      addToHistory(newItem);
      updateSuggestions(updatedList);
    }
  };

  // Remove item by ID
  const handleRemoveItem = (itemId) => {
    const updatedList = removeFromShoppingList(itemId);
    setShoppingList(updatedList);
    updateSuggestions(updatedList);
    showNotification("🗑️ Item removed");
  };

  // Remove item by name (from voice command)
  const handleRemoveByName = (name) => {
    const item = shoppingList.find((item) =>
      item.name.toLowerCase().includes(name.toLowerCase())
    );

    if (item) {
      handleRemoveItem(item.id);
      showNotification(`✅ Removed ${item.name}`);
    } else {
      showNotification(`⚠️ Could not find "${name}" in your list`);
    }
  };

  // Toggle item completion
  const handleToggleComplete = (itemId) => {
    const updatedList = updateShoppingListItem(itemId, {
      completed: !shoppingList.find((item) => item.id === itemId).completed,
    });
    setShoppingList(updatedList);
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedList = updateShoppingListItem(itemId, {
      quantity: newQuantity,
    });
    setShoppingList(updatedList);
  };

  // Clear entire list
  const handleClearList = () => {
    if (window.confirm("Are you sure you want to clear the entire list?")) {
      clearShoppingList();
      setShoppingList([]);
      updateSuggestions([]);
    }
  };

  // Add suggestion to list
  const handleAddSuggestion = (name, category, price = 50) => {
    handleAddItem(name, category, price, 1);
    showNotification(`✅ Added ${name} from suggestions`);
  };

  // Export list as JSON
  const handleExportList = () => {
    const dataStr = JSON.stringify(shoppingList, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shopping-list-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    showNotification("📥 List exported successfully");
  };

  // Import list from JSON
  const handleImportList = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedList = JSON.parse(e.target.result);
        saveShoppingList(importedList);
        setShoppingList(importedList);
        updateSuggestions(importedList);
        showNotification("📤 List imported successfully");
      } catch (error) {
        showNotification("❌ Error importing list");
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-block mb-4">
            <div className="text-7xl floating">🛒</div>
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-3 drop-shadow-2xl">
            Voice Shopping Assistant
          </h1>
          <p className="text-white text-xl opacity-90 font-medium">
            Your smart voice-powered shopping companion ✨
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-white opacity-80">
            <span>🎤 Voice Commands</span>
            <span>•</span>
            <span>🤖 AI Suggestions</span>
            <span>•</span>
            <span>📱 Mobile Ready</span>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed top-8 right-8 z-50 bg-white rounded-2xl shadow-2xl px-8 py-5 animate-bounce-slow border-l-4 border-green-500 fade-in max-w-md">
            <p className="text-gray-800 font-bold text-lg">{notification}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Voice & Search */}
          <div className="lg:col-span-1">
            {/* Voice Input */}
            <VoiceInput onCommandReceived={handleVoiceCommand} />

            {/* Search Bar */}
            <SearchBar onAddItem={handleAddItem} />

            {/* Action Buttons */}
            <div className="glass-effect rounded-2xl p-4 space-y-2">
              <button
                onClick={() => setShowCategoryView(!showCategoryView)}
                className="w-full btn-primary"
              >
                {showCategoryView ? "📋 List View" : "📦 Category View"}
              </button>

              <button
                onClick={handleExportList}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
                disabled={shoppingList.length === 0}
              >
                <Download className="w-5 h-5 mr-2" />
                Export List
              </button>

              <label className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer">
                <Upload className="w-5 h-5 mr-2" />
                Import List
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportList}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleClearList}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
                disabled={shoppingList.length === 0}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear All
              </button>
            </div>
          </div>

          {/* Right Column - Shopping List & Suggestions */}
          <div className="lg:col-span-2">
            {/* Smart Suggestions */}
            <SmartSuggestions
              suggestions={suggestions}
              onAddSuggestion={handleAddSuggestion}
            />

            {/* Shopping List or Category View */}
            {showCategoryView ? (
              <CategoryView items={shoppingList} />
            ) : (
              <ShoppingList
                items={shoppingList}
                onToggleComplete={handleToggleComplete}
                onRemove={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 glass-effect rounded-2xl p-6">
          <p className="text-white text-base font-semibold mb-2">
            Built with ❤️ using cutting-edge technologies
          </p>
          <div className="flex justify-center gap-4 text-sm text-white opacity-80">
            <span>⚛️ React</span>
            <span>•</span>
            <span>🎤 Web Speech API</span>
            <span>•</span>
            <span>🎨 Tailwind CSS</span>
            <span>•</span>
            <span>🧠 NLP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;