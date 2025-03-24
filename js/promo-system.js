/**
 * Fixes for Win Modal - To be added to the existing promo-system.js file
 * 
 * This script fixes the win modal functionality without breaking the existing promo code system.
 * It should be added to the bottom of the document.addEventListener('DOMContentLoaded') function
 * in the promo-system.js file, just before the closing bracket.
 */

// Update these constants at the top of the file (inside the DOMContentLoaded callback)
const MIN_BALANCE_FOR_MODAL = 100; // Minimum balance in user currency to show modal
const MIN_SPINS_BEFORE_MODAL = 3;  // Minimum spins after large promo to show modal
let spinCounter = 0;                // Track number of spins

// Replace the existing checkModalConditions function with this improved version
function checkModalConditions(balanceEUR) {
    console.log('[PROMO] Checking modal conditions');
    
    // Convert to user currency
    const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
    
    console.log(`[PROMO] Balance: ${balanceInUserCurrency} ${userCurrency}, Threshold: ${MIN_BALANCE_FOR_MODAL}`);
    console.log(`[PROMO] Spins: ${spinCounter}`);
    
    // Check if balance is below threshold - don't show modal in this case
    if (balanceInUserCurrency < MIN_BALANCE_FOR_MODAL) {
        // If modal is open but balance dropped, close it
        if (winModal && winModal.style.display === 'flex') {
            console.log('[PROMO] Balance below threshold, closing modal');
            closeWinModal();
        }
        return;
    }
    
    // Check if this was triggered by promo code
    const promoActivated = localStorage.getItem('fruitParadisePromoActivated');
    const promoTimestamp = parseInt(localStorage.getItem('fruitParadisePromoTimestamp') || '0');
    const currentTime = new Date().getTime();
    const isRecentPromo = (currentTime - promoTimestamp) < 60000; // Within the last minute
    
    // If balance came from recent promo and less than MIN_SPINS_BEFORE_MODAL spins made, don't show modal yet
    if (promoActivated === 'true' && isRecentPromo && spinCounter < MIN_SPINS_BEFORE_MODAL) {
        console.log(`[PROMO] Recent promo balance, waiting for ${MIN_SPINS_BEFORE_MODAL} spins (current: ${spinCounter})`);
        return;
    }
    
    // Show modal if all conditions are met
    console.log('[PROMO] All conditions met, showing win modal');
    showWinModal(balanceEUR);
}

// Replace the existing showWinModal function with this improved version
function showWinModal(balanceEUR) {
    if (!winModal) {
        console.warn('[PROMO] Win modal element not found');
        return;
    }
    
    // Convert to user currency
    const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
    
    // Set amount in modal
    if (winModalAmount) {
        winModalAmount.textContent = formatCurrency(balanceInUserCurrency, false);
    }
    
    // Set currency
    if (winModalCurrency) {
        winModalCurrency.textContent = userCurrency;
    }
    
    // Show modal
    winModal.style.display = 'flex';
    
    // Create confetti animation
    createConfetti();
    
    console.log('[PROMO] Win modal displayed with balance:', balanceInUserCurrency, userCurrency);
}

// Enhanced receiveMessageFromGame function to track spins
function receiveMessageFromGame(event) {
    // Check source (not strictly)
    const data = event.data;
    
    if (typeof data !== 'object' || !data.type) {
        return;
    }
    
    console.log('[PROMO] Received message from game:', data);
    
    if (data.type === 'UPDATE_BALANCE') {
        // Get new balance
        const newBalance = parseFloat(data.balance) || 0;
        localStorage.setItem(STORAGE_BALANCE_KEY, newBalance);
        
        // Update balance display
        if (balanceElement) {
            const balanceInUserCurrency = convertToUserCurrency(newBalance);
            balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
        }
        
        console.log(`[PROMO] Balance updated from game: ${newBalance} EUR`);
        
        // Check if this was a spin
        if (data.spinMade) {
            spinCounter++;
            console.log(`[PROMO] Spin detected! Total spins: ${spinCounter}`);
            
            // Check if we should show modal after a short delay 
            // (to allow animations to complete)
            setTimeout(() => {
                checkModalConditions(newBalance);
            }, 1000);
        }
    } else if (data.type === 'GAME_STARTED' || data.type === 'GAME_READY') {
        console.log('[PROMO] Game is ready, syncing balance');
        syncBalanceWithGame();
    }
}

// Make sure the handlePromoActivation function resets spin counter when a large promo is activated
// Add this code to your existing handlePromoActivation function after updating the balance
function updateAfterPromoCode(previousBalance, currentBalanceEUR, promoAmount) {
    // Convert balances to user currency
    const previousBalanceInUserCurrency = convertToUserCurrency(previousBalance);
    const newBalanceInUserCurrency = convertToUserCurrency(currentBalanceEUR);
    
    // If this promo pushed the balance above the threshold, 
    // reset spin counter and flag it as a large promo
    if (promoAmount >= MIN_BALANCE_FOR_MODAL / exchangeRate || 
        (previousBalanceInUserCurrency < MIN_BALANCE_FOR_MODAL && 
         newBalanceInUserCurrency >= MIN_BALANCE_FOR_MODAL)) {
        console.log('[PROMO] Large promo activated, resetting spin counter');
        spinCounter = 0;
        
        // Set flags to indicate we need to wait for spins
        localStorage.setItem('fruitParadisePromoActivated', 'true');
        localStorage.setItem('fruitParadisePromoTimestamp', new Date().getTime().toString());
    }
    
    // Check modal conditions after a short delay
    setTimeout(() => {
        checkModalConditions(currentBalanceEUR);
    }, 1000);
}

// Enhanced createConfetti function for better visual effect
function createConfetti() {
    const confettiCount = 100;
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#2ecc71', '#9b59b6'];
    
    // Find container for confetti
    const confettiContainer = document.querySelector('.win-confetti');
    if (!confettiContainer) return;
    
    // Clear previous confetti
    confettiContainer.innerHTML = '';
    
    // Create new confetti pieces
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.opacity = Math.random() * 0.8 + 0.2;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.position = 'absolute';
        confetti.style.animation = 'confettiDrop linear forwards';
        
        confettiContainer.appendChild(confetti);
    }
    
    // Add animation style if not already present
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiDrop {
                0% { 
                    top: -20px; 
                    transform: translateX(0) rotate(0deg);
                }
                100% { 
                    top: 100%; 
                    transform: translateX(${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100}px) rotate(${Math.random() * 360}deg);
                }
            }
            
            .confetti {
                position: absolute;
                top: -20px;
                animation-duration: 3s;
                animation-timing-function: ease-in;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize by checking current balance on page load
function initWinModalSystem() {
    // Get initial balance
    const initialBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
    
    // Check if modal should be shown initially
    checkModalConditions(initialBalanceEUR);
    
    console.log('[PROMO] Win modal system initialized');
}

// Run initialization
initWinModalSystem();/**
 * Fixes for Win Modal - To be added to the existing promo-system.js file
 * 
 * This script fixes the win modal functionality without breaking the existing promo code system.
 * It should be added to the bottom of the document.addEventListener('DOMContentLoaded') function
 * in the promo-system.js file, just before the closing bracket.
 */

// Update these constants at the top of the file (inside the DOMContentLoaded callback)
const MIN_BALANCE_FOR_MODAL = 100; // Minimum balance in user currency to show modal
const MIN_SPINS_BEFORE_MODAL = 3;  // Minimum spins after large promo to show modal
let spinCounter = 0;                // Track number of spins

// Replace the existing checkModalConditions function with this improved version
function checkModalConditions(balanceEUR) {
    console.log('[PROMO] Checking modal conditions');
    
    // Convert to user currency
    const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
    
    console.log(`[PROMO] Balance: ${balanceInUserCurrency} ${userCurrency}, Threshold: ${MIN_BALANCE_FOR_MODAL}`);
    console.log(`[PROMO] Spins: ${spinCounter}`);
    
    // Check if balance is below threshold - don't show modal in this case
    if (balanceInUserCurrency < MIN_BALANCE_FOR_MODAL) {
        // If modal is open but balance dropped, close it
        if (winModal && winModal.style.display === 'flex') {
            console.log('[PROMO] Balance below threshold, closing modal');
            closeWinModal();
        }
        return;
    }
    
    // Check if this was triggered by promo code
    const promoActivated = localStorage.getItem('fruitParadisePromoActivated');
    const promoTimestamp = parseInt(localStorage.getItem('fruitParadisePromoTimestamp') || '0');
    const currentTime = new Date().getTime();
    const isRecentPromo = (currentTime - promoTimestamp) < 60000; // Within the last minute
    
    // If balance came from recent promo and less than MIN_SPINS_BEFORE_MODAL spins made, don't show modal yet
    if (promoActivated === 'true' && isRecentPromo && spinCounter < MIN_SPINS_BEFORE_MODAL) {
        console.log(`[PROMO] Recent promo balance, waiting for ${MIN_SPINS_BEFORE_MODAL} spins (current: ${spinCounter})`);
        return;
    }
    
    // Show modal if all conditions are met
    console.log('[PROMO] All conditions met, showing win modal');
    showWinModal(balanceEUR);
}

// Replace the existing showWinModal function with this improved version
function showWinModal(balanceEUR) {
    if (!winModal) {
        console.warn('[PROMO] Win modal element not found');
        return;
    }
    
    // Convert to user currency
    const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
    
    // Set amount in modal
    if (winModalAmount) {
        winModalAmount.textContent = formatCurrency(balanceInUserCurrency, false);
    }
    
    // Set currency
    if (winModalCurrency) {
        winModalCurrency.textContent = userCurrency;
    }
    
    // Show modal
    winModal.style.display = 'flex';
    
    // Create confetti animation
    createConfetti();
    
    console.log('[PROMO] Win modal displayed with balance:', balanceInUserCurrency, userCurrency);
}

// Enhanced receiveMessageFromGame function to track spins
function receiveMessageFromGame(event) {
    // Check source (not strictly)
    const data = event.data;
    
    if (typeof data !== 'object' || !data.type) {
        return;
    }
    
    console.log('[PROMO] Received message from game:', data);
    
    if (data.type === 'UPDATE_BALANCE') {
        // Get new balance
        const newBalance = parseFloat(data.balance) || 0;
        localStorage.setItem(STORAGE_BALANCE_KEY, newBalance);
        
        // Update balance display
        if (balanceElement) {
            const balanceInUserCurrency = convertToUserCurrency(newBalance);
            balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
        }
        
        console.log(`[PROMO] Balance updated from game: ${newBalance} EUR`);
        
        // Check if this was a spin
        if (data.spinMade) {
            spinCounter++;
            console.log(`[PROMO] Spin detected! Total spins: ${spinCounter}`);
            
            // Check if we should show modal after a short delay 
            // (to allow animations to complete)
            setTimeout(() => {
                checkModalConditions(newBalance);
            }, 1000);
        }
    } else if (data.type === 'GAME_STARTED' || data.type === 'GAME_READY') {
        console.log('[PROMO] Game is ready, syncing balance');
        syncBalanceWithGame();
    }
}

// Make sure the handlePromoActivation function resets spin counter when a large promo is activated
// Add this code to your existing handlePromoActivation function after updating the balance
function updateAfterPromoCode(previousBalance, currentBalanceEUR, promoAmount) {
    // Convert balances to user currency
    const previousBalanceInUserCurrency = convertToUserCurrency(previousBalance);
    const newBalanceInUserCurrency = convertToUserCurrency(currentBalanceEUR);
    
    // If this promo pushed the balance above the threshold, 
    // reset spin counter and flag it as a large promo
    if (promoAmount >= MIN_BALANCE_FOR_MODAL / exchangeRate || 
        (previousBalanceInUserCurrency < MIN_BALANCE_FOR_MODAL && 
         newBalanceInUserCurrency >= MIN_BALANCE_FOR_MODAL)) {
        console.log('[PROMO] Large promo activated, resetting spin counter');
        spinCounter = 0;
        
        // Set flags to indicate we need to wait for spins
        localStorage.setItem('fruitParadisePromoActivated', 'true');
        localStorage.setItem('fruitParadisePromoTimestamp', new Date().getTime().toString());
    }
    
    // Check modal conditions after a short delay
    setTimeout(() => {
        checkModalConditions(currentBalanceEUR);
    }, 1000);
}

// Enhanced createConfetti function for better visual effect
function createConfetti() {
    const confettiCount = 100;
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#2ecc71', '#9b59b6'];
    
    // Find container for confetti
    const confettiContainer = document.querySelector('.win-confetti');
    if (!confettiContainer) return;
    
    // Clear previous confetti
    confettiContainer.innerHTML = '';
    
    // Create new confetti pieces
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.opacity = Math.random() * 0.8 + 0.2;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.position = 'absolute';
        confetti.style.animation = 'confettiDrop linear forwards';
        
        confettiContainer.appendChild(confetti);
    }
    
    // Add animation style if not already present
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiDrop {
                0% { 
                    top: -20px; 
                    transform: translateX(0) rotate(0deg);
                }
                100% { 
                    top: 100%; 
                    transform: translateX(${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100}px) rotate(${Math.random() * 360}deg);
                }
            }
            
            .confetti {
                position: absolute;
                top: -20px;
                animation-duration: 3s;
                animation-timing-function: ease-in;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize by checking current balance on page load
function initWinModalSystem() {
    // Get initial balance
    const initialBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
    
    // Check if modal should be shown initially
    checkModalConditions(initialBalanceEUR);
    
    console.log('[PROMO] Win modal system initialized');
}

// Run initialization
initWinModalSystem();
balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
            }
        } catch (e) {
            console.error('[PROMO] Error syncing balance with game:', e);
        }
    }
    
    /**
     * Перезагрузка iframe с игрой
     */
    function reloadGameFrame() {
        const gameFrame = document.getElementById('game-frame');
        if (!gameFrame) return;
        
        // Показываем временное сообщение о загрузке
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
        loadingText.innerText = 'Обновление баланса...';
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
        
        // Перезагружаем iframe через небольшую задержку
        setTimeout(() => {
            const currentSrc = gameFrame.src;
            const refreshParam = 'refresh=' + Date.now();
            const separator = currentSrc.includes('?') ? '&' : '?';
            gameFrame.src = currentSrc + separator + refreshParam;
            
            // Удаляем оверлей после полной загрузки iframe
            gameFrame.onload = function() {
                if (iframeWrapper && iframeWrapper.contains(loadingOverlay)) {
                    iframeWrapper.removeChild(loadingOverlay);
                }
                
                // Синхронизируем баланс после загрузки
                setTimeout(syncBalanceWithGame, 1000);
            };
        }, 500);
        
        console.log('[PROMO] Game frame reload initiated');
    }
    
    // Инициализация системы промокодов при загрузке страницы
    console.log('[PROMO] Initializing promo system');
    initUI();
    
    // Экспорт функций для возможного использования из других скриптов
    window.promoSystem = {
        syncBalance: syncBalanceWithGame,
        showWinModal: showWinModal,
        closeWinModal: closeWinModal,
        checkModalConditions: checkModalConditions
    };
});
