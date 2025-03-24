/**
 * Система промокодов и управления балансом для слот-машины Fruit Paradise
 * С поддержкой ограниченного количества активаций промокодов и улучшенной синхронизацией
 */

document.addEventListener('DOMContentLoaded', function() {
    // Константы и переменные
    const STORAGE_BALANCE_KEY = 'fruitParadiseBalance';
    const STORAGE_INIT_BALANCE_KEY = 'fruitParadiseInitBalance'; // Отдельный ключ для начального баланса
    const STORAGE_PROMOS_KEY = 'fruitParadisePromoCodes';
    const STORAGE_USED_PROMOS_KEY = 'fruitParadiseUsedCodes';
    const STORAGE_THRESHOLDS_KEY = 'fruitParadiseThresholds';
    const STORAGE_USER_PROMOS_KEY = 'fruitParadiseUserUsedCodes'; // Track per-user usage
    const STORAGE_USER_ID_KEY = 'fruitParadiseUserId'; // Unique user identifier
    
    // Переменные для механики показа модального окна
    let spinCounter = 0;
    const MIN_SPINS_BEFORE_MODAL = 3;
    const MIN_BALANCE_FOR_MODAL = 100;
    
    // DOM элементы
    const balanceElement = document.getElementById('balance-amount');
    const balanceCurrency = document.querySelector('.balance-currency');
    const promoCodeInput = document.getElementById('promo-code-input');
    const activatePromoBtn = document.getElementById('activate-promo-btn');
    const promoMessage = document.getElementById('promo-message');
    const claimWinningsBtn = document.getElementById('claim-winnings-btn');
    const gameFrame = document.getElementById('game-frame');
    const winModal = document.getElementById('win-modal');
    const winModalAmount = document.getElementById('win-modal-amount');
    const winModalCurrency = document.getElementById('win-modal-currency');
    const winModalClaimBtn = document.getElementById('win-modal-claim-btn');
    const winModalCloseBtn = document.getElementById('win-modal-close-btn');
    
    // Переменные для работы с валютой
    let userCurrency = 'EUR';
    let currencySymbol = '€';
    let exchangeRate = 1;
    
    // Инициализация элементов интерфейса
    function initUI() {
        console.log('[PROMO] Initializing UI components');
        
        // Загружаем текущий баланс
        initBalanceAndCurrency();
        
        // Привязываем обработчики событий
        if (activatePromoBtn) {
            activatePromoBtn.addEventListener('click', handlePromoActivation);
            console.log('[PROMO] Promo button listener added');
        } else {
            console.warn('[PROMO] Promo button not found');
        }
        
        if (promoCodeInput) {
            promoCodeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handlePromoActivation();
                }
            });
        } else {
            console.warn('[PROMO] Promo input not found');
        }
        
        if (claimWinningsBtn) {
            claimWinningsBtn.addEventListener('click', handleClaimWinnings);
            console.log('[PROMO] Claim button listener added');
        } else {
            console.warn('[PROMO] Claim button not found');
        }
        
        // Инициализация модального окна
        initWinModal();
        
        // Устанавливаем обработчик для межоконного сообщения от игры
        window.addEventListener('message', receiveMessageFromGame);
        
        // Добавляем обработчик загрузки iframe для синхронизации баланса
        if (gameFrame) {
            gameFrame.addEventListener('load', function() {
                console.log('[PROMO] Game frame loaded, syncing balance');
                syncBalanceWithGame();
            });
        } else {
            console.warn('[PROMO] Game frame not found');
        }
        
        // Проверяем, достигнут ли порог выигрыша при загрузке страницы
        const currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        checkModalConditions(currentBalanceEUR);
        
        console.log('[PROMO] UI initialization complete');
    }
    
    /**
     * Инициализация модального окна выигрыша
     */
    function initWinModal() {
        if (!winModal) {
            console.warn('[PROMO] Win modal not found in DOM');
            return;
        }
        
        console.log('[PROMO] Initializing win modal');
        
        // Устанавливаем обработчик для кнопки закрытия
        if (winModalCloseBtn) {
            winModalCloseBtn.addEventListener('click', closeWinModal);
        } else {
            console.warn('[PROMO] Win modal close button not found');
        }
        
        // Устанавливаем обработчик для кнопки забрать выигрыш
        if (winModalClaimBtn) {
            winModalClaimBtn.addEventListener('click', handleClaimWinnings);
        } else {
            console.warn('[PROMO] Win modal claim button not found');
        }
        
        // Закрытие модального окна при клике вне его содержимого
        winModal.addEventListener('click', function(e) {
            if (e.target === winModal) {
                closeWinModal();
            }
        });
        
        // Закрытие модального окна при нажатии клавиши Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && winModal.style.display === 'flex') {
                closeWinModal();
            }
        });
    }
    
    /**
     * Инициализация баланса и получение настроек валюты
     */
    function initBalanceAndCurrency() {
        // Текущий баланс (в EUR)
        let currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        
        // Инициализация начального баланса, если он не установлен
        if (localStorage.getItem(STORAGE_INIT_BALANCE_KEY) === null) {
            console.log('[PROMO] Setting initial balance to 100');
            localStorage.setItem(STORAGE_INIT_BALANCE_KEY, '100');
        }
        
        // Проверяем, есть ли доступ к системе валют
        if (window.currencyHandler) {
            // Используем готовую систему валют
            userCurrency = window.currencyHandler.userCurrency;
            currencySymbol = window.currencyHandler.currencySymbol;
            exchangeRate = window.currencyHandler.exchangeRate;
            console.log(`[PROMO] Using currency handler: ${userCurrency}, rate: ${exchangeRate}`);
        } else {
            // Если системы валют нет, используем значения по умолчанию
            // Получаем данные из настроек
            const savedCurrency = localStorage.getItem('fruitParadiseCurrency');
            if (savedCurrency) {
                userCurrency = savedCurrency;
                
                // Устанавливаем символы валют
                const symbols = {
                    'EUR': '€',
                    'USD': '$',
                    'GBP': '£',
                    'CNY': '¥',
                    'JPY': '¥',
                    'INR': '₹',
                    'CAD': 'C$'
                };
                
                // Устанавливаем курсы валют относительно EUR
                const rates = {
                    'EUR': 1,
                    'USD': 1.08,
                    'GBP': 0.86,
                    'CNY': 7.8,
                    'JPY': 160.5,
                    'INR': 89.7,
                    'CAD': 1.48
                };
                
                currencySymbol = symbols[userCurrency] || '€';
                exchangeRate = rates[userCurrency] || 1;
            }
            console.log(`[PROMO] Using default currency settings: ${userCurrency}, rate: ${exchangeRate}`);
        }
        
        // Обновляем отображение валюты
        if (balanceCurrency) {
            balanceCurrency.textContent = userCurrency;
        }
        
        // Отображаем текущий баланс в валюте пользователя
        if (balanceElement) {
            const balanceInUserCurrency = currentBalanceEUR * exchangeRate;
            balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
        }
        
        if (winModalCurrency) {
            winModalCurrency.textContent = userCurrency;
        }
        
        console.log(`[PROMO] Initialized with: ${currentBalanceEUR} EUR, currency: ${userCurrency}, rate: ${exchangeRate}`);
    }
    
    /**
     * Преобразование суммы из внутренней валюты (EUR) в валюту пользователя
     */
    function convertToUserCurrency(amountInEur) {
        return amountInEur * exchangeRate;
    }
    
    /**
     * Форматирование суммы в валюту пользователя
     */
    function formatCurrency(amount, withSymbol = true) {
        // Округляем до 2 десятичных знаков
        const formattedAmount = Math.round(amount * 100) / 100;
        
        // Для йены не используем десятичные знаки
        if (userCurrency === 'JPY') {
            return withSymbol ? `${currencySymbol}${Math.round(formattedAmount)}` : Math.round(formattedAmount).toString();
        }
        
        // Для других валют используем 2 десятичных знака
        return withSymbol 
            ? `${currencySymbol}${formattedAmount.toFixed(2)}`
            : formattedAmount.toFixed(2);
    }
    
    /**
     * Генерация уникального ID пользователя
     */
    function getUserId() {
        let userId = localStorage.getItem(STORAGE_USER_ID_KEY);
        
        if (!userId) {
            // Генерируем псевдо-случайный ID для пользователя
            userId = 'user_' + Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
            localStorage.setItem(STORAGE_USER_ID_KEY, userId);
        }
        
        return userId;
    }
    
    /**
     * Проверка, использовал ли пользователь этот промокод ранее
     */
    function hasUserUsedPromoCode(code) {
        const userId = getUserId();
        const userUsedCodes = JSON.parse(localStorage.getItem(STORAGE_USER_PROMOS_KEY)) || {};
        
        // Если нет записей для этого пользователя или кода, значит они не использовали его
        if (!userUsedCodes[userId] || !userUsedCodes[userId].includes(code)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Отметка промокода как использованного текущим пользователем
     */
    function markPromoCodeAsUsedByUser(code) {
        const userId = getUserId();
        const userUsedCodes = JSON.parse(localStorage.getItem(STORAGE_USER_PROMOS_KEY)) || {};
        
        // Инициализируем массив для этого пользователя, если нужно
        if (!userUsedCodes[userId]) {
            userUsedCodes[userId] = [];
        }
        
        // Добавляем код в список использованных пользователем, если его там еще нет
        if (!userUsedCodes[userId].includes(code)) {
            userUsedCodes[userId].push(code);
            localStorage.setItem(STORAGE_USER_PROMOS_KEY, JSON.stringify(userUsedCodes));
        }
    }
    
    /**
     * Обработка активации промокода
     */
    function handlePromoActivation() {
        if (!promoCodeInput || !promoMessage) {
            console.warn('[PROMO] Promo input or message element not found');
            return;
        }
        
        const code = promoCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            showPromoMessage('Пожалуйста, введите промокод', 'error');
            return;
        }
        
        console.log(`[PROMO] Processing promo code: ${code}`);
        
        // Получаем данные об использованных промокодах
        const usedPromoCodes = JSON.parse(localStorage.getItem(STORAGE_USED_PROMOS_KEY)) || [];
        
        // Получаем доступные промокоды
        const availablePromos = JSON.parse(localStorage.getItem(STORAGE_PROMOS_KEY)) || [];
        const promo = availablePromos.find(p => p.code.toUpperCase() === code);
        
        if (!promo) {
            showPromoMessage('Неверный промокод', 'error');
            return;
        }
        
        // Проверяем, использовал ли этот пользователь промокод ранее
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
            showPromoMessage(`Промокод ${code} больше не действителен (достигнут лимит активаций)`, 'error');
            return;
        }
        
        // Получаем текущий баланс в EUR
        let currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        const previousBalance = currentBalanceEUR;
        
        // Промокод валиден и не использован этим пользователем, применяем бонус
        currentBalanceEUR += promo.amount;
        
        console.log(`[PROMO] Applying promo: ${previousBalance} EUR -> ${currentBalanceEUR} EUR (+${promo.amount} EUR)`);
        
        // Обновляем баланс в localStorage
        localStorage.setItem(STORAGE_BALANCE_KEY, currentBalanceEUR.toString());
        
        // Отмечаем что промокод был недавно активирован
        localStorage.setItem('fruitParadisePromoActivated', 'true');
        localStorage.setItem('fruitParadisePromoTimestamp', new Date().getTime().toString());
        
        // Сбрасываем счетчик спинов если это крупный промокод, повышающий баланс выше порога
        const previousBalanceInUserCurrency = convertToUserCurrency(previousBalance);
        const newBalanceInUserCurrency = convertToUserCurrency(currentBalanceEUR);
        
        if (promo.amount >= MIN_BALANCE_FOR_MODAL / exchangeRate || 
            (previousBalanceInUserCurrency < MIN_BALANCE_FOR_MODAL && newBalanceInUserCurrency >= MIN_BALANCE_FOR_MODAL)) {
            console.log('[PROMO] Large promo activated, resetting spin counter');
            spinCounter = 0;
        }
        
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
        
        // Форматируем сумму для отображения
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
            balanceElement.textContent = formatCurrency(newBalanceInUserCurrency, false);
        }
        
        // Перезагружаем iframe со слотом
        reloadGameFrame();
        
        // Проверяем, достигнут ли порог выигрыша
        setTimeout(() => {
            checkModalConditions(currentBalanceEUR);
        }, 1000);
    }
    
    /**
     * Отображение сообщения о результате активации промокода
     */
    function showPromoMessage(message, type) {
        if (!promoMessage) return;
        
        promoMessage.textContent = message;
        promoMessage.className = 'promo-message';
        promoMessage.classList.add(type);
        promoMessage.style.display = 'block';
        promoMessage.style.opacity = '1';
        
        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
            promoMessage.style.opacity = '0';
            
            setTimeout(() => {
                promoMessage.style.display = 'none';
                promoMessage.style.opacity = '1';
            }, 300);
        }, 3000);
    }
    
    /**
     * Обработка клика по кнопке "Забрать выигрыш"
     */
    function handleClaimWinnings() {
        console.log('[PROMO] Claim winnings button clicked');
        
        // Получаем настройки порогов выигрыша
        const thresholds = JSON.parse(localStorage.getItem(STORAGE_THRESHOLDS_KEY)) || [];
        
        // Получаем текущий баланс в EUR
        const currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        
        // Находим подходящий порог для редиректа
        let targetUrl = null;
        let highestThresholdAmount = 0;
        
        for (const threshold of thresholds) {
            if (currentBalanceEUR >= threshold.amount && threshold.amount > highestThresholdAmount) {
                targetUrl = threshold.redirectUrl;
                highestThresholdAmount = threshold.amount;
            }
        }
        
        // Скрываем модальное окно, если оно открыто
        if (winModal) {
            closeWinModal();
        }
        
        // Если найден подходящий порог, перенаправляем на указанный URL
        if (targetUrl) {
            console.log(`[PROMO] Redirecting to: ${targetUrl}`);
            window.location.href = targetUrl;
        } else {
            // Если порог не найден, перенаправляем на дефолтную страницу
            console.log('[PROMO] No threshold matched, redirecting to default claim page');
            window.location.href = "/claim";
        }
    }
    
    /**
     * Получение сообщений от iframe с игрой
     */
    function receiveMessageFromGame(event) {
        // Проверяем источник сообщения, но не строго для упрощения разработки
        const data = event.data;
        
        if (typeof data !== 'object' || !data.type) {
            return;
        }
        
        console.log('[PROMO] Received message from game:', data);
        
        if (data.type === 'UPDATE_BALANCE') {
            // Получено сообщение об обновлении баланса от игры
            const newBalance = parseFloat(data.balance) || 0;
            localStorage.setItem(STORAGE_BALANCE_KEY, newBalance);
            
            // Обновляем отображение баланса
            if (balanceElement) {
                const balanceInUserCurrency = convertToUserCurrency(newBalance);
                balanceElement.textContent = formatCurrency(balanceInUserCurrency, false);
            }
            
            console.log(`[PROMO] Balance updated from game: ${newBalance} EUR`);
            
            // Проверяем, был ли сделан спин
            if (data.spinMade) {
                spinCounter++;
                console.log(`[PROMO] Spin detected! Total spins: ${spinCounter}`);
                
                // Проверяем условия для показа модального окна с небольшой задержкой
                setTimeout(() => {
                    checkModalConditions(newBalance);
                }, 500);
            }
        } else if (data.type === 'GAME_STARTED' || data.type === 'GAME_READY') {
            // Игра загрузилась, отправляем текущий баланс
            console.log('[PROMO] Game is ready, syncing balance');
            syncBalanceWithGame();
        }
    }
    
    /**
     * Проверка условий для показа модального окна
     */
    function checkModalConditions(balanceEUR) {
        console.log('[PROMO] Checking modal conditions');
        
        // Конвертируем в валюту пользователя
        const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
        
        console.log(`[PROMO] Balance: ${balanceInUserCurrency} ${userCurrency}, Threshold: ${MIN_BALANCE_FOR_MODAL}`);
        console.log(`[PROMO] Spins: ${spinCounter}`);
        
        // Проверяем, достаточен ли баланс
        if (balanceInUserCurrency >= MIN_BALANCE_FOR_MODAL) {
            // Если баланс от промокода, ждем минимального количества спинов
            const promoActivated = localStorage.getItem('fruitParadisePromoActivated');
            const promoTimestamp = parseInt(localStorage.getItem('fruitParadisePromoTimestamp') || '0');
            const currentTime = new Date().getTime();
            const isRecentPromo = (currentTime - promoTimestamp) < 60000; // В течение последней минуты
            
            if (promoActivated === 'true' && isRecentPromo && spinCounter < MIN_SPINS_BEFORE_MODAL) {
                console.log(`[PROMO] Recent promo balance, waiting for ${MIN_SPINS_BEFORE_MODAL} spins (current: ${spinCounter})`);
                return;
            }
            
            // Показываем модальное окно
            console.log('[PROMO] All conditions met, showing win modal');
            showWinModal(balanceEUR);
        } else {
            // Закрываем модальное окно, если оно открыто и баланс упал ниже порога
            if (winModal && winModal.style.display === 'flex') {
                console.log('[PROMO] Balance below threshold, closing modal');
                closeWinModal();
            }
        }
    }
    
    /**
     * Показывает модальное окно выигрыша
     */
    function showWinModal(balanceEUR) {
        if (!winModal) {
            console.warn('[PROMO] Win modal element not found');
            return;
        }
        
        // Конвертируем в валюту пользователя
        const balanceInUserCurrency = convertToUserCurrency(balanceEUR);
        
        // Устанавливаем сумму в модальном окне
        if (winModalAmount) {
            winModalAmount.textContent = formatCurrency(balanceInUserCurrency, false);
        }
        
        // Обновляем отображение валюты
        if (winModalCurrency) {
            winModalCurrency.textContent = userCurrency;
        }
        
        // Показываем модальное окно
        winModal.style.display = 'flex';
        
        // Создаем и запускаем анимацию конфетти
        createConfetti();
        
        console.log('[PROMO] Win modal displayed with balance:', balanceInUserCurrency, userCurrency);
    }
    
    /**
     * Закрывает модальное окно выигрыша
     */
    function closeWinModal() {
        if (!winModal) return;
        
        // Добавляем анимацию закрытия
        winModal.style.opacity = '0';
        
        // Скрываем модальное окно после анимации
        setTimeout(() => {
            winModal.style.display = 'none';
            winModal.style.opacity = '1';
            
            // Очищаем конфетти
            const confettiContainer = winModal.querySelector('.win-confetti');
            if (confettiContainer) {
                confettiContainer.innerHTML = '';
            }
        }, 300);
        
        console.log('[PROMO] Win modal closed');
    }
    
    /**
     * Создает анимацию конфетти для модального окна выигрыша
     */
    function createConfetti() {
        const confettiCount = 100;
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#2ecc71', '#9b59b6'];
        
        // Находим контейнер для конфетти
        const confettiContainer = document.querySelector('.win-confetti');
        if (!confettiContainer) return;
        
        // Очищаем предыдущие конфетти
        confettiContainer.innerHTML = '';
        
        // Создаем новые конфетти
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
            
            confettiContainer.appendChild(confetti);
        }
    }
    
    /**
     * Отправка текущего баланса в iframe с игрой
     */
    function syncBalanceWithGame() {
        const gameFrame = document.getElementById('game-frame');
        if (!gameFrame) {
            console.warn('[PROMO] Game frame not found, cannot sync balance');
            return;
        }
        
        // Получаем текущий баланс
        const currentBalanceEUR = parseFloat(localStorage.getItem(STORAGE_BALANCE_KEY)) || 0;
        
        console.log(`[PROMO] Syncing balance with game: ${currentBalanceEUR} EUR`);
        
        try {
            // Обновляем в localStorage (это основной способ для синхронизации)
            localStorage.setItem(STORAGE_BALANCE_KEY, currentBalanceEUR.toString());
            
            // Отправляем сообщение в iframe
            if (gameFrame.contentWindow) {
                gameFrame.contentWindow.postMessage({
                    type: 'SET_BALANCE',
                    balance: currentBalanceEUR
                }, '*');
            }
            
            // Обновляем отображение в UI
            if (balanceElement) {
                const balanceInUserCurrency = convertToUserCurrency(currentBalanceEUR);
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