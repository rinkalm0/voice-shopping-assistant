import { Package } from "lucide-react";
import { CATEGORIES } from "../utils/constants";

const CategoryView = ({ items }) => {
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

  const groupByCategory = () => {
    const grouped = {};

    items.forEach((item) => {
      const category = item.category || CATEGORIES.OTHER;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return grouped;
  };

  const categorizedItems = groupByCategory();
  const categories = Object.keys(categorizedItems);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="glass-effect rounded-2xl p-6 mb-6">
      <h2 className="text-white text-xl font-bold flex items-center mb-4">
        <Package className="w-6 h-6 mr-2" />
        Items by Category
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const categoryItems = categorizedItems[category];
          const totalItems = categoryItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const totalPrice = categoryItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div
              key={category}
              className="bg-white bg-opacity-90 rounded-xl p-4 hover:bg-opacity-100 transition-all"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">
                    {getCategoryIcon(category)}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-800">{category}</h3>
                    <p className="text-xs text-gray-600">
                      {totalItems} items • ₹{totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Items */}
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <div className="flex-1">
                      <p
                        className={`font-medium text-sm text-gray-800 ${
                          item.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {item.name}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-semibold text-green-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryView;
