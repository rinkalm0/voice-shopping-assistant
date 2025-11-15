import { Check, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";

const ShoppingList = ({
  items,
  onToggleComplete,
  onRemove,
  onUpdateQuantity,
}) => {
  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Dairy: "🥛",
      Produce: "🥗",
      "Meat & Seafood": "🍖",
      Bakery: "🍞",
      Beverages: "🥤",
      Snacks: "🍿",
      "Personal Care": "🧴",
      Household: "🧹",
      "Frozen Foods": "🧊",
      Pantry: "🏺",
      Other: "🛒",
    };
    return icons[category] || "🛒";
  };

  if (items.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-12 text-center fade-in">
        <div className="floating mb-6">
          <ShoppingCart className="w-24 h-24 text-white mx-auto opacity-60" />
        </div>
        <h3 className="text-white text-2xl font-bold mb-3">
          Your cart is empty
        </h3>
        <p className="text-gray-200 text-lg">
          Use voice commands or search to add items
        </p>
        <div className="mt-6 inline-block bg-white bg-opacity-20 rounded-xl px-6 py-3">
          <p className="text-white text-sm">
            💡 Try saying "Add milk" or "Buy 2 apples"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white border-opacity-20">
        <div>
          <h2 className="text-white text-2xl font-bold flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Shopping List
          </h2>
          <p className="text-gray-200 text-sm mt-1">
            {getTotalItems()} items • ₹{getTotalPrice().toFixed(2)}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white bg-opacity-90 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
              item.completed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Item Info */}
              <div className="flex items-start flex-1">
                {/* Checkbox */}
                <button
                  onClick={() => onToggleComplete(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-1 transition-all ${
                    item.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">
                      {getCategoryIcon(item.category)}
                    </span>
                    <h3
                      className={`font-semibold text-gray-800 ${
                        item.completed ? "line-through" : ""
                      }`}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs mr-2">
                      {item.category}
                    </span>
                    <span className="font-semibold text-green-600">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>

                <span className="w-8 text-center font-semibold text-gray-800">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all ml-2"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white border-opacity-20">
        <div className="flex justify-between items-center text-white">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold">
            ₹{getTotalPrice().toFixed(2)}
          </span>
        </div>
        <div className="text-gray-200 text-sm mt-1">
          {items.filter((i) => i.completed).length} of {items.length} items
          completed
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
