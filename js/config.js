/**
 * FRUIT PARADISE - MAIN CONFIGURATION FILE
 * ========================================
 * This file contains all configuration settings for the slot game.
 * Edit this file directly to change game settings.
 */

// Global Game Configuration
const FRUIT_PARADISE_CONFIG = {
    // Initial balance for new players (in EUR)
    initialBalance: 20,
    
    // Available promo codes
    promoCodes: [
        { code: "FRUIT10", amount: 10, maxActivations: 100 },
        { code: "WELCOME20", amount: 20, maxActivations: 100 },
        { code: "PARADISE50", amount: 50, maxActivations: 50 },
        { code: "TEST202", amount: 85, maxActivations: 50 },
        { code: "VIP100", amount: 100, maxActivations: 1 }
    ],
    
    // Win thresholds for redirects
    winThresholds: [
        { amount: 30, redirectUrl: "https://www.twitch.tv/" },
        { amount: 50, redirectUrl: "/claim-big" },
        { amount: 100, redirectUrl: "https://youtube.com" }
    ],
    
    // Currency settings
    currencies: {
        // Base currency (all internal calculations use EUR)
        baseCurrency: "EUR",
        
        // Exchange rates relative to EUR
        exchangeRates: {
            "EUR": 1,
            "USD": 1.08,
            "GBP": 0.86,
            "CNY": 7.8,
            "JPY": 160.5,
            "INR": 89.7,
            "CAD": 1.48,
            "AUD": 1.65,
            "AED": 3.97
        },
        
        // Currency symbols
        symbols: {
            "EUR": "€",
            "USD": "$",
            "GBP": "£",
            "CNY": "¥",
            "JPY": "¥",
            "INR": "₹",
            "CAD": "C$",
            "AUD": "A$",
            "AED": "AED"
        },
        
        // Country to currency mapping
        countryToCurrency: {
            // Europe
            "AT": "EUR", "BE": "EUR", "BG": "EUR", "HR": "EUR", "CY": "EUR",
            "CZ": "EUR", "DK": "EUR", "EE": "EUR", "FI": "EUR", "FR": "EUR",
            "DE": "EUR", "GR": "EUR", "HU": "EUR", "IE": "EUR", "IT": "EUR",
            "LV": "EUR", "LT": "EUR", "LU": "EUR", "MT": "EUR", "NL": "EUR",
            "PL": "EUR", "PT": "EUR", "RO": "EUR", "SK": "EUR", "SI": "EUR",
            "ES": "EUR", "SE": "EUR",
            
            // Other countries
            "US": "USD",
            "GB": "GBP",
            "CN": "CNY",
            "JP": "JPY",
            "IN": "INR",
            "CA": "CAD",
            "AU": "AUD",
            "AE": "AED",
            "RU": "USD" // Using USD for Russia
        }
    },
    
    // Game settings
    gameSettings: {
        // Win percentage (0-100)
        winOccurrence: 30,
        
        // Slot cash amount available for winnings
        slotCash: 2000,
        
        // Number of reel loops before slot stops
        minReelLoop: 2,
        
        // Number of frames to delay reels that start after the first one
        reelDelay: 6,
        
        // Duration in milliseconds of the winning combo showing
        timeShowWin: 2000,
        
        // Duration in milliseconds of all winning combos
        timeShowAllWins: 2000,
        
        // Enable/disable features
        fullscreen: true,
        checkOrientation: true,
        showCredits: true,
        
        // Number of spins played before ad showing
        adShowCounter: 3
    },
    
    // Paytable configuration
    paytable: {
        // Multipliers for X1, X2, X3, X4, or X5 combos
        symbol1: [0, 0, 100, 150, 200], // Symbol 1
        symbol2: [0, 0, 50, 100, 150],  // Symbol 2
        symbol3: [0, 10, 25, 50, 100],  // Symbol 3
        symbol4: [0, 10, 25, 50, 100],  // Symbol 4
        symbol5: [0, 5, 15, 25, 50],    // Symbol 5
        symbol6: [0, 2, 10, 20, 35],    // Symbol 6
        symbol7: [0, 1, 5, 10, 15]      // Symbol 7
    },
    
    // Win modal settings
    winModal: {
        // Threshold balance in user currency to show win modal
        thresholdBalance: 100,
        
        // Minimum spins required after promo activation
        minSpinsAfterPromo: 3
    }
};

// Export the configuration
window.FRUIT_PARADISE_CONFIG = FRUIT_PARADISE_CONFIG;
