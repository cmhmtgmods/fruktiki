/**
 * FRUIT PARADISE - SETTINGS READER
 * ===============================
 * This file provides functions to read settings from the config.js file.
 * It ensures consistent access to game settings throughout the application.
 */

(function() {
    // Check if configuration is loaded
    function ensureConfigLoaded() {
        if (typeof window.FRUIT_PARADISE_CONFIG === 'undefined') {
            console.error('[SETTINGS] Configuration not loaded! Make sure config.js is included before this script.');
            
            // Create default configuration as fallback
            window.FRUIT_PARADISE_CONFIG = {
                initialBalance: 20,
                promoCodes: [],
                winThresholds: [],
                currencies: {
                    baseCurrency: "EUR",
                    exchangeRates: { "EUR": 1 },
                    symbols: { "EUR": "€" },
                    countryToCurrency: {}
                }
            };
        }
    }
    
    /**
     * Get the initial balance for new players
     * @returns {number} Initial balance in EUR
     */
    function getInitialBalance() {
        ensureConfigLoaded();
        return window.FRUIT_PARADISE_CONFIG.initialBalance;
    }
    
    /**
     * Get all available promo codes
     * @returns {Array} Array of promo code objects
     */
    function getPromoCodes() {
        ensureConfigLoaded();
        return window.FRUIT_PARADISE_CONFIG.promoCodes || [];
    }
    
    /**
     * Get all win thresholds
     * @returns {Array} Array of threshold objects
     */
    function getWinThresholds() {
        ensureConfigLoaded();
        return window.FRUIT_PARADISE_CONFIG.winThresholds || [];
    }
    
    /**
     * Get currency settings
     * @returns {Object} Currency configuration
     */
    function getCurrencySettings() {
        ensureConfigLoaded();
        return window.FRUIT_PARADISE_CONFIG.currencies || {};
    }
    
    /**
     * Get game settings
     * @returns {Object} Game configuration
     */
    function getGameSettings() {
        ensureConfigLoaded();
        return window.FRUIT_PARADISE_CONFIG.gameSettings || {};
    }
    
    /**
     * Get paytable configuration
     * @returns {Object} Paytable settings
     */
    function getPaytable() {
        ensureConfigLoaded();
        return window.FRUIT_PARADISE_CONFIG.paytable || {};
    }
    
    /**
     * Get win modal settings
     * @returns {Object} Win modal configuration
     */
    function getWinModalSettings() {
        ensureConfigLoaded();
        return window.FRUIT_PARADISE_CONFIG.winModal || {};
    }
    
    /**
     * Save current balance to localStorage
     * @param {number} amount - Current balance amount
     */
    function saveCurrentBalance(amount) {
        if (typeof amount === 'number' && !isNaN(amount)) {
            localStorage.setItem('fruitParadiseBalance', amount.toString());
            console.log(`[SETTINGS] Saved current balance: ${amount}`);
        }
    }
    
    /**
     * Get current balance from localStorage
     * @returns {number} Current balance or initial balance if not set
     */
    function getCurrentBalance() {
        const savedBalance = parseFloat(localStorage.getItem('fruitParadiseBalance'));
        
        if (!isNaN(savedBalance)) {
            return savedBalance;
        }
        
        // If no saved balance, use initial balance
        const initialBalance = getInitialBalance();
        saveCurrentBalance(initialBalance);
        return initialBalance;
    }
    
    /**
     * Save used promo codes
     * @param {Object} usedCodes - Object tracking used promo codes
     */
    function saveUsedPromoCodes(usedCodes) {
        if (usedCodes && typeof usedCodes === 'object') {
            localStorage.setItem('fruitParadiseUsedCodes', JSON.stringify(usedCodes));
        }
    }
    
    /**
     * Get used promo codes
     * @returns {Object} Object tracking used promo codes
     */
    function getUsedPromoCodes() {
        try {
            const saved = localStorage.getItem('fruitParadiseUsedCodes');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('[SETTINGS] Error parsing used promo codes:', e);
            return {};
        }
    }
    
    // Create the settings reader object
    window.SETTINGS_READER = {
        getInitialBalance,
        getPromoCodes,
        getWinThresholds,
        getCurrencySettings,
        getGameSettings,
        getPaytable,
        getWinModalSettings,
        saveCurrentBalance,
        getCurrentBalance,
        saveUsedPromoCodes,
        getUsedPromoCodes
    };
    
    console.log('[SETTINGS] Settings reader initialized');
})();