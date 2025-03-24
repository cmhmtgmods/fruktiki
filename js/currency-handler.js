// Файл js/currency-handler.js

/**
 * Система управления валютами и синхронизации баланса
 * ===================================================
 * Определяет валюту пользователя по его местоположению
 * Выполняет конвертацию баланса между разными валютами
 * Обеспечивает синхронизацию баланса между игрой и основным интерфейсом
 */

// Настройки валют по умолчанию
const CURRENCY_SETTINGS = {
    // Базовая валюта (все расчеты внутри игры ведутся в EUR)
    baseCurrency: 'EUR',
    
    // Поддерживаемые валюты и их курсы относительно EUR
    exchangeRates: {
        'EUR': 1,
        'USD': 1.08,
        'GBP': 0.86,
        'CNY': 7.8,
        'JPY': 160.5,
        'INR': 89.7,
        'CAD': 1.48,
    },
    
    // Символы валют
    symbols: {
        'EUR': '€',
        'USD': '$',
        'GBP': '£',
        'CNY': '¥',
        'JPY': '¥',
        'INR': '₹',
        'CAD': 'C$'
    },
    
    // Соответствие кодов стран и валют
    countryToCurrency: {
        // Европа
        'AT': 'EUR', 'BE': 'EUR', 'BG': 'EUR', 'HR': 'EUR', 'CY': 'EUR',
        'CZ': 'EUR', 'DK': 'EUR', 'EE': 'EUR', 'FI': 'EUR', 'FR': 'EUR',
        'DE': 'EUR', 'GR': 'EUR', 'HU': 'EUR', 'IE': 'EUR', 'IT': 'EUR',
        'LV': 'EUR', 'LT': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'NL': 'EUR',
        'PL': 'EUR', 'PT': 'EUR', 'RO': 'EUR', 'SK': 'EUR', 'SI': 'EUR',
        'ES': 'EUR', 'SE': 'EUR',
        
        // Россия - используем USD вместо RUB
        'RU': 'USD',
        
        // США
        'US': 'USD',
        
        // Великобритания
        'GB': 'GBP',
        
        // Китай
        'CN': 'CNY',
        
        // Япония
        'JP': 'JPY',
        
        // Индия
        'IN': 'INR',
        
        // Канада
        'CA': 'CAD',
    }
};

/**
 * Класс для управления валютой игры
 */
class CurrencyHandler {
    constructor() {
        this.initCurrency();
        this.initBalanceSynchronization();
    }
    
    /**
     * Инициализация определения валюты пользователя
     */
    async initCurrency() {
        try {
            // Сначала пробуем загрузить сохраненную валюту
            const savedCurrency = localStorage.getItem('fruitParadiseCurrency');
            
            if (savedCurrency && CURRENCY_SETTINGS.exchangeRates[savedCurrency]) {
                this.userCurrency = savedCurrency;
                console.log(`[Currency] Loaded saved currency: ${this.userCurrency}`);
            } else {
                // Если нет сохраненной валюты, определяем по IP
                await this.detectUserCurrency();
            }
            
            // Устанавливаем символ и курс валюты
            this.currencySymbol = CURRENCY_SETTINGS.symbols[this.userCurrency] || '€';
            this.exchangeRate = CURRENCY_SETTINGS.exchangeRates[this.userCurrency] || 1;
            
            // Обновляем отображение валюты на странице
            this.updateCurrencyDisplay();
            
        } catch (error) {
            console.error('[Currency] Error initializing currency:', error);
            // Устанавливаем EUR как валюту по умолчанию
            this.userCurrency = 'EUR';
            this.currencySymbol = '€';
            this.exchangeRate = 1;
        }
    }
    
    /**
     * Определение валюты пользователя на основе его IP-адреса
     */
    async detectUserCurrency() {
        try {
            // API для определения страны по IP
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            const userCountryCode = data.country_code;
            console.log(`[Currency] Detected country code: ${userCountryCode}`);
            
            // Определяем валюту по стране
            if (userCountryCode && CURRENCY_SETTINGS.countryToCurrency[userCountryCode]) {
                this.userCurrency = CURRENCY_SETTINGS.countryToCurrency[userCountryCode];
            } else {
                // Если не смогли определить - используем евро
                this.userCurrency = 'EUR';
            }
            
            // Сохраняем валюту для будущих сессий
            localStorage.setItem('fruitParadiseCurrency', this.userCurrency);
            console.log(`[Currency] Set currency to: ${this.userCurrency}`);
            
        } catch (error) {
            console.error('[Currency] Error detecting country:', error);
            // Если не удалось определить страну - используем евро
            this.userCurrency = 'EUR';
        }
    }
    
    /**
     * Преобразование суммы из внутренней валюты (EUR) в валюту пользователя
     */
    convertToUserCurrency(amountInEur) {
        return amountInEur * this.exchangeRate;
    }
    
    /**
     * Преобразование суммы из валюты пользователя во внутреннюю валюту (EUR)
     */
    convertToBaseCurrency(amountInUserCurrency) {
        return amountInUserCurrency / this.exchangeRate;
    }
    
    /**
     * Форматирование суммы в валюту пользователя
     */
    formatCurrency(amount, withSymbol = true) {
        // Округляем до 2 десятичных знаков
        const formattedAmount = Math.round(amount * 100) / 100;
        
        // Для йены не используем десятичные знаки
        if (this.userCurrency === 'JPY') {
            return withSymbol ? `${this.currencySymbol}${Math.round(formattedAmount)}` : Math.round(formattedAmount).toString();
        }
        
        // Для других валют используем 2 десятичных знака
        return withSymbol 
            ? `${this.currencySymbol}${formattedAmount.toFixed(2)}`
            : formattedAmount.toFixed(2);
    }
    
    /**
     * Обновление всех отображений валюты на странице
     */
    updateCurrencyDisplay() {
        // Обновляем все места, где отображается символ валюты
        const currencyElements = document.querySelectorAll('.balance-currency');
        currencyElements.forEach(el => {
            el.textContent = this.userCurrency;
        });
        
        // Обновляем джекпот и другие фиксированные суммы
        this.updateJackpotAmount();
        
        // Обновляем текущий баланс
        this.updateBalanceDisplay();
    }
    
    /**
     * Обновление отображения джекпота
     */
    updateJackpotAmount() {
        const jackpotBase = 1250000; // базовая сумма джекпота в EUR
        const jackpotInUserCurrency = this.convertToUserCurrency(jackpotBase);
        
        // Форматируем джекпот с разделителями разрядов
        const formattedJackpot = this.formatCurrency(jackpotInUserCurrency, false);
        const formattedWithSeparators = new Intl.NumberFormat(document.documentElement.lang, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(jackpotInUserCurrency));
        
        // Обновляем везде, где отображается джекпот
        document.querySelectorAll('.jackpot-amount, .jackpot-value').forEach(el => {
            el.textContent = `${this.currencySymbol}${formattedWithSeparators}`;
        });
    }
    
    /**
     * Инициализирует обработчики для синхронизации баланса с игрой
     */
    initBalanceSynchronization() {
        // Слушаем сообщения от iframe с игрой
        window.addEventListener('message', this.handleGameMessage.bind(this), false);
        
        // Обработчик для кнопки вывода выигрыша
        const claimBtn = document.getElementById('claim-winnings-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', this.handleClaimWinnings.bind(this));
        }
        
        // Получаем начальный баланс из localStorage
        const savedBalanceEUR = parseFloat(localStorage.getItem('fruitParadiseBalance')) || 100;
        
        // Сохраняем внутреннее значение в EUR и отображаемое значение в валюте пользователя
        this.balanceEUR = savedBalanceEUR;
        
        // Задержка для загрузки курса валюты
        setTimeout(() => {
            this.updateBalanceDisplay();
            
            // Отправляем баланс в игру
            this.syncBalanceToGame();
        }, 1000);
    }
    
    /**
     * Обработчик сообщений от игры
     */
    handleGameMessage(event) {
        const data = event.data;
        
        // Проверяем, что сообщение от нашей игры
        if (typeof data !== 'object' || !data.type) return;
        
        console.log('[Currency] Received message from game:', data);
        
        switch (data.type) {
            case 'GAME_STARTED':
                // Игра загрузилась и готова принимать команды
                console.log('[Currency] Game started, syncing balance...');
                this.syncBalanceToGame();
                break;
                
            case 'UPDATE_BALANCE':
                // Получен новый баланс от игры (в EUR)
                console.log('[Currency] Received balance update from game:', data.balance);
                
                // Обновляем внутренний баланс в EUR
                this.balanceEUR = data.balance;
                
                // Сохраняем в localStorage
                localStorage.setItem('fruitParadiseBalance', this.balanceEUR);
                
                // Обновляем отображение
                this.updateBalanceDisplay();
                break;
        }
    }
    
    /**
     * Обновляет отображение баланса в интерфейсе
     */
    updateBalanceDisplay() {
        // Конвертируем в валюту пользователя
        const balanceInUserCurrency = this.convertToUserCurrency(this.balanceEUR);
        
        // Получаем элемент отображения баланса
        const balanceElement = document.getElementById('balance-amount');
        if (balanceElement) {
            balanceElement.textContent = this.formatCurrency(balanceInUserCurrency, false);
        }
        
        console.log(`[Currency] Balance updated: ${this.balanceEUR} EUR = ${balanceInUserCurrency} ${this.userCurrency}`);
    }
    
    /**
     * Синхронизирует текущий баланс с игрой (отправляет в iframe)
     */
    syncBalanceToGame() {
        const gameFrame = document.getElementById('game-frame');
        if (!gameFrame || !gameFrame.contentWindow) {
            console.warn('[Currency] Game frame not ready yet, will retry...');
            setTimeout(() => this.syncBalanceToGame(), 1000);
            return;
        }
        
        console.log('[Currency] Syncing balance to game:', this.balanceEUR);
        
        // Отправляем сообщение в iframe
        gameFrame.contentWindow.postMessage({
            type: 'SET_BALANCE',
            balance: this.balanceEUR // важно отправлять в EUR, т.к. игра работает в EUR
        }, '*');
    }
    
    /**
     * Обработчик нажатия кнопки вывода выигрыша
     */
    handleClaimWinnings() {
        // Здесь можно добавить логику вывода выигрыша
        alert(`Поздравляем! Вы успешно вывели ${this.formatCurrency(this.convertToUserCurrency(this.balanceEUR))}!`);
        
        // Сбрасываем баланс
        this.balanceEUR = 0;
        localStorage.setItem('fruitParadiseBalance', 0);
        
        // Обновляем отображение
        this.updateBalanceDisplay();
        
        // Синхронизируем с игрой
        this.syncBalanceToGame();
    }
    
    /**
     * Обновляет баланс пользователя на указанную сумму
     */
    updateBalance(amount, isDeposit = true) {
        // Конвертируем сумму из валюты пользователя в EUR
        const amountInEUR = this.convertToBaseCurrency(amount);
        
        // Добавляем или вычитаем из баланса
        this.balanceEUR = isDeposit 
            ? this.balanceEUR + amountInEUR
            : Math.max(0, this.balanceEUR - amountInEUR);
            
        // Сохраняем обновленный баланс
        localStorage.setItem('fruitParadiseBalance', this.balanceEUR);
        
        // Обновляем отображение
        this.updateBalanceDisplay();
        
        // Синхронизируем с игрой
        this.syncBalanceToGame();
    }
}


// Создаем и экспортируем экземпляр для глобального использования
window.currencyHandler = new CurrencyHandler();

