/**
 * FRUIT PARADISE - SIMPLIFIED GAME SYNC
 * ==================================
 * This file synchronizes the game balance between the slot and main site.
 * It should be included in slot.html before the closing body tag.
 */
let realBalance = null;
let isSpinning = false;

(function() {
    // Variables for tracking state
    let syncBalanceDelay = null;
    let lastSyncedBalance = null;
    let lastSentBalance = null;
    


    function safeUpdateBalance(amount) {
        // Не обновляем баланс во время процесса вращения
        if (isSpinning) {
            console.log('[SLOT] Skipping balance update during spin:', amount);
            return;
        }
    
        if (window.s_oGame) {
            console.log('[SLOT] Safe updating balance to:', amount);
            
            // Устанавливаем баланс в игре
            window.s_oGame._iMoney = amount;
            
            // Обновляем интерфейс
            if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
                window.s_oGame._oInterface.refreshMoney(amount);
            }
            
            // Сохраняем в localStorage
            localStorage.setItem('fruitParadiseBalance', amount);
            
            // Обновляем глобальную переменную
            realBalance = amount;
        }
    }
    /**
     * Initialize the game sync system
     */
    function initGameSync() {
        console.log('[SLOT] Initializing game sync system');
        
        // Listen for messages from parent window
        window.addEventListener('message', handleParentMessages);
        
        // Check for the game to be loaded
        checkGameLoaded();
        
        // Start periodic sync
        startPeriodicSync();
    }

    function showWinModal(winAmount) {
        // Проверяем, существует ли окно
        if (!window.parent || !window.parent.document) {
            console.error('[SLOT] Cannot access parent window to show win modal');
            return;
        }
        
        console.log('[SLOT] Showing win modal with amount:', winAmount);
        
        // Отправляем сообщение родительскому окну для отображения модального окна
        window.parent.postMessage({
            type: 'SHOW_WIN_MODAL',
            amount: winAmount
        }, '*');
    }

    function overrideWinHandling() {
        if (!window.s_oGame || !window.s_oGame._endReelAnimation) {
            console.log('[SLOT] Game not loaded yet, waiting to override win handling');
            setTimeout(overrideWinHandling, 500);
            return;
        }
        
        console.log('[SLOT] Overriding win handling function');
        const originalEndReelAnimation = window.s_oGame._endReelAnimation;
        
        window.s_oGame._endReelAnimation = function() {
            // Сохраняем баланс до обработки выигрыша
            const balanceBeforeWin = this._iMoney;
            
            // Вызываем оригинальную функцию
            originalEndReelAnimation.call(this);
            
            // Проверяем, был ли выигрыш
            if (this._iTotWin > 0) {
                console.log('[SLOT] Win detected! Amount:', this._iTotWin);
                
                // Обновляем реальный баланс
                realBalance = this._iMoney;
                
                // Сохраняем в localStorage
                localStorage.setItem('fruitParadiseBalance', this._iMoney);
                
                // Отправляем обновленный баланс родительскому окну
                window.parent.postMessage({
                    type: 'UPDATE_BALANCE',
                    balance: this._iMoney,
                    win: this._iTotWin
                }, '*');
                
                // Показываем модальное окно для крупных выигрышей
                // (можно настроить порог для показа)
                const winThreshold = 20; // Показывать модальное окно при выигрыше больше 20
                if (this._iTotWin >= winThreshold) {
                    setTimeout(() => {
                        showWinModal(this._iTotWin);
                    }, 1500); // Задержка для анимации выигрыша
                }
            }
        };
        
        console.log('[SLOT] Win handling successfully overridden');
    }
    
    // Добавляем в инициализацию
    function enhancedInit() {
        // Переопределяем обработку выигрышей
        overrideWinHandling();
    }
    
    // Запускаем улучшенную инициализацию
    enhancedInit();

    function overrideSpinFunction() {
        if (!window.s_oGame || !window.s_oGame.onSpin) {
            console.log('[SLOT] Game not loaded yet, waiting to override spin function');
            setTimeout(overrideSpinFunction, 500);
            return;
        }
        
        console.log('[SLOT] Overriding onSpin function');
        const originalOnSpin = window.s_oGame.onSpin;
        
        window.s_oGame.onSpin = function() {
            // Сохраняем текущий баланс перед спином
            const balanceBeforeSpin = this._iMoney;
            realBalance = balanceBeforeSpin;
            
            // Устанавливаем флаг, что сейчас идет спин
            isSpinning = true;
            
            console.log('[SLOT] Starting spin with balance:', balanceBeforeSpin);
            
            // Вызываем оригинальную функцию
            originalOnSpin.call(this);
            
            // После спина, проверяем через небольшую задержку
            setTimeout(() => {
                // Если баланс сбросился до 100 и это не был корректный баланс
                if (this._iMoney === 100 && balanceBeforeSpin !== 100) {
                    console.log('[SLOT] Detected incorrect balance reset, restoring:', balanceBeforeSpin);
                    this._iMoney = balanceBeforeSpin;
                    
                    if (this._oInterface && typeof this._oInterface.refreshMoney === 'function') {
                        this._oInterface.refreshMoney(balanceBeforeSpin);
                    }
                }
                
                // Обновляем реальный баланс
                realBalance = this._iMoney;
                
                // Сохраняем в localStorage
                localStorage.setItem('fruitParadiseBalance', this._iMoney);
                
                // ВАЖНОЕ ИЗМЕНЕНИЕ: Увеличиваем счетчик спинов вручную
                let spinCounter = parseInt(localStorage.getItem('fruitParadiseSpinCounter') || '0');
                spinCounter++;
                localStorage.setItem('fruitParadiseSpinCounter', spinCounter.toString());
                
                // Отправляем родительскому окну с явным флагом spinMade
                window.parent.postMessage({
                    type: 'UPDATE_BALANCE',
                    balance: this._iMoney,
                    spinMade: true,
                    forcedSpinCount: spinCounter
                }, '*');
                
                // Сбрасываем флаг спина
                isSpinning = false;
                
                console.log('[SLOT] Spin completed, forced spin count:', spinCounter);
                
                // Если баланс выше 100, попробуем напрямую вызвать showWinModal
                if (this._iMoney >= 100 && typeof showWinModalInParent === 'function' && spinCounter >= 3) {
                    setTimeout(() => {
                        showWinModalInParent(this._iMoney);
                        console.log('[SLOT] Directly triggered win modal with balance:', this._iMoney);
                    }, 1000);
                }
            }, 500); // Увеличили задержку для надежности
        };
        
        console.log('[SLOT] onSpin function successfully overridden');
    }
    
    function overridePlaceBetFunction() {
        if (!window.s_oGame || !window.s_oGame._placeBet) {
            console.log('[SLOT] Game not loaded yet, waiting to override placeBet function');
            setTimeout(overridePlaceBetFunction, 500);
            return;
        }
        
        console.log('[SLOT] Overriding _placeBet function');
        const originalPlaceBet = window.s_oGame._placeBet;
        
        window.s_oGame._placeBet = function(iAmount) {
            // Сохраняем текущий баланс до ставки
            const balanceBeforeBet = this._iMoney;
            
            console.log('[SLOT] Placing bet:', iAmount, 'Current balance:', balanceBeforeBet);
            
            // Вызываем оригинальную функцию
            const result = originalPlaceBet.call(this, iAmount);
            
            // Обновляем реальный баланс после ставки
            realBalance = this._iMoney;
            
            // Сохраняем в localStorage
            localStorage.setItem('fruitParadiseBalance', this._iMoney);
            
            console.log('[SLOT] Bet placed, new balance:', this._iMoney);
            
            return result;
        };
        
        console.log('[SLOT] _placeBet function successfully overridden');
    }
    function overridePlaceBetFunction() {
        if (!window.s_oGame || !window.s_oGame._placeBet) {
            console.log('[SLOT] Game not loaded yet, waiting to override placeBet function');
            setTimeout(overridePlaceBetFunction, 500);
            return;
        }
        
        console.log('[SLOT] Overriding _placeBet function');
        const originalPlaceBet = window.s_oGame._placeBet;
        
        window.s_oGame._placeBet = function(iAmount) {
            // Сохраняем текущий баланс до ставки
            const balanceBeforeBet = this._iMoney;
            
            console.log('[SLOT] Placing bet:', iAmount, 'Current balance:', balanceBeforeBet);
            
            // Вызываем оригинальную функцию
            const result = originalPlaceBet.call(this, iAmount);
            
            // Обновляем реальный баланс после ставки
            realBalance = this._iMoney;
            
            // Сохраняем в localStorage
            localStorage.setItem('fruitParadiseBalance', this._iMoney);
            
            console.log('[SLOT] Bet placed, new balance:', this._iMoney);
            
            return result;
        };
        
        console.log('[SLOT] _placeBet function successfully overridden');
    }

    initImprovedSync();

    /**
     * Check if the game is loaded and initialize overrides
     */
    function checkGameLoaded() {
        if (typeof window.s_oGame === 'undefined' || !window.s_oGame) {
            // Try again after a delay
            console.log('[SLOT] Game not loaded yet, retrying...');
            setTimeout(checkGameLoaded, 500);
            return;
        }
        
        // Game is loaded, override money functions
        overrideMoneyFunctions();
        
        // Apply any stored balance
        applyStoredBalance();
        
        console.log('[SLOT] Game loaded and initialized');
    }
    
    /**
     * Override money-related functions in the game
     */
    function overrideMoneyFunctions() {
        try {
            console.log('[SLOT] Overriding money functions');
            
            // Override refreshMoney if available
            if (window.s_oGame && window.s_oGame.onSpin) {
                console.log('[SLOT] Overriding onSpin function to prevent balance reset');
                const originalOnSpin = window.s_oGame.onSpin;
                
                window.s_oGame.onSpin = function() {
                    // Сохраняем текущий баланс перед спином
                    const currentBalance = this._iMoney;
                    
                    // Вызываем оригинальную функцию
                    originalOnSpin.call(this);
                    
                    // Проверяем, не сбросился ли баланс до значения по умолчанию (100)
                    // Это нужно делать с небольшой задержкой, чтобы поймать момент после внутреннего сброса
                    setTimeout(() => {
                        // Проверяем, не изменился ли баланс некорректно
                        if (this._iMoney === 100 && currentBalance !== 100) {
                            console.log('[SLOT] Prevented balance reset, restoring: ' + currentBalance);
                            // Восстанавливаем предыдущий баланс
                            this._iMoney = currentBalance;
                            
                            // Обновляем интерфейс, если возможно
                            if (this._oInterface && typeof this._oInterface.refreshMoney === 'function') {
                                this._oInterface.refreshMoney(currentBalance);
                            }
                        }
                        
                        // Отправляем событие спина родителю
                        window.parent.postMessage({
                            type: 'UPDATE_BALANCE',
                            balance: this._iMoney,
                            spinMade: true
                        }, '*');
                        
                        console.log('[SLOT] Spin tracked and reported to parent, balance: ' + this._iMoney);
                    }, 50);
                };
            }
            
            // Override onSpin if available
            if (window.s_oGame && window.s_oGame._placeBet) {
                console.log('[SLOT] Overriding _placeBet function');
                const originalPlaceBet = window.s_oGame._placeBet;
                
                window.s_oGame._placeBet = function(iAmount) {
                    // Сохраняем текущий баланс перед ставкой
                    const balanceBeforeBet = this._iMoney;
                    
                    // Вызываем оригинальную функцию
                    const result = originalPlaceBet.call(this, iAmount);
                    
                    // Сохраняем обновленный баланс сразу после ставки
                    localStorage.setItem('fruitParadiseBalance', this._iMoney);
                    
                    console.log('[SLOT] Bet placed: ' + iAmount + ', new balance: ' + this._iMoney);
                    
                    // Сообщаем родительскому окну об обновлении баланса
                    window.parent.postMessage({
                        type: 'UPDATE_BALANCE',
                        balance: this._iMoney,
                        bet: iAmount
                    }, '*');
                    
                    return result;
                };
            }
            // Override endReelAnimation if available
            if (window.s_oGame && window.s_oGame._endReelAnimation) {
                const originalEndReelAnimation = window.s_oGame._endReelAnimation;
                
                window.s_oGame._endReelAnimation = function() {
                    // Call original function
                    originalEndReelAnimation.call(this);
                    
                    // If there was a win, notify parent
                    if (this._iTotWin > 0) {
                        setTimeout(() => {
                            sendMessageToParent({
                                type: 'UPDATE_BALANCE',
                                balance: this._iMoney,
                                win: this._iTotWin
                            });
                            
                            console.log('[SLOT] Win processed and reported:', this._iTotWin);
                        }, 500);
                    }
                };
            }
        } catch (e) {
            console.error('[SLOT] Error overriding money functions:', e);
        }
    }

    // Переопределение инициализации игры для установки начального баланса
function ensureCorrectInitialBalance() {
    if (!window.s_oGame) return;
    
    console.log('[SLOT] Ensuring correct initial balance');
    
    const storedBalance = parseFloat(localStorage.getItem('fruitParadiseBalance'));
    if (!isNaN(storedBalance) && storedBalance !== window.s_oGame._iMoney) {
        console.log('[SLOT] Setting initial balance from localStorage: ' + storedBalance);
        window.s_oGame._iMoney = storedBalance;
        
        if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
            window.s_oGame._oInterface.refreshMoney(storedBalance);
        }
    }
}
    
    /**
     * Apply stored balance to the game
     */
    function applyStoredBalance() {
        try {
            const storedBalance = parseFloat(localStorage.getItem('fruitParadiseBalance'));
            
            if (!isNaN(storedBalance) && window.s_oGame) {
                console.log(`[SLOT] Applying stored balance: ${storedBalance}`);
                
                // Update game money
                window.s_oGame._iMoney = storedBalance;
                
                // Update interface if available
                if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
                    window.s_oGame._oInterface.refreshMoney(storedBalance);
                }
                
                // Update tracking
                lastSentBalance = storedBalance;
            }
        } catch (e) {
            console.error('[SLOT] Error applying stored balance:', e);
        }
    }
    
    /**
     * Handle messages from parent window
     */
    function handleParentMessages(event) {
        const data = event.data;
        
        // Validate message format
        if (typeof data !== 'object' || !data.type) {
            return;
        }
        
        console.log('[SLOT] Message from parent:', data);
        
        switch (data.type) {
            case 'SET_BALANCE':
                if (typeof data.balance === 'number') {
                    updateGameBalance(data.balance);
                }
                break;
                
            case 'GAME_STARTED':
                // Respond that we received the message
                sendMessageToParent({
                    type: 'GAME_READY',
                    ready: true
                });
                
                // Apply any stored balance
                applyStoredBalance();
                break;
        }
    }
    
    /**
     * Update game balance
     */
    function updateGameBalance(balance) {
        // Cancel any pending updates
        if (syncBalanceDelay) {
            clearTimeout(syncBalanceDelay);
        }
        
        // Don't update if the balance is the same
        if (lastSyncedBalance === balance) {
            return;
        }
        
        console.log('[SLOT] Updating game balance:', balance);
        
        // Save to localStorage immediately
        localStorage.setItem('fruitParadiseBalance', balance);
        
        // Schedule update with a small delay to prevent frequent updates
        syncBalanceDelay = setTimeout(() => {
            try {
                if (window.s_oGame) {
                    // Set balance in game
                    window.s_oGame._iMoney = balance;
                    
                    // Update interface if available
                    if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
                        window.s_oGame._oInterface.refreshMoney(balance);
                        console.log('[SLOT] Game balance updated successfully:', balance);
                    }
                    
                    // Update tracking
                    lastSyncedBalance = balance;
                    lastSentBalance = balance;
                } else {
                    console.warn('[SLOT] Game not loaded, balance saved for later application');
                }
            } catch (e) {
                console.error('[SLOT] Error updating game balance:', e);
            }
            
            syncBalanceDelay = null;
        }, 50);
    }
    
    /**
     * Send message to parent window
     */
    function sendMessageToParent(message) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
    }
    
    /**
     * Start periodic balance sync
     */
    function startPeriodicSync() {
        setInterval(() => {
            if (window.s_oGame && typeof window.s_oGame._iMoney === 'number') {
                const currentBalance = window.s_oGame._iMoney;
                
                // Check if balance has changed since last sync
                if (currentBalance !== lastSentBalance) {
                    console.log(`[SLOT] Periodic sync: ${currentBalance}`);
                    
                    // Save to localStorage
                    localStorage.setItem('fruitParadiseBalance', currentBalance);
                    
                    // Send to parent
                    sendMessageToParent({
                        type: 'UPDATE_BALANCE',
                        balance: currentBalance
                    });
                    
                    // Update tracking
                    lastSentBalance = currentBalance;
                }
            }
        }, 2000); // Check every 2 seconds
    }

    /**
 * ПРОСТОЕ ИСПРАВЛЕНИЕ ДЛЯ МОДАЛЬНОГО ОКНА
 * Добавьте этот код в конец simplified-game-sync.js 
 */

// Функция для показа модального окна выигрыша в родительском окне
function showWinModalInParent(amount) {
    // Отправляем сообщение родительскому окну
    window.parent.postMessage({
        type: 'SHOW_WIN_MODAL',
        amount: amount
    }, '*');
    
    console.log('[SLOT] Requested to show win modal for amount:', amount);
}

// Переопределяем функцию для показа модального окна при выигрыше
if (window.s_oGame && window.s_oGame._endReelAnimation) {
    const originalEndReel = window.s_oGame._endReelAnimation;
    
    window.s_oGame._endReelAnimation = function() {
        // Вызываем оригинальную функцию
        originalEndReel.call(this);
        
        // Проверяем, был ли выигрыш
        if (this._iTotWin > 0) {
            // Отправляем сообщение родительскому окну для показа модального окна
            setTimeout(() => {
                showWinModalInParent(this._iTotWin);
            }, 1000);
        }
    };
    
    console.log('[SLOT] Successfully overridden win handling for modal');
} else {
    // Если функция еще не доступна, пробуем позже
    setTimeout(() => {
        if (window.s_oGame && window.s_oGame._endReelAnimation) {
            const originalEndReel = window.s_oGame._endReelAnimation;
            
            window.s_oGame._endReelAnimation = function() {
                // Вызываем оригинальную функцию
                originalEndReel.call(this);
                
                // Проверяем, был ли выигрыш
                if (this._iTotWin > 0) {
                    // Отправляем сообщение родительскому окну для показа модального окна
                    setTimeout(() => {
                        showWinModalInParent(this._iTotWin);
                    }, 1000);
                }
            };
            
            console.log('[SLOT] Successfully overridden win handling for modal (delayed)');
        }
    }, 2000);
}


    
    // Initialize when document is loaded
    document.addEventListener('DOMContentLoaded', initGameSync);
    
    // Also initialize if document is already loaded
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initGameSync();
    }
    
    // Notify the parent that we've loaded
    sendMessageToParent({
        type: 'SLOT_SCRIPT_LOADED',
        time: new Date().toISOString()
    });


})();
