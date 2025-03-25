/**
 * Combined Modal and Promo Code System for Fruit Paradise Slot
 * Handles win modals, promo codes, and balance management with proper synchronization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const STORAGE_BALANCE_KEY = 'fruitParadiseBalance';
    const STORAGE_INIT_BALANCE_KEY = 'fruitParadiseInitBalance';
    const STORAGE_PROMOS_KEY = 'fruitParadisePromoCodes';
    const STORAGE_USED_PROMOS_KEY = 'fruitParadiseUsedCodes';
    const STORAGE_THRESHOLDS_KEY = 'fruitParadiseThresholds';
    const STORAGE_USER_PROMOS_KEY = 'fruitParadiseUserUsedCodes';
    const STORAGE_USER_ID_KEY = 'fruitParadiseUserId';
    
    // Win modal thresholds
    const THRESHOLD_BALANCE = 100; // Balance threshold in user currency
    const MIN_SPINS_AFTER_PROMO = 3; // Minimum spins required after promo activation
    
    // State variables
    let spinCounter = 0;
    let modalShown = false;
    let lastKnownBalance = 0;
    let userCurrency = 'USD'; // Default, will be updated
    let currencySymbol = '$'; // Default, will be updated
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
    const promoCodeInput = document.getElementById('promo-code-input');
    const activatePromoBtn = document.getElementById('activate-promo-btn');
    const promoMessage = document.getElementById('promo-message');
    
    // Initialize the system
    initSystem();
    
    /**
     * Initialize the entire system
     */
    function initSystem() {
        console.log('[SYSTEM] Initializing combined system');
        
        // Загружаем счетчик спинов из localStorage
        spinCounter = parseInt(localStorage.getItem('fruitParadiseSpinCounter') || '0');
        console.log(`[SYSTEM] Loaded spin counter: ${spinCounter}`);
        
        // Инициализируем баланс и валюту
        initBalanceAndCurrency();
        
        // Инициализируем модальное окно
        initWinModal();
        
        // Настраиваем функционал промокодов
        setupPromoSystem();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Проверяем начальный баланс для отображения модального окна
        const initialBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        checkModalConditions(initialBalanceEUR);
        
        console.log('[SYSTEM] System initialization complete');
    }
    
    /**
     * Initialize win modal and its buttons
     */
    function initWinModal() {
        if (!winModal) {
            console.error('[SYSTEM] Win modal not found in DOM');
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
        
        console.log('[SYSTEM] Win modal initialized');
    }
    
    /**
     * Initialize balance and currency settings
     */
    function initBalanceAndCurrency() {
        // Initialize initial balance if not set
        if (localStorage.getItem(STORAGE_INIT_BALANCE_KEY) === null) {
            console.log('[SYSTEM] Setting initial balance to 100');
            localStorage.setItem(STORAGE_INIT_BALANCE_KEY, '100');
        }
        
        // Get current balance
        let currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        
        // Try to get currency info from global currency handler if available
        if (window.currencyHandler) {
            userCurrency = window.currencyHandler.userCurrency;
            currencySymbol = window.currencyHandler.currencySymbol;
            exchangeRate = window.currencyHandler.exchangeRate;
            console.log(`[SYSTEM] Using currency handler: ${userCurrency}, rate: ${exchangeRate}`);
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
                    'AED': 3.97,
                    'CNY': 7.8,
                    'JPY': 160.5,
                    'INR': 89.7
                };
                
                // Set currency symbols
                const symbols = {
                    'EUR': '€',
                    'USD': '$',
                    'GBP': '£',
                    'CNY': '¥',
                    'JPY': '¥',
                    'INR': '₹',
                    'CAD': 'C$',
                    'AUD': 'A$',
                    'AED': 'AED'
                };
                
                currencySymbol = symbols[userCurrency] || '$';
                exchangeRate = rates[userCurrency] || 1;
            }
        }
        
        // Update currency display in UI
        if (balanceCurrencyElement) {
            balanceCurrencyElement.textContent = userCurrency;
        }
        
        // Update currency display in modal
        if (winModalCurrency) {
            winModalCurrency.textContent = userCurrency;
        }
        
        // Update balance display
        if (balanceElement) {
            const balanceInUserCurrency = convertToUserCurrency(currentBalanceEUR);
            balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
        }
        
        console.log(`[SYSTEM] Balance and currency initialized: ${currentBalanceEUR} EUR, ${userCurrency}, rate: ${exchangeRate}`);
    }
    
    /**
     * Setup promo code system
     */
    function setupPromoSystem() {
        if (activatePromoBtn) {
            activatePromoBtn.addEventListener('click', handlePromoActivation);
            console.log('[SYSTEM] Promo button listener added');
        }
        
        if (promoCodeInput) {
            promoCodeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handlePromoActivation();
                }
            });
        }
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
        
        // Handle game frame load event for balance syncing
        if (gameFrame) {
            gameFrame.addEventListener('load', function() {
                console.log('[SYSTEM] Game frame loaded, syncing balance');
                syncBalanceWithGame();
            });
        }
        
        console.log('[SYSTEM] Event listeners set up');
    }
    
    /**
     * Handle messages from the game iframe
     */
    function handleGameMessages(event) {
        const data = event.data;
        
        // Проверка на валидность сообщения
        if (!data || typeof data !== 'object' || !data.type) {
            return;
        }
        
        console.log('[SYSTEM] Received message from game:', data);
        
        // Обработка обновления баланса
        if (data.type === 'UPDATE_BALANCE') {
            // Получаем новый баланс в EUR (внутренней валюте)
            const newBalanceEUR = parseFloat(data.balance);
            const oldBalanceEUR = lastKnownBalance;
            
            // Если баланс изменился, считаем это спином
            if (newBalanceEUR !== oldBalanceEUR) {
                spinCounter++;
                localStorage.setItem('fruitParadiseSpinCounter', spinCounter.toString());
                console.log(`[SYSTEM] Balance changed! Counting as spin. Total spins: ${spinCounter}`);
            }
            
            // Обновляем последний известный баланс
            lastKnownBalance = newBalanceEUR;
            localStorage.setItem(STORAGE_BALANCE_KEY, newBalanceEUR.toString());
            
            // Обновляем отображение баланса
            if (balanceElement) {
                const balanceInUserCurrency = convertToUserCurrency(newBalanceEUR);
                balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
            }
            
            // Проверяем условия для показа модального окна при КАЖДОМ изменении баланса
            setTimeout(() => {
                checkModalConditions(newBalanceEUR);
            }, 500);
        } else if (data.type === 'GAME_STARTED' || data.type === 'GAME_READY') {
            // Игра готова, синхронизируем баланс
            syncBalanceWithGame();
        }
    }
    
    /**
     * Process promo code activation
     */
    function handlePromoActivation() {
        if (!promoCodeInput || !promoMessage) {
            console.warn('[SYSTEM] Элементы промокода не найдены');
            return;
        }
        
        const code = promoCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            showPromoMessage('Пожалуйста, введите промокод', 'error');
            return;
        }
        
        console.log(`[SYSTEM] Обработка промокода: ${code}`);
        
        // Получаем данные о использованных промокодах
        const usedPromoCodes = JSON.parse(localStorage.getItem(STORAGE_USED_PROMOS_KEY)) || [];
        
        // Получаем доступные промокоды (сначала проверяем глобальные настройки)
        let availablePromos = [];
        
        // Если доступны глобальные настройки через window.globalSettings
        if (window.globalSettings && typeof window.globalSettings.getPromoCodes === 'function') {
            availablePromos = window.globalSettings.getPromoCodes();
            console.log(`[SYSTEM] Промокоды загружены из глобальных настроек: ${availablePromos.length} шт.`);
        } 
        // Если доступны глобальные настройки через window.slotIntegration
        else if (window.slotIntegration && typeof window.slotIntegration.getPromoCodes === 'function') {
            availablePromos = window.slotIntegration.getPromoCodes();
            console.log(`[SYSTEM] Промокоды загружены через slotIntegration: ${availablePromos.length} шт.`);
        }
        // Иначе используем localStorage
        else {
            availablePromos = JSON.parse(localStorage.getItem(STORAGE_PROMOS_KEY)) || [];
            console.log(`[SYSTEM] Промокоды загружены из localStorage: ${availablePromos.length} шт.`);
        }
        
        // Ищем промокод в списке доступных
        const promo = availablePromos.find(p => p.code.toUpperCase() === code);
        
        if (!promo) {
            showPromoMessage('Неверный промокод', 'error');
            return;
        }
        
        // Проверяем, использовал ли этот пользователь промокод раньше
        if (hasUserUsedPromoCode(code)) {
            showPromoMessage(`Вы уже использовали промокод ${code}`, 'error');
            return;
        }
        
        // Проверяем глобальные ограничения использования
        const usedPromoEntry = usedPromoCodes.find(p => p.code === code);
        const currentUsageCount = usedPromoEntry ? usedPromoEntry.usageCount : 0;
        
        // Проверяем лимит активаций
        const maxActivations = promo.maxActivations || Infinity;
        
        if (currentUsageCount >= maxActivations) {
            showPromoMessage(`Промокод ${code} больше не действителен (лимит активаций исчерпан)`, 'error');
            return;
        }
        
        // Получаем текущий баланс в EUR
        let currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        const previousBalance = currentBalanceEUR;
        
        // Применяем бонус промокода
        currentBalanceEUR += promo.amount;
        
        console.log(`[SYSTEM] Применяем промокод: ${previousBalance} EUR -> ${currentBalanceEUR} EUR (+${promo.amount} EUR)`);
        
        // Обновляем баланс в localStorage
        localStorage.setItem(STORAGE_BALANCE_KEY, currentBalanceEUR.toString());
        
        // Сбрасываем счетчик спинов при активации любого промокода
        spinCounter = 0;
        localStorage.setItem('fruitParadiseSpinCounter', '0');
        console.log('[SYSTEM] Промокод активирован, счетчик спинов сброшен');
        
        // Обновляем глобальный счетчик использований
        if (usedPromoEntry) {
            usedPromoEntry.usageCount += 1;
        } else {
            usedPromoCodes.push({
                code: code,
                usageCount: 1,
                lastUsed: new Date().toISOString()
            });
        }
        localStorage.setItem(STORAGE_USED_PROMOS_KEY, JSON.stringify(usedPromoCodes));
        
        // Отмечаем промокод как использованный этим пользователем
        markPromoCodeAsUsedByUser(code);
        
        // Форматируем сумму промокода для отображения
        const promoAmountInUserCurrency = convertToUserCurrency(promo.amount);
        const formattedPromoAmount = formatCurrency(promoAmountInUserCurrency);
        
        // Показываем сообщение об успехе
        const remainingActivations = maxActivations - (currentUsageCount + 1);
        let successMessage = `Промокод ${code} активирован! Вы получили ${formattedPromoAmount}`;
        if (maxActivations !== Infinity && remainingActivations > 0) {
            successMessage += ` (осталось активаций: ${remainingActivations})`;
        } else if (maxActivations !== Infinity && remainingActivations === 0) {
            successMessage += ` (это была последняя активация)`;
        }
        
        showPromoMessage(successMessage, 'success');
        
        // Очищаем поле ввода
        promoCodeInput.value = '';
        
        // Обновляем отображение баланса
        if (balanceElement) {
            const balanceInUserCurrency = convertToUserCurrency(currentBalanceEUR);
            balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
        }
        
        // Перезагружаем фрейм с игрой
        reloadGameFrame();
        
        // Проверяем, достигнут ли порог для показа окна выигрыша
        setTimeout(() => {
            checkModalConditions(currentBalanceEUR);
        }, 1000);
    }
    
    /**
     * Display promo code activation result message
     */
    function showPromoMessage(message, type) {
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
     * Check if win modal should be shown based on current conditions
     */
    function checkModalConditions(balanceEUR) {
        // Конвертируем в валюту пользователя для сравнения с порогом
        const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
        
        console.log(`[SYSTEM] Checking modal conditions: Balance ${balanceInUserCurrency} ${userCurrency}, Spins ${spinCounter}`);
        
        // Условие 1: Баланс ниже порога, не показываем модальное окно
        if (balanceInUserCurrency < THRESHOLD_BALANCE) {
            closeWinModal(); // Закрываем модальное окно, если оно открыто
            spinCounter = 0; // Сбрасываем счетчик спинов
            localStorage.setItem('fruitParadiseSpinCounter', '0');
            return;
        }
        
        // Условие 2: Если не накрутили 3 спина, не показываем
        if (spinCounter < 3) {
            console.log(`[SYSTEM] Need more spins: ${spinCounter}/3`);
            return;
        }
        
        // Все условия выполнены, показываем модальное окно!
        showWinModal(balanceEUR);
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
        
        console.log(`[SYSTEM] Win modal displayed with balance: ${balanceInUserCurrency} ${userCurrency}`);
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
        
        console.log('[SYSTEM] Win modal closed');
    }
    
    /**
     * Handle the claim winnings button click
     */
    function handleClaimWinnings() {
        console.log('[SYSTEM] Claim winnings button clicked');
        
        // Get thresholds from localStorage
        const thresholds = JSON.parse(localStorage.getItem(STORAGE_THRESHOLDS_KEY)) || [];
        
        // Get current balance
        const currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        
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
            console.log(`[SYSTEM] Redirecting to: ${targetUrl}`);
            window.location.href = targetUrl;
        } else {
            // Default redirect
            console.log('[SYSTEM] No threshold matched, redirecting to default');
            window.location.href = "/claim";
        }
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
            return withSymbol ? `${currencySymbol}${Math.round(formattedAmount)}` : Math.round(formattedAmount).toString();
        }
        
        // Format with 2 decimal places
        return withSymbol 
            ? `${currencySymbol}${formattedAmount.toFixed(2)}`
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
    
    /**
     * Check if user has used a promo code before
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
     * Generate unique user ID
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
     * Sync balance with game iframe
     */
    function syncBalanceWithGame() {
        if (!gameFrame) {
            console.warn('[SYSTEM] Game frame not found, cannot sync balance');
            return;
        }
        
        // Get current balance
        const currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        
        console.log(`[SYSTEM] Syncing balance with game: ${currentBalanceEUR} EUR`);
        
        try {
            // Update in localStorage (main sync method)
            localStorage.setItem(STORAGE_BALANCE_KEY, currentBalanceEUR.toString());
            
            // Send message to iframe
            if (gameFrame.contentWindow) {
                gameFrame.contentWindow.postMessage({
                    type: 'SET_BALANCE',
                    balance: currentBalanceEUR
                }, '*');
            }
            
            // Update UI display
            if (balanceElement) {
                const balanceInUserCurrency = convertToUserCurrency(currentBalanceEUR);
                balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
            }
        } catch (e) {
            console.error('[SYSTEM] Error syncing balance with game:', e);
        }
    }
    
    /**
     * Reload game iframe
     */
    function reloadGameFrame() {
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
                setTimeout(syncBalanceWithGame, 1000);
            };
        }, 500);
        
        console.log('[SYSTEM] Game frame reload initiated');
    }

    // Простой отслеживатель изменений отображаемого баланса на сайте
(function setupBalanceObserver() {
    // Работает только если есть элемент отображения баланса
    if (!balanceElement) return;
    
    // Сохраняем текущее значение баланса
    let lastDisplayedBalance = balanceElement.textContent;
    
    // Проверяем изменения каждые 500 мс
    setInterval(() => {
        const currentDisplayedBalance = balanceElement.textContent;
        
        // Если баланс на экране изменился
        if (currentDisplayedBalance !== lastDisplayedBalance) {
            console.log(`[SYSTEM] UI Balance changed: ${lastDisplayedBalance} -> ${currentDisplayedBalance}`);
            lastDisplayedBalance = currentDisplayedBalance;
            
            // Увеличиваем счетчик спинов
            spinCounter++;
            localStorage.setItem('fruitParadiseSpinCounter', spinCounter.toString());
            console.log(`[SYSTEM] UI Change detected as spin. Total spins: ${spinCounter}`);
            
            // Проверяем условия для модального окна
            const balanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
            checkModalConditions(balanceEUR);
        }
    }, 500);
})();
    
    // Export functions for use by other scripts
    window.fruitParadiseSystem = {
        showWinModal,
        closeWinModal,
        checkModalConditions,
        syncBalanceWithGame
    };
});
