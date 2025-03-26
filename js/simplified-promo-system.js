/**
 * FRUIT PARADISE - SIMPLIFIED PROMO CODE SYSTEM
 * ===========================================
 * This file handles promo code activation and balance updates.
 * It uses the central configuration from config.js.
 */
(function() {

    function createSpinTracker() {
        console.log('[PROMO] Устанавливаем новую систему отслеживания спинов');
        
        // Базовые переменные
        const SPIN_COUNTER_KEY = 'fruitParadiseSpinCounter';
        let lastKnownBalance = parseFloat(localStorage.getItem('fruitParadiseBalance') || '0');
        
        // Инициализируем счетчик, если нужно
        if (!localStorage.getItem(SPIN_COUNTER_KEY)) {
            localStorage.setItem(SPIN_COUNTER_KEY, '0');
        }
        
        // Периодически проверяем изменение баланса
        setInterval(() => {
            const currentBalance = parseFloat(localStorage.getItem('fruitParadiseBalance') || '0');
            
            // Если баланс изменился хоть немного, считаем это спином
            if (Math.abs(currentBalance - lastKnownBalance) > 0.01) {
                // Получаем текущий счетчик
                let counter = parseInt(localStorage.getItem(SPIN_COUNTER_KEY) || '0');
                
                // Увеличиваем счетчик
                counter++;
                
                // Сохраняем
                localStorage.setItem(SPIN_COUNTER_KEY, counter.toString());
                
                console.log(`[SPIN TRACKER] Обнаружен спин! Баланс: ${lastKnownBalance} → ${currentBalance}, Спинов: ${counter}`);
                
                // Обновляем последний известный баланс
                lastKnownBalance = currentBalance;
            }
        }, 500); // Проверяем каждые 500мс
        
        // Переопределяем функцию проверки условий для модального окна
        window.checkModalConditionsForWin = function() {
            const balance = parseFloat(localStorage.getItem('fruitParadiseBalance') || '0');
            const spins = parseInt(localStorage.getItem(SPIN_COUNTER_KEY) || '0');
            
            console.log(`[SPIN TRACKER] Проверка условий: Баланс ${balance}, Спины ${spins}`);
            
            // Если баланс > 100 и спинов >= 3, показываем окно
            if (balance >= 100 && spins >= 3) {
                console.log('[SPIN TRACKER] Условия выполнены! Показываем модальное окно');
                showWinModal(balance);
            }
        };
        
        // Запускаем периодическую проверку условий
        setInterval(() => {
            window.checkModalConditionsForWin();
        }, 2000);
        
        // Переопределяем функцию сброса счетчика при активации промокода
        window.resetSpinCounterAfterPromo = function() {
            localStorage.setItem(SPIN_COUNTER_KEY, '0');
            console.log('[SPIN TRACKER] Счетчик спинов сброшен в 0');
        };
        
        console.log('[PROMO] Новая система отслеживания спинов установлена!');
    }
    // State variables

    let spinCounter = 0;
    let modalShown = false;

    // DOM elements
    let winModal = null;
    let winModalAmount = null;
    let winModalCurrency = null;
    let winModalClaimBtn = null;
    let winModalCloseBtn = null;
    let promoCodeInput = null;
    let promoMessage = null;
    let activatePromoBtn = null;

    // Constants for storage keys
    const STORAGE_SPIN_COUNTER_KEY = 'fruitParadiseSpinCounter';
    const STORAGE_USER_ID_KEY = 'fruitParadiseUserId';
    const STORAGE_USER_PROMOS_KEY = 'fruitParadiseUserUsedCodes';
    
    /**
     * Initialize the promo system
     */
    function initPromoSystem() {
        console.log('[PROMO] Initializing promo code system');
        
        // Get DOM elements
        findDomElements();
        
        // Load spin counter from localStorage
        spinCounter = parseInt(localStorage.getItem(STORAGE_SPIN_COUNTER_KEY) || '0');
        console.log(`[PROMO] Loaded spin counter: ${spinCounter}`);
        
        // Add event listeners for promo button
        if (activatePromoBtn) {
            activatePromoBtn.addEventListener('click', handlePromoActivation);
        }
        
        // Add event listener for promo input field
        if (promoCodeInput) {
            promoCodeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handlePromoActivation();
                }
            });
        }
        
        // Listen for messages from the game iframe
        window.addEventListener('message', handleGameMessages);
        
        // Initialize win modal
        initWinModal();
    }
    
    /**
     * Find all necessary DOM elements
     */
    function findDomElements() {
        winModal = document.getElementById('win-modal');
        winModalAmount = document.getElementById('win-modal-amount');
        winModalCurrency = document.getElementById('win-modal-currency');
        winModalClaimBtn = document.getElementById('win-modal-claim-btn');
        winModalCloseBtn = document.getElementById('win-modal-close-btn');
        promoCodeInput = document.getElementById('promo-code-input');
        promoMessage = document.getElementById('promo-message');
        activatePromoBtn = document.getElementById('activate-promo-btn');
    }
    
    /**
     * Initialize win modal and buttons
     */
    function initWinModal() {
        if (!winModal) {
            console.error('[PROMO] Win modal not found in DOM');
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
        
        console.log('[PROMO] Win modal initialized');
    }
    
    /**
     * Handle messages from the game iframe
     */
    function handleGameMessages(event) {
        const data = event.data;
        
        // Check for valid message
        if (!data || typeof data !== 'object' || !data.type) {
            return;
        }
        
        console.log('[PROMO] Received message from game:', data);
        
        // Handle balance updates
        if (data.type === 'UPDATE_BALANCE') {
            // ПРИНУДИТЕЛЬНО СЧИТАЕМ КАЖДОЕ СООБЩЕНИЕ КАК СПИН
            
            // Сначала читаем текущее значение из localStorage
            let currentSpins = parseInt(localStorage.getItem(STORAGE_SPIN_COUNTER_KEY) || '0');
            
            // Увеличиваем счетчик НЕЗАВИСИМО от изменения баланса
            currentSpins++;
            
            // Сохраняем новое значение
            localStorage.setItem(STORAGE_SPIN_COUNTER_KEY, currentSpins.toString());
            
            // Обновляем переменную в памяти
            spinCounter = currentSpins;
            
            console.log(`[PROMO] ПРИНУДИТЕЛЬНО засчитан спин для любого сообщения. Всего спинов: ${currentSpins}`);
            
            // Get new balance in EUR (internal currency)
            const newBalanceEUR = parseFloat(data.balance);
            
            // Сохраняем новый баланс для будущих сравнений
            localStorage.setItem('fruitParadiseBalance', newBalanceEUR.toString());
            
            // Проверяем условия для показа модального окна
            setTimeout(() => {
                // Опять читаем из localStorage, чтобы точно получить актуальные данные
                spinCounter = parseInt(localStorage.getItem(STORAGE_SPIN_COUNTER_KEY) || '0');
                checkModalConditions(newBalanceEUR);
            }, 500);
        }
    }
    
    /**
     * Process promo code activation
     */
    function handlePromoActivation() {
        localStorage.setItem('fruitParadiseSpinCounter', '0');
console.log('[PROMO] Промокод активирован, счетчик спинов сброшен в 0');
        if (window.resetSpinCounterAfterPromo) {
            window.resetSpinCounterAfterPromo();
        } else {
            localStorage.setItem(STORAGE_SPIN_COUNTER_KEY, '0');
            spinCounter = 0;
            console.log('[PROMO] Промокод активирован, счетчик спинов сброшен в 0');
        }
        // Refresh DOM elements references if they're not set
        if (!promoCodeInput || !promoMessage) {
            findDomElements();
        }
        
        if (!promoCodeInput || !promoMessage) {
            console.warn('[PROMO] Promo code elements not found');
            return;
        }
        
        const code = promoCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            showPromoMessage('Please enter a promo code', 'error');
            return;
        }
        
        console.log(`[PROMO] Processing promo code: ${code}`);
        
        // Get available promo codes from configuration
        const availablePromos = window.SETTINGS_READER.getPromoCodes();
        console.log(`[PROMO] Available promo codes: ${availablePromos.length}`);
        
        // Find matching promo code
        const promo = availablePromos.find(p => p.code.toUpperCase() === code);
        
        if (!promo) {
            showPromoMessage('Invalid promo code', 'error');
            return;
        }
        
        // Check if user has used this promo code before
        if (hasUserUsedPromoCode(code)) {
            showPromoMessage(`You have already used promo code ${code}`, 'error');
            return;
        }
        
        // Get used promo codes statistics
        const usedPromoCodes = window.SETTINGS_READER.getUsedPromoCodes();
        const usedPromoEntry = usedPromoCodes[code] || { usageCount: 0 };
        
        // Check activation limit
        const maxActivations = promo.maxActivations || Infinity;
        
        if (usedPromoEntry.usageCount >= maxActivations) {
            showPromoMessage(`Promo code ${code} is no longer valid (activation limit reached)`, 'error');
            return;
        }
        
        // Apply promo code bonus
        const currentBalanceEUR = window.SETTINGS_READER.getCurrentBalance();
        const newBalanceEUR = currentBalanceEUR + promo.amount;
        
        console.log(`[PROMO] Applying promo code: ${currentBalanceEUR} EUR -> ${newBalanceEUR} EUR (+${promo.amount} EUR)`);
        
        // Update balance
        window.SETTINGS_READER.saveCurrentBalance(newBalanceEUR);
        
        // Reset spin counter
        spinCounter = 0;
        localStorage.setItem(STORAGE_SPIN_COUNTER_KEY, '0');
        console.log('[PROMO] Promo code activated, spin counter reset');
        
        // Update used promo codes statistics
        usedPromoEntry.usageCount = (usedPromoEntry.usageCount || 0) + 1;
        usedPromoEntry.lastUsed = new Date().toISOString();
        usedPromoCodes[code] = usedPromoEntry;
        window.SETTINGS_READER.saveUsedPromoCodes(usedPromoCodes);
        
        // Mark promo code as used by this user
        markPromoCodeAsUsedByUser(code);
        
        // Format promo amount for display
        const promoAmountInUserCurrency = window.currencyHandler.convertToUserCurrency(promo.amount);
        const formattedPromoAmount = window.currencyHandler.formatCurrency(promoAmountInUserCurrency);
        
        // Show success message
        const remainingActivations = maxActivations - usedPromoEntry.usageCount;
        let successMessage = `Promo code ${code} activated! You received ${formattedPromoAmount}`;
        if (maxActivations !== Infinity && remainingActivations > 0) {
            successMessage += ` (${remainingActivations} activations remaining)`;
        } else if (maxActivations !== Infinity && remainingActivations === 0) {
            successMessage += ` (this was the last activation)`;
        }
        
        showPromoMessage(successMessage, 'success');
        
        // Clear input field
        promoCodeInput.value = '';
        
        // Update display
        if (window.currencyHandler) {
            window.currencyHandler.balanceEUR = newBalanceEUR;
            window.currencyHandler.updateBalanceDisplay();
            window.currencyHandler.syncBalanceToGame();
        }
        
        // Reload game frame to apply new balance
        reloadGameFrame();
        

    }
    
    /**
     * Check if win modal should be shown based on current conditions
     * @param {number} balanceEUR - Current balance in EUR
     */
    function checkModalConditions(balanceEUR) {
        // ВАЖНО: ВСЕГДА читаем счетчик из localStorage
        const spinCount = parseInt(localStorage.getItem(STORAGE_SPIN_COUNTER_KEY) || '0');
        spinCounter = spinCount; // Обновляем переменную в памяти
        
        // Получаем настройки для модального окна
        const winModalSettings = window.SETTINGS_READER.getWinModalSettings();
        
        // Конвертируем баланс для сравнения с порогом
        const balanceInUserCurrency = window.currencyHandler.convertToUserCurrency(balanceEUR);
        
        console.log(`[PROMO] Checking modal conditions: Balance ${balanceInUserCurrency}, Spins ${spinCount}`);
        
        // Условие 1: Баланс ниже порога
        if (balanceInUserCurrency < winModalSettings.thresholdBalance) {
            console.log(`[PROMO] Balance too low: ${balanceInUserCurrency} < ${winModalSettings.thresholdBalance}`);
            return;
        }
        
        // Условие 2: Недостаточно спинов
        if (spinCount < winModalSettings.minSpinsAfterPromo) {
            console.log(`[PROMO] Not enough spins: ${spinCount} < ${winModalSettings.minSpinsAfterPromo}`);
            return;
        }
        
        // Все условия выполнены
        console.log(`[PROMO] All conditions met! Showing win modal. Spins: ${spinCount}, Balance: ${balanceInUserCurrency}`);
        showWinModal(balanceEUR);
    }
    
    /**
     * Show win modal with current balance
     * @param {number} balanceEUR - Current balance in EUR
     */
    function showWinModal(balanceEUR) {
        // Баланс, переданный сюда, уже был сконвертирован в checkModalConditions
        // поэтому мы не должны конвертировать его повторно
        
        // Обновляем содержимое модального окна
        if (winModalAmount) {
            winModalAmount.textContent = window.currencyHandler.formatCurrency(balanceEUR, false);
        }
        
        if (winModalCurrency) {
            winModalCurrency.textContent = window.currencyHandler.userCurrency;
        }
        
        // Показываем модальное окно
        winModal.style.display = 'flex';
        modalShown = true;
        
        // Создаем анимацию конфетти
        createConfetti();
        
        console.log(`[PROMO] Win modal displayed with balance: ${balanceEUR} ${window.currencyHandler.userCurrency}`);
    }
    /**
     * Close the win modal
     */
    function closeWinModal() {
        // Refresh DOM elements if they're not set
        if (!winModal) {
            findDomElements();
        }
        
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
        
        console.log('[PROMO] Win modal closed');
    }
    
    /**
     * Handle claim winnings button click
     */
    function handleClaimWinnings() {
        console.log('[PROMO] Claim winnings button clicked');
        
        // Let the currency handler handle this if available
        if (window.currencyHandler && typeof window.currencyHandler.handleClaimWinnings === 'function') {
            window.currencyHandler.handleClaimWinnings();
            
            // Close modal if open
            closeWinModal();
            return;
        }
        
        // Fallback if currency handler not available
        const currentBalanceEUR = window.SETTINGS_READER.getCurrentBalance();
        
        // Get thresholds
        const thresholds = window.SETTINGS_READER.getWinThresholds();
        
        // Find appropriate threshold for redirect
        let targetUrl = null;
        let highestThresholdAmount = 0;
        
        for (const threshold of thresholds) {
            if (currentBalanceEUR >= threshold.amount && threshold.amount > highestThresholdAmount) {
                targetUrl = threshold.redirectUrl;
                highestThresholdAmount = threshold.amount;
            }
        }
        
        // Reset balance
        window.SETTINGS_READER.saveCurrentBalance(0);
        
        // Close modal if open
        closeWinModal();
        
        // Navigate to appropriate URL
        if (targetUrl) {
            console.log(`[PROMO] Redirecting to: ${targetUrl}`);
            window.location.href = targetUrl;
        } else {
            // Default redirect
            console.log('[PROMO] No threshold matched, redirecting to default');
            window.location.href = "/claim";
        }
    }
    
    /**
     * Display promo code activation result message
     * @param {string} message - Message to display
     * @param {string} type - Message type (success/error)
     */
    function showPromoMessage(message, type) {
        // Refresh promoMessage if it's not set
        if (!promoMessage) {
            promoMessage = document.getElementById('promo-message');
        }
        
        if (!promoMessage) return;
        
        promoMessage.textContent = message;
        promoMessage.className = 'promo-message';
        promoMessage.classList.add(type);
        promoMessage.style.display = 'block';
        promoMessage.style.opacity = '1';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            promoMessage.style.opacity = '0';
            
            setTimeout(() => {
                promoMessage.style.display = 'none';
                promoMessage.style.opacity = '1';
            }, 300);
        }, 3000);
    }
    
    /**
     * Check if user has used a promo code before
     * @param {string} code - Promo code to check
     * @returns {boolean} True if user has used the code before
     */
    function hasUserUsedPromoCode(code) {
        const userId = getUserId();
        const userUsedCodes = JSON.parse(localStorage.getItem(STORAGE_USER_PROMOS_KEY)) || {};
        
        // If no records for this user or code, they haven't used it
        if (!userUsedCodes[userId] || !userUsedCodes[userId].includes(code)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Mark promo code as used by current user
     * @param {string} code - Promo code to mark as used
     */
    function markPromoCodeAsUsedByUser(code) {
        const userId = getUserId();
        const userUsedCodes = JSON.parse(localStorage.getItem(STORAGE_USER_PROMOS_KEY)) || {};
        
        // Initialize array for this user if needed
        if (!userUsedCodes[userId]) {
            userUsedCodes[userId] = [];
        }
        
        // Add code to list of used by user if not already there
        if (!userUsedCodes[userId].includes(code)) {
            userUsedCodes[userId].push(code);
            localStorage.setItem(STORAGE_USER_PROMOS_KEY, JSON.stringify(userUsedCodes));
        }
    }
    
    /**
     * Generate or get user ID
     * @returns {string} User ID
     */
    function getUserId() {
        let userId = localStorage.getItem(STORAGE_USER_ID_KEY);
        
        if (!userId) {
            // Generate pseudo-random ID for user
            userId = 'user_' + Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
            localStorage.setItem(STORAGE_USER_ID_KEY, userId);
        }
        
        return userId;
    }
    
    /**
     * Reload game iframe
     */
    function reloadGameFrame() {
        const gameFrame = document.getElementById('game-frame');
        if (!gameFrame) return;
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.position = 'absolute';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.flexDirection = 'column';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.backgroundColor = 'rgba(7, 2, 15, 0.8)';
        loadingOverlay.style.zIndex = '100';
        loadingOverlay.style.borderRadius = 'var(--radius-lg)';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.style.width = '50px';
        spinner.style.height = '50px';
        spinner.style.border = '4px solid rgba(212, 175, 55, 0.1)';
        spinner.style.borderTopColor = 'var(--royal-gold)';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.marginBottom = '15px';
        
        const loadingText = document.createElement('div');
        loadingText.innerText = 'Updating balance...';
        loadingText.style.color = 'var(--royal-gold)';
        loadingText.style.fontSize = '18px';
        loadingText.style.fontWeight = 'bold';
        
        loadingOverlay.appendChild(spinner);
        loadingOverlay.appendChild(loadingText);
        
        const iframeWrapper = gameFrame.closest('.iframe-wrapper');
        if (iframeWrapper) {
            iframeWrapper.style.position = 'relative';
            iframeWrapper.appendChild(loadingOverlay);
        }
        
        // Reload iframe after short delay
        setTimeout(() => {
            const currentSrc = gameFrame.src;
            const refreshParam = 'refresh=' + Date.now();
            const separator = currentSrc.includes('?') ? '&' : '?';
            gameFrame.src = currentSrc + separator + refreshParam;
            
            // Remove overlay after frame loads
            gameFrame.onload = function() {
                if (iframeWrapper && iframeWrapper.contains(loadingOverlay)) {
                    iframeWrapper.removeChild(loadingOverlay);
                }
                
                // Sync balance after loading
                if (window.currencyHandler) {
                    setTimeout(() => window.currencyHandler.syncBalanceToGame(), 1000);
                }
            };
        }, 500);
        
        console.log('[PROMO] Game frame reload initiated');
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
    
    // Initialize system on page load
    document.addEventListener('DOMContentLoaded', initPromoSystem);
    
    // Export public methods for other scripts
    window.promoSystem = {
        showWinModal,
        closeWinModal,
        checkModalConditions,
        handleClaimWinnings
    };

    
})();
