/**
 * FRUIT PARADISE - SIMPLIFIED CURRENCY HANDLER
 * ==========================================
 * This file handles currency detection, conversion, and display.
 * It uses the central configuration from config.js.
 */
(function() {
    class CurrencyHandler {
        constructor() {
            // Initialize with default values
            this.userCurrency = 'EUR';
            this.currencySymbol = '€';
            this.exchangeRate = 1;
            this.balanceEUR = 0;
            
            // Load currency settings from the configuration
            this.currencySettings = window.SETTINGS_READER.getCurrencySettings();
            
            // Initialize currency based on user location
            this.initCurrency();
            
            // Initialize balance synchronization
            this.initBalanceSynchronization();
            
            console.log('[CURRENCY] Currency handler initialized');
        }
        
        /**
         * Initialize currency detection
         */
        async initCurrency() {
            try {
                // First try to load saved currency
                const savedCurrency = localStorage.getItem('fruitParadiseCurrency');
                
                if (savedCurrency && this.currencySettings.exchangeRates[savedCurrency]) {
                    this.userCurrency = savedCurrency;
                    console.log(`[CURRENCY] Loaded saved currency: ${this.userCurrency}`);
                } else {
                    // If no saved currency, detect by IP
                    await this.detectUserCurrency();
                }
                
                // Set currency symbol and exchange rate
                this.currencySymbol = this.currencySettings.symbols[this.userCurrency] || '€';
                this.exchangeRate = this.currencySettings.exchangeRates[this.userCurrency] || 1;
                
                // Update currency display
                this.updateCurrencyDisplay();
                
            } catch (error) {
                console.error('[CURRENCY] Error initializing currency:', error);
                // Set EUR as default currency
                this.userCurrency = 'EUR';
                this.currencySymbol = '€';
                this.exchangeRate = 1;
            }
        }
        
        /**
         * Detect user currency based on IP address
         */
        async detectUserCurrency() {
            try {
                // API to determine country by IP
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                
                const userCountryCode = data.country_code;
                console.log(`[CURRENCY] Detected country code: ${userCountryCode}`);
                
                // Determine currency by country
                if (userCountryCode && this.currencySettings.countryToCurrency[userCountryCode]) {
                    this.userCurrency = this.currencySettings.countryToCurrency[userCountryCode];
                } else {
                    // If we couldn't determine, use euro
                    this.userCurrency = 'EUR';
                }
                
                // Save currency for future sessions
                localStorage.setItem('fruitParadiseCurrency', this.userCurrency);
                console.log(`[CURRENCY] Set currency to: ${this.userCurrency}`);
                
            } catch (error) {
                console.error('[CURRENCY] Error detecting country:', error);
                // If country detection failed, use euro
                this.userCurrency = 'EUR';
            }
        }
        
        /**
         * Convert amount from internal currency (EUR) to user currency
         * @param {number} amountInEur - Amount in EUR
         * @returns {number} Amount in user currency
         */
        convertToUserCurrency(amountInEur) {
            return amountInEur * this.exchangeRate;
        }
        
        /**
         * Convert amount from user currency to internal currency (EUR)
         * @param {number} amountInUserCurrency - Amount in user currency
         * @returns {number} Amount in EUR
         */
        convertToBaseCurrency(amountInUserCurrency) {
            return amountInUserCurrency / this.exchangeRate;
        }
        
        /**
         * Format currency value for display
         * @param {number} amount - Amount to format
         * @param {boolean} withSymbol - Whether to include currency symbol
         * @returns {string} Formatted currency string
         */
        formatCurrency(amount, withSymbol = true) {
            // Round to 2 decimal places
            const formattedAmount = Math.round(amount * 100) / 100;
            
            // For Japanese yen, don't use decimal places
            if (this.userCurrency === 'JPY') {
                return withSymbol ? `${this.currencySymbol}${Math.round(formattedAmount)}` : Math.round(formattedAmount).toString();
            }
            
            // For other currencies, use 2 decimal places
            return withSymbol 
                ? `${this.currencySymbol}${formattedAmount.toFixed(2)}`
                : formattedAmount.toFixed(2);
        }
        
        /**
         * Update all currency displays on the page
         */
        updateCurrencyDisplay() {
            // Update all elements displaying currency symbol
            const currencyElements = document.querySelectorAll('.balance-currency');
            currencyElements.forEach(el => {
                el.textContent = this.userCurrency;
            });
            
            // Update jackpot and other fixed amounts
            this.updateJackpotAmount();
            
            // Update current balance
            this.updateBalanceDisplay();
        }
        
        /**
         * Update jackpot amount display
         */
        updateJackpotAmount() {
            const jackpotBase = 1250000; // base jackpot amount in EUR
            const jackpotInUserCurrency = this.convertToUserCurrency(jackpotBase);
            
            // Format jackpot with digit separators
            const formattedWithSeparators = new Intl.NumberFormat(document.documentElement.lang, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(Math.round(jackpotInUserCurrency));
            
            // Update all elements displaying jackpot
            document.querySelectorAll('.jackpot-amount, .jackpot-value').forEach(el => {
                el.textContent = `${this.currencySymbol}${formattedWithSeparators}`;
            });
        }
        
        /**
         * Initialize balance synchronization with game
         */
        initBalanceSynchronization() {
            // Listen for messages from the game iframe
            window.addEventListener('message', this.handleGameMessage.bind(this));
            
            // Handler for claim winnings button
            const claimBtn = document.getElementById('claim-winnings-btn');
            if (claimBtn) {
                claimBtn.addEventListener('click', this.handleClaimWinnings.bind(this));
            }
            
            // Get initial balance from localStorage
            this.balanceEUR = window.SETTINGS_READER.getCurrentBalance();
            
            // Delay to ensure currency rate is loaded
            setTimeout(() => {
                this.updateBalanceDisplay();
                this.syncBalanceToGame();
            }, 1000);
        }
        
        /**
         * Handle messages from the game iframe
         * @param {MessageEvent} event - The message event
         */
        handleGameMessage(event) {
            const data = event.data;
            
            // Check if message is from our game
            if (typeof data !== 'object' || !data.type) return;
            
            console.log('[CURRENCY] Received message from game:', data);
            
            switch (data.type) {
                case 'GAME_STARTED':
                    // Game loaded and ready to receive commands
                    console.log('[CURRENCY] Game started, syncing balance...');
                    this.syncBalanceToGame();
                    break;
                    
                case 'UPDATE_BALANCE':
                    // New balance received from game (in EUR)
                    console.log('[CURRENCY] Received balance update from game:', data.balance);
                    
                    // Update internal balance in EUR
                    this.balanceEUR = data.balance;
                    
                    // Save to localStorage
                    window.SETTINGS_READER.saveCurrentBalance(this.balanceEUR);
                    
                    // Update display
                    this.updateBalanceDisplay();
                    break;
            }
        }
        
        /**
         * Update balance display in interface
         */
        updateBalanceDisplay() {
            // Convert to user currency
            const balanceInUserCurrency = this.convertToUserCurrency(this.balanceEUR);
            
            // Get balance display element
            const balanceElement = document.getElementById('balance-amount');
            if (balanceElement) {
                balanceElement.textContent = this.formatCurrency(balanceInUserCurrency, false);
            }
            
            console.log(`[CURRENCY] Balance updated: ${this.balanceEUR} EUR = ${balanceInUserCurrency} ${this.userCurrency}`);
        }
        
        /**
         * Synchronize current balance with game (send to iframe)
         */
        syncBalanceToGame() {
            const gameFrame = document.getElementById('game-frame');
            if (!gameFrame || !gameFrame.contentWindow) {
                console.warn('[CURRENCY] Game frame not ready yet, will retry...');
                setTimeout(() => this.syncBalanceToGame(), 1000);
                return;
            }
            
            console.log('[CURRENCY] Syncing balance to game:', this.balanceEUR);
            
            // Send message to iframe
            gameFrame.contentWindow.postMessage({
                type: 'SET_BALANCE',
                balance: this.balanceEUR // important to send in EUR, as game works in EUR
            }, '*');
        }
        
        /**
         * Handle claim winnings button click
         */
        handleClaimWinnings() {
            // Get win thresholds from configuration
            const thresholds = window.SETTINGS_READER.getWinThresholds();
            
            // Find appropriate threshold for redirect
            let targetUrl = null;
            let highestThresholdAmount = 0;
            
            for (const threshold of thresholds) {
                if (this.balanceEUR >= threshold.amount && threshold.amount > highestThresholdAmount) {
                    targetUrl = threshold.redirectUrl;
                    highestThresholdAmount = threshold.amount;
                }
            }
            
            // Show success message
            alert(`Congratulations! You've successfully claimed ${this.formatCurrency(this.convertToUserCurrency(this.balanceEUR))}!`);
            
            // Reset balance
            this.balanceEUR = 0;
            window.SETTINGS_READER.saveCurrentBalance(0);
            
            // Update display
            this.updateBalanceDisplay();
            
            // Sync with game
            this.syncBalanceToGame();
            
            // Navigate to appropriate URL if found
            if (targetUrl) {
                console.log(`[CURRENCY] Redirecting to: ${targetUrl}`);
                window.location.href = targetUrl;
            } else {
                // Default redirect
                console.log('[CURRENCY] No threshold matched, redirecting to default');
                window.location.href = "/claim";
            }
        }
        
        /**
         * Update user balance by specified amount
         * @param {number} amount - Amount to update
         * @param {boolean} isDeposit - Whether it's a deposit (true) or withdrawal (false)
         */
        updateBalance(amount, isDeposit = true) {
            // Convert amount from user currency to EUR
            const amountInEUR = this.convertToBaseCurrency(amount);
            
            // Add or subtract from balance
            this.balanceEUR = isDeposit 
                ? this.balanceEUR + amountInEUR
                : Math.max(0, this.balanceEUR - amountInEUR);
                
            // Save updated balance
            window.SETTINGS_READER.saveCurrentBalance(this.balanceEUR);
            
            // Update display
            this.updateBalanceDisplay();
            
            // Sync with game
            this.syncBalanceToGame();
        }
    }

    // Create and export instance for global use
    window.currencyHandler = new CurrencyHandler();

})(); // End of self-executing function