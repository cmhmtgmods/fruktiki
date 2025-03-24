/**
 * Enhanced Win Modal System
 * This code manages when to display the win modal based on user balance and slot spins
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const THRESHOLD_BALANCE = 100; // Balance threshold in user currency
    const MIN_SPINS_AFTER_PROMO = 3; // Minimum spins required after a large promo activation
    
    // State variables
    let spinCounter = 0;
    let modalShown = false;
    let lastKnownBalance = 0;
    let userCurrency = 'USD'; // Default, will be updated
    let exchangeRate = 1; // Default, will be updated
    
    // DOM elements
    const winModal = document.getElementById('win-modal');
    const winModalAmount = document.getElementById('win-modal-amount');
    const winModalCurrency = document.getElementById('win-modal-currency');
    const winModalClaimBtn = document.getElementById('win-modal-claim-btn');
    const winModalCloseBtn = document.getElementById('win-modal-close-btn');
    const balanceElement = document.getElementById('balance-amount');
    const balanceCurrencyElement = document.querySelector('.balance-currency');
    const claimWinningsBtn = document.getElementById('claim-winnings-btn');
    const gameFrame = document.getElementById('game-frame');
    
    // Initialize modal and event listeners
    initWinModal();
    setupEventListeners();
    
    /**
     * Initialize win modal and its buttons
     */
    function initWinModal() {
        if (!winModal) {
            console.error('[MODAL] Win modal not found in DOM');
            return;
        }
        
        // Close button event handler
        if (winModalCloseBtn) {
            winModalCloseBtn.addEventListener('click', closeWinModal);
        }
        
        // Claim button event handler
        if (winModalClaimBtn) {
            winModalClaimBtn.addEventListener('click', handleClaimWinnings);
        }
        
        // Close modal on click outside content
        winModal.addEventListener('click', function(e) {
            if (e.target === winModal) {
                closeWinModal();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && winModal.style.display === 'flex') {
                closeWinModal();
            }
        });
        
        console.log('[MODAL] Win modal initialized');
    }
    
    /**
     * Set up all necessary event listeners
     */
    function setupEventListeners() {
        // Listen for messages from the game iframe
        window.addEventListener('message', handleGameMessages);
        
        // Attach event listener to claim button outside modal
        if (claimWinningsBtn) {
            claimWinningsBtn.addEventListener('click', handleClaimWinnings);
        }
        
        // Setup event listener for promo code activation
        const activatePromoBtn = document.getElementById('activate-promo-btn');
        if (activatePromoBtn) {
            const originalClickHandler = activatePromoBtn.onclick;
            
            activatePromoBtn.onclick = function(event) {
                // Call the original handler if it exists
                if (typeof originalClickHandler === 'function') {
                    originalClickHandler.call(this, event);
                }
                
                // Add our custom behavior - check after a slight delay
                setTimeout(checkAfterPromoActivation, 500);
            };
        }
        
        // Initialize currency info
        initCurrencyInfo();
        
        console.log('[MODAL] Event listeners set up');
    }
    
    /**
     * Handle messages from the game iframe
     */
    function handleGameMessages(event) {
        const data = event.data;
        
        // Ensure we have a valid message with a type
        if (!data || typeof data !== 'object' || !data.type) {
            return;
        }
        
        console.log('[MODAL] Received message from game:', data);
        
        // Handle balance updates and spin detection
        if (data.type === 'UPDATE_BALANCE') {
            // Get the new balance in EUR (internal currency)
            const newBalanceEUR = parseFloat(data.balance);
            
            // Update the last known balance
            lastKnownBalance = newBalanceEUR;
            
            // If this update includes a spin notification
            if (data.spinMade === true) {
                spinCounter++;
                console.log(`[MODAL] Spin detected! Total spins: ${spinCounter}`);
                
                // Check if we should show the modal
                setTimeout(() => {
                    checkModalConditions(newBalanceEUR);
                }, 1000);
            } else {
                // If not a spin, still check conditions (but may be from a promo code)
                checkModalConditions(newBalanceEUR);
            }
        }
    }
    
    /**
     * Check if modal should be shown after promo code activation
     */
    function checkAfterPromoActivation() {
        // Check localStorage to see if a promo was recently activated
        const promoActivated = localStorage.getItem('fruitParadisePromoActivated');
        const currentBalance = parseFloat(localStorage.getItem('fruitParadiseBalance')) || 0;
        
        if (promoActivated === 'true') {
            console.log('[MODAL] Promo was activated, checking balance and conditions');
            
            // Reset spin counter to ensure we track spins after promo
            spinCounter = 0;
            
            // Convert EUR balance to user currency for threshold checking
            const balanceInUserCurrency = convertToUserCurrency(currentBalance);
            
            // If promo gave enough to exceed threshold, mark that we need spins
            if (balanceInUserCurrency >= THRESHOLD_BALANCE) {
                localStorage.setItem('fruitParadiseNeedsSpins', 'true');
                console.log(`[MODAL] Large promo activated (${balanceInUserCurrency} ${userCurrency}), waiting for ${MIN_SPINS_AFTER_PROMO} spins`);
            }
            
            // Clear the activation flag
            localStorage.setItem('fruitParadisePromoActivated', 'false');
        }
    }
    
    /**
     * Check if modal should be shown based on current conditions
     */
    function checkModalConditions(balanceEUR) {
        // Convert to user currency for comparing against threshold
        const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
        
        console.log(`[MODAL] Checking conditions: Balance ${balanceInUserCurrency} ${userCurrency}, Spins ${spinCounter}`);
        
        // First condition: Balance is below threshold, don't show modal
        if (balanceInUserCurrency < THRESHOLD_BALANCE) {
            closeWinModal(); // Close modal if it's open but balance dropped below
            localStorage.setItem('fruitParadiseNeedsSpins', 'false'); // Reset needs spins flag
            return;
        }
        
        // Check if we need to wait for spins after a large promo
        const needsSpins = localStorage.getItem('fruitParadiseNeedsSpins') === 'true';
        
        if (needsSpins && spinCounter < MIN_SPINS_AFTER_PROMO) {
            console.log(`[MODAL] Waiting for more spins: ${spinCounter}/${MIN_SPINS_AFTER_PROMO}`);
            return;
        }
        
        // All conditions met, show the modal!
        showWinModal(balanceEUR);
        
        // Reset the needs spins flag
        if (needsSpins && spinCounter >= MIN_SPINS_AFTER_PROMO) {
            localStorage.setItem('fruitParadiseNeedsSpins', 'false');
        }
    }
    
    /**
     * Show the win modal with current balance
     */
    function showWinModal(balanceEUR) {
        if (!winModal) return;
        
        // Skip if modal is already showing
        if (winModal.style.display === 'flex') {
            return;
        }
        
        // Convert to user currency and format for display
        const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
        
        // Update modal content
        if (winModalAmount) {
            winModalAmount.textContent = formatCurrency(balanceInUserCurrency, false);
        }
        
        if (winModalCurrency) {
            winModalCurrency.textContent = userCurrency;
        }
        
        // Show modal
        winModal.style.display = 'flex';
        modalShown = true;
        
        // Create confetti animation
        createConfetti();
        
        console.log(`[MODAL] Win modal displayed with balance: ${balanceInUserCurrency} ${userCurrency}`);
    }
    
    /**
     * Close the win modal
     */
    function closeWinModal() {
        if (!winModal) return;
        
        winModal.style.opacity = '0';
        
        setTimeout(() => {
            winModal.style.display = 'none';
            winModal.style.opacity = '1';
            modalShown = false;
            
            // Clean up confetti
            const confettiContainer = winModal.querySelector('.win-confetti');
            if (confettiContainer) {
                confettiContainer.innerHTML = '';
            }
        }, 300);
        
        console.log('[MODAL] Win modal closed');
    }
    
    /**
     * Handle the claim winnings button click
     */
    function handleClaimWinnings() {
        console.log('[MODAL] Claim winnings button clicked');
        
        // Get thresholds from localStorage
        const thresholds = JSON.parse(localStorage.getItem('fruitParadiseThresholds')) || [];
        
        // Get current balance
        const currentBalanceEUR = parseFloat(localStorage.getItem('fruitParadiseBalance')) || 0;
        
        // Find appropriate threshold for redirect
        let targetUrl = null;
        let highestThresholdAmount = 0;
        
        for (const threshold of thresholds) {
            if (currentBalanceEUR >= threshold.amount && threshold.amount > highestThresholdAmount) {
                targetUrl = threshold.redirectUrl;
                highestThresholdAmount = threshold.amount;
            }
        }
        
        // Close modal if open
        closeWinModal();
        
        // Navigate to appropriate URL
        if (targetUrl) {
            console.log(`[MODAL] Redirecting to: ${targetUrl}`);
            window.location.href = targetUrl;
        } else {
            // Default redirect
            console.log('[MODAL] No threshold matched, redirecting to default');
            window.location.href = "/claim";
        }
    }
    
    /**
     * Initialize currency information
     */
    function initCurrencyInfo() {
        // Try to get currency info from global currency handler if available
        if (window.currencyHandler) {
            userCurrency = window.currencyHandler.userCurrency;
            exchangeRate = window.currencyHandler.exchangeRate;
        } else {
            // Fallback to localization manager or defaults
            if (window.localizationManager) {
                const countrySettings = CONFIG.countries[window.localizationManager.currentCountry] || CONFIG.default;
                userCurrency = countrySettings.currency_name;
                
                // Set default exchange rates (simplified)
                const rates = {
                    'EUR': 1,
                    'USD': 1.08,
                    'GBP': 0.86,
                    'CAD': 1.48,
                    'AUD': 1.65,
                    'AED': 3.97
                };
                exchangeRate = rates[userCurrency] || 1;
            }
        }
        
        // Update currency display in modal
        if (winModalCurrency) {
            winModalCurrency.textContent = userCurrency;
        }
        
        // Update currency display in balance
        if (balanceCurrencyElement) {
            balanceCurrencyElement.textContent = userCurrency;
        }
        
        console.log(`[MODAL] Currency initialized: ${userCurrency}, rate: ${exchangeRate}`);
    }
    
    /**
     * Convert a EUR amount to user currency
     */
    function convertToUserCurrency(amountEUR) {
        return amountEUR * exchangeRate;
    }
    
    /**
     * Format currency for display
     */
    function formatCurrency(amount, withSymbol = true) {
        // Round to 2 decimal places
        const formattedAmount = Math.round(amount * 100) / 100;
        
        // Don't use decimal places for JPY
        if (userCurrency === 'JPY') {
            return withSymbol ? `¥${Math.round(formattedAmount)}` : Math.round(formattedAmount).toString();
        }
        
        // Get currency symbol
        let symbol = '$';
        if (userCurrency === 'EUR') symbol = '€';
        else if (userCurrency === 'GBP') symbol = '£';
        else if (userCurrency === 'AED') symbol = 'AED';
        
        // Format with 2 decimal places
        return withSymbol 
            ? `${symbol}${formattedAmount.toFixed(2)}`
            : formattedAmount.toFixed(2);
    }
    
    /**
     * Create confetti animation inside modal
     */
    function createConfetti() {
        const confettiCount = 100;
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#2ecc71', '#9b59b6'];
        
        // Find confetti container
        const confettiContainer = document.querySelector('.win-confetti');
        if (!confettiContainer) return;
        
        // Clear previous confetti
        confettiContainer.innerHTML = '';
        
        // Create new confetti elements
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = Math.random() * 0.8 + 0.2;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear infinite`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            
            confettiContainer.appendChild(confetti);
        }
        
        // Add the CSS for animation if not already present
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.innerHTML = `
                .confetti-piece {
                    position: absolute;
                    top: -20px;
                    z-index: 1;
                }
                
                @keyframes fall {
                    0% {
                        top: -20px;
                        transform: translateX(0) rotate(0deg);
                    }
                    100% {
                        top: 100%;
                        transform: translateX(${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100}px) rotate(${Math.random() * 360}deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Initialize by checking current balance
    const initialBalanceEUR = parseFloat(localStorage.getItem('fruitParadiseBalance')) || 0;
    checkModalConditions(initialBalanceEUR);
    
    // Export functions for use by other scripts
    window.winModalSystem = {
        showWinModal,
        closeWinModal,
        checkModalConditions
    };
});
