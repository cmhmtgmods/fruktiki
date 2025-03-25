/**
 * FRUIT PARADISE - SIMPLIFIED GAME SYNC
 * ==================================
 * This file synchronizes the game balance between the slot and main site.
 * It should be included in slot.html before the closing body tag.
 */
(function() {
    // Variables for tracking state
    let syncBalanceDelay = null;
    let lastSyncedBalance = null;
    let lastSentBalance = null;
    
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
            if (window.s_oGame && window.s_oGame._oInterface && window.s_oGame._oInterface.refreshMoney) {
                const originalRefreshMoney = window.s_oGame._oInterface.refreshMoney;
                
                window.s_oGame._oInterface.refreshMoney = function(iMoney) {
                    // Call original function
                    originalRefreshMoney.call(this, iMoney);
                    
                    // Only sync if amount has changed
                    if (iMoney !== lastSentBalance) {
                        // Save to localStorage
                        localStorage.setItem('fruitParadiseBalance', iMoney);
                        
                        // Send to parent
                        sendMessageToParent({
                            type: 'UPDATE_BALANCE',
                            balance: iMoney
                        });
                        
                        lastSentBalance = iMoney;
                        console.log('[SLOT] Money updated and synced:', iMoney);
                    }
                };
            }
            
            // Override onSpin if available
            if (window.s_oGame && window.s_oGame.onSpin) {
                const originalOnSpin = window.s_oGame.onSpin;
                
                window.s_oGame.onSpin = function() {
                    // Call original function
                    originalOnSpin.call(this);
                    
                    // Notify parent of spin
                    setTimeout(() => {
                        sendMessageToParent({
                            type: 'UPDATE_BALANCE',
                            balance: this._iMoney,
                            spinMade: true
                        });
                        
                        console.log('[SLOT] Spin made and reported');
                    }, 200);
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