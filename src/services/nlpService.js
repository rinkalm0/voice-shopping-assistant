import { VOICE_COMMANDS, CATEGORY_KEYWORDS, CATEGORIES } from '../utils/constants';

// NLP Service for understanding voice commands
class NLPService {

    // Parse voice command and extract intent
    parseCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase().trim();

        // Detect command type
        const commandType = this.detectCommandType(lowerTranscript);

        // Extract item name and quantity
        const { itemName, quantity } = this.extractItemAndQuantity(lowerTranscript, commandType);

        // Get category
        const category = this.categorizeItem(itemName);

        // Extract price range (for search)
        const priceRange = this.extractPriceRange(lowerTranscript);

        return {
            command: commandType,
            itemName: itemName,
            quantity: quantity,
            category: category,
            priceRange: priceRange,
            originalTranscript: transcript
        };
    }

    // Detect command type (ADD, REMOVE, SEARCH, etc.)
    detectCommandType(transcript) {
        // Check for REMOVE commands
        for (const keyword of VOICE_COMMANDS.REMOVE) {
            if (transcript.includes(keyword)) {
                return 'REMOVE';
            }
        }

        // Check for CLEAR commands
        for (const keyword of VOICE_COMMANDS.CLEAR) {
            if (transcript.includes(keyword)) {
                return 'CLEAR';
            }
        }

        // Check for SEARCH commands
        for (const keyword of VOICE_COMMANDS.SEARCH) {
            if (transcript.includes(keyword)) {
                return 'SEARCH';
            }
        }

        // Check for SHOW commands
        for (const keyword of VOICE_COMMANDS.SHOW) {
            if (transcript.includes(keyword)) {
                return 'SHOW';
            }
        }

        // Default to ADD
        return 'ADD';
    }

    // Extract item name and quantity from transcript
    extractItemAndQuantity(transcript, commandType) {
        let itemName = transcript;
        let quantity = 1;

        // Remove command keywords
        const allKeywords = [
            ...VOICE_COMMANDS.ADD,
            ...VOICE_COMMANDS.REMOVE,
            ...VOICE_COMMANDS.SEARCH,
            ...VOICE_COMMANDS.SHOW,
            ...VOICE_COMMANDS.CLEAR
        ];

        for (const keyword of allKeywords) {
            itemName = itemName.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '');
        }

        // Remove common filler words
        const fillerWords = ['to', 'my', 'list', 'the', 'a', 'an', 'some', 'from', 'please', 'can', 'you', 'i', 'want', 'need', 'get'];
        for (const word of fillerWords) {
            itemName = itemName.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
        }

        // Extract quantity (numbers)
        const quantityMatch = itemName.match(/(\d+)\s*(?:bottles?|pieces?|kg|grams?|liters?|packs?|boxes?)?/i);
        if (quantityMatch) {
            quantity = parseInt(quantityMatch[1]);
            itemName = itemName.replace(quantityMatch[0], '');
        }

        // Alternative quantity patterns
        const wordNumbers = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5
        };

        for (const [word, num] of Object.entries(wordNumbers)) {
            if (itemName.includes(word)) {
                quantity = num;
                itemName = itemName.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
            }
        }

        // Clean up item name
        itemName = itemName.trim().replace(/\s+/g, ' ');

        // Capitalize first letter of each word
        itemName = itemName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return { itemName, quantity };
    }

    // Categorize item based on keywords
    categorizeItem(itemName) {
        const lowerItemName = itemName.toLowerCase();

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            for (const keyword of keywords) {
                if (lowerItemName.includes(keyword)) {
                    return category;
                }
            }
        }

        return CATEGORIES.OTHER;
    }

    // Extract price range from transcript
    extractPriceRange(transcript) {
        const priceMatch = transcript.match(/(?:under|below|less than|maximum)\s*(?:rs\.?|rupees?)?\s*(\d+)/i);
        if (priceMatch) {
            return {
                max: parseInt(priceMatch[1]),
                min: 0
            };
        }

        const rangeMatch = transcript.match(/between\s*(?:rs\.?|rupees?)?\s*(\d+)\s*(?:and|to)\s*(?:rs\.?|rupees?)?\s*(\d+)/i);
        if (rangeMatch) {
            return {
                min: parseInt(rangeMatch[1]),
                max: parseInt(rangeMatch[2])
            };
        }

        return null;
    }

    // Find similar items (for typo tolerance)
    findSimilarItems(itemName, itemsList) {
        const lowerItemName = itemName.toLowerCase();

        return itemsList.filter(item => {
            const lowerName = item.name.toLowerCase();
            return lowerName.includes(lowerItemName) ||
                lowerItemName.includes(lowerName) ||
                this.levenshteinDistance(lowerItemName, lowerName) <= 2;
        });
    }

    // Calculate Levenshtein distance (for fuzzy matching)
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }
}

const nlpService = new NLPService();

export default nlpService;