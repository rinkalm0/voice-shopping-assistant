import { COMMON_PRODUCTS, SEASONAL_PRODUCTS, SUBSTITUTES } from '../utils/constants';
import { getShoppingHistory } from '../utils/localStorage';

// Smart Suggestion Service
class SuggestionService {

    // Get product recommendations based on history
    getRecommendations(currentList = []) {
        const history = getShoppingHistory();
        const currentItemNames = currentList.map(item => item.name.toLowerCase());

        // Get frequently bought items
        const frequentItems = history
            .filter(item => item.count >= 2)
            .filter(item => !currentItemNames.includes(item.name.toLowerCase()))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Get items not bought recently
        const recentThreshold = new Date();
        recentThreshold.setDate(recentThreshold.getDate() - 7); // Last 7 days

        const itemsDueForPurchase = history
            .filter(item => {
                const lastPurchased = new Date(item.lastPurchased);
                return lastPurchased < recentThreshold;
            })
            .filter(item => !currentItemNames.includes(item.name.toLowerCase()))
            .slice(0, 3);

        return {
            frequent: frequentItems,
            due: itemsDueForPurchase,
            seasonal: this.getSeasonalSuggestions(currentItemNames)
        };
    }

    // Get seasonal product suggestions
    getSeasonalSuggestions(excludeItems = []) {
        const currentMonth = new Date().getMonth(); // 0-11
        let season = 'SPRING';

        if (currentMonth >= 11 || currentMonth <= 1) {
            season = 'WINTER';
        } else if (currentMonth >= 2 && currentMonth <= 4) {
            season = 'SPRING';
        } else if (currentMonth >= 5 && currentMonth <= 8) {
            season = 'SUMMER';
        } else if (currentMonth >= 9 && currentMonth <= 10) {
            season = 'MONSOON';
        }

        const seasonalItems = SEASONAL_PRODUCTS[season] || [];

        return seasonalItems
            .filter(item => !excludeItems.includes(item.toLowerCase()))
            .map(item => ({
                name: item.charAt(0).toUpperCase() + item.slice(1),
                reason: `${season.toLowerCase()} seasonal item`
            }))
            .slice(0, 3);
    }

    // Get substitute suggestions for an item
    getSubstitutes(itemName) {
        const lowerItemName = itemName.toLowerCase();

        for (const [product, subs] of Object.entries(SUBSTITUTES)) {
            if (lowerItemName.includes(product)) {
                return subs.map(sub => ({
                    name: sub.charAt(0).toUpperCase() + sub.slice(1),
                    original: itemName
                }));
            }
        }

        return [];
    }

    // Search products from database
    searchProducts(query, priceRange = null) {
        const lowerQuery = query.toLowerCase();

        let results = COMMON_PRODUCTS.filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery)
        );

        // Apply price filter
        if (priceRange) {
            results = results.filter(product => {
                if (priceRange.min && product.price < priceRange.min) return false;
                if (priceRange.max && product.price > priceRange.max) return false;
                return true;
            });
        }

        return results;
    }

    // Get complementary items (items that go well together)
    getComplementaryItems(itemName) {
        const complementaryMap = {
            'bread': ['butter', 'jam', 'cheese', 'eggs'],
            'milk': ['cereal', 'cookies', 'coffee', 'tea'],
            'pasta': ['tomato sauce', 'cheese', 'olive oil'],
            'rice': ['dal', 'curry', 'vegetables'],
            'tea': ['sugar', 'milk', 'biscuits'],
            'coffee': ['milk', 'sugar', 'cream'],
            'chips': ['soda', 'dip', 'salsa'],
            'flour': ['sugar', 'eggs', 'butter', 'yeast']
        };

        const lowerItemName = itemName.toLowerCase();

        for (const [item, complements] of Object.entries(complementaryMap)) {
            if (lowerItemName.includes(item)) {
                return complements.map(c => ({
                    name: c.charAt(0).toUpperCase() + c.slice(1),
                    reason: `Goes well with ${itemName}`
                }));
            }
        }

        return [];
    }

    // Get low stock alerts (items that should be restocked)
    getLowStockAlerts() {
        const history = getShoppingHistory();
        const alerts = [];

        const essentialItems = ['milk', 'bread', 'eggs', 'rice', 'water'];

        for (const essential of essentialItems) {
            const historyItem = history.find(h =>
                h.name.toLowerCase().includes(essential)
            );

            if (historyItem) {
                const daysSinceLastPurchase = Math.floor(
                    (new Date() - new Date(historyItem.lastPurchased)) / (1000 * 60 * 60 * 24)
                );

                if (daysSinceLastPurchase > 5) {
                    alerts.push({
                        name: historyItem.name,
                        daysSince: daysSinceLastPurchase,
                        message: `You haven't bought ${historyItem.name} in ${daysSinceLastPurchase} days`
                    });
                }
            }
        }

        return alerts;
    }

    // Get smart suggestions based on current list
    getSmartSuggestions(currentList) {
        const suggestions = [];

        // Add complementary items
        currentList.forEach(item => {
            const complements = this.getComplementaryItems(item.name);
            suggestions.push(...complements);
        });

        // Add seasonal items
        const seasonal = this.getSeasonalSuggestions(
            currentList.map(i => i.name.toLowerCase())
        );
        suggestions.push(...seasonal);

        // Remove duplicates
        const uniqueSuggestions = suggestions.filter((item, index, self) =>
            index === self.findIndex(t => t.name === item.name)
        );

        return uniqueSuggestions.slice(0, 5);
    }
}

const suggestionService = new SuggestionService();

export default suggestionService;