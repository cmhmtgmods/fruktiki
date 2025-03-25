(function() {
    // Константы для cookie/storage
    const GLOBAL_COOKIE_PREFIX = 'fruitParadiseGlobal_';
    const INITIAL_BALANCE_KEY = GLOBAL_COOKIE_PREFIX + 'initialBalance';
    const PROMO_CODES_KEY = GLOBAL_COOKIE_PREFIX + 'promoCodes';
    const THRESHOLDS_KEY = GLOBAL_COOKIE_PREFIX + 'thresholds';
    
    // Локальные ключи для обратной совместимости
    const LOCAL_INIT_BALANCE_KEY = 'fruitParadiseInitBalance';
    const LOCAL_BALANCE_KEY = 'fruitParadiseBalance';
    const LOCAL_PROMOS_KEY = 'fruitParadisePromoCodes';
    const LOCAL_THRESHOLDS_KEY = 'fruitParadiseThresholds';
    
    // Значения по умолчанию
    const DEFAULT_INITIAL_BALANCE = 20; // Изменено со 100 на 20
    
    /**
     * Получение значения cookie
     */
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                try {
                    return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
                } catch (e) {
                    console.error(`[SLOT] Ошибка при парсинге cookie ${name}:`, e);
                    return null;
                }
            }
        }
        return null;
    }
    
    /**
     * Функция для получения начального баланса
     */
   function getInitialBalance() {
    // УДАЛЯЕМ localStorage
    localStorage.removeItem('fruitParadiseBalance');
    
    // Безусловно берем значение из cookie
    const cookieValue = getCookie(INITIAL_BALANCE_KEY);
    
    if (cookieValue !== null && !isNaN(parseFloat(cookieValue))) {
        console.log(`[SLOT] ПРИНУДИТЕЛЬНО устанавливаем баланс из cookie: ${cookieValue}`);
        return parseFloat(cookieValue);
    }
    
    // Если cookie нет, используем дефолтное значение
    return DEFAULT_INITIAL_BALANCE;
}
    
    /**
     * Функция для получения списка промокодов
     */
    function getPromoCodes() {
        // Сначала пытаемся получить из глобальных настроек через cookie
        const cookieValue = getCookie(PROMO_CODES_KEY);
        if (cookieValue !== null && Array.isArray(cookieValue)) {
            console.log(`[SLOT] Получены промокоды из глобальных настроек: ${cookieValue.length} шт.`);
            return cookieValue;
        }
        
        // Затем пытаемся получить из localStorage
        try {
            const localValue = JSON.parse(localStorage.getItem(LOCAL_PROMOS_KEY));
            if (localValue !== null && Array.isArray(localValue)) {
                console.log(`[SLOT] Получены промокоды из localStorage: ${localValue.length} шт.`);
                return localValue;
            }
        } catch (e) {
            console.error('[SLOT] Ошибка при парсинге промокодов из localStorage:', e);
        }
        
        console.log(`[SLOT] Промокоды не найдены`);
        return [];
    }
    
    /**
     * Функция для получения порогов выигрышей
     */
    function getThresholds() {
        // Сначала пытаемся получить из глобальных настроек через cookie
        const cookieValue = getCookie(THRESHOLDS_KEY);
        if (cookieValue !== null && Array.isArray(cookieValue)) {
            console.log(`[SLOT] Получены пороги из глобальных настроек: ${cookieValue.length} шт.`);
            return cookieValue;
        }
        
        // Затем пытаемся получить из localStorage
        try {
            const localValue = JSON.parse(localStorage.getItem(LOCAL_THRESHOLDS_KEY));
            if (localValue !== null && Array.isArray(localValue)) {
                console.log(`[SLOT] Получены пороги из localStorage: ${localValue.length} шт.`);
                return localValue;
            }
        } catch (e) {
            console.error('[SLOT] Ошибка при парсинге порогов из localStorage:', e);
        }
        
        console.log(`[SLOT] Пороги не найдены`);
        return [];
    }
    
    /**
     * Инициализация баланса слота из глобальных настроек
     */
    function initializeSlotBalance() {
        // Проверяем, есть ли уже сохраненный баланс
        const existingBalance = localStorage.getItem(LOCAL_BALANCE_KEY);
        
        // Если баланса нет или он равен нулю, используем начальный баланс
        if (!existingBalance || parseFloat(existingBalance) === 0) {
            const initialBalance = getInitialBalance();
            localStorage.setItem(LOCAL_INIT_BALANCE_KEY, initialBalance);
            localStorage.setItem(LOCAL_BALANCE_KEY, initialBalance);
            console.log(`[SLOT] Установлен начальный баланс: ${initialBalance}`);
            
            // Обновляем баланс в игре, если она загружена
            updateGameBalance(initialBalance);
        } else {
            console.log(`[SLOT] Используется существующий баланс: ${existingBalance}`);
        }
    }
    
    /**
     * Обновление баланса в игре
     */
    function updateGameBalance(balance) {
        if (typeof window.s_oGame !== 'undefined' && window.s_oGame._oInterface) {
            window.s_oGame._iMoney = balance;
            window.s_oGame._oInterface.refreshMoney(balance);
            console.log(`[SLOT] Баланс в игре обновлен: ${balance}`);
        } else {
            console.log(`[SLOT] Игра еще не загружена, баланс будет обновлен позже`);
            
            // Пытаемся обновить позже, когда игра загрузится
            const checkGameLoaded = function() {
                if (typeof window.s_oGame !== 'undefined' && window.s_oGame._oInterface) {
                    window.s_oGame._iMoney = balance;
                    window.s_oGame._oInterface.refreshMoney(balance);
                    console.log(`[SLOT] Баланс в игре обновлен после загрузки: ${balance}`);
                } else {
                    setTimeout(checkGameLoaded, 500);
                }
            };
            
            setTimeout(checkGameLoaded, 500);
        }
    }
    
    /**
     * Обработчик сообщений от других окон/фреймов
     */
    function handleExternalMessages(event) {
        const data = event.data;
        
        // Проверяем, что это сообщение об обновлении настроек
        if (data.type !== 'GLOBAL_SETTINGS_UPDATE') {
            return;
        }
        
        console.log('[SLOT] Получено сообщение об обновлении настроек:', data);
        
        // Обработка обновлений
        const updateData = data.data;
        if (!updateData || !updateData.type) {
            return;
        }
        
        switch (updateData.type) {
            case 'initialBalance':
                // Обновляем начальный баланс
                localStorage.setItem(LOCAL_INIT_BALANCE_KEY, updateData.value);
                
                // Если текущий баланс равен начальному или равен нулю, обновляем его
                const currentBalance = parseFloat(localStorage.getItem(LOCAL_BALANCE_KEY)) || 0;
                const oldInitBalance = parseFloat(localStorage.getItem(LOCAL_INIT_BALANCE_KEY)) || 0;
                
                if (currentBalance === 0 || currentBalance === oldInitBalance) {
                    localStorage.setItem(LOCAL_BALANCE_KEY, updateData.value);
                    console.log(`[SLOT] Текущий баланс обновлен до нового начального: ${updateData.value}`);
                    
                    // Обновляем баланс в игре
                    updateGameBalance(updateData.value);
                }
                break;
                
            case 'promoCodes':
                // Обновляем промокоды
                localStorage.setItem(LOCAL_PROMOS_KEY, JSON.stringify(updateData.value));
                console.log(`[SLOT] Обновлены промокоды: ${updateData.value.length} шт.`);
                break;
                
            case 'thresholds':
                // Обновляем пороги выигрышей
                localStorage.setItem(LOCAL_THRESHOLDS_KEY, JSON.stringify(updateData.value));
                console.log(`[SLOT] Обновлены пороги выигрышей: ${updateData.value.length} шт.`);
                break;
        }
    }
    
    /**
     * Инициализация системы глобальных настроек
     */
    function initGlobalSettings() {
        // Получаем настройки и инициализируем баланс
        initializeSlotBalance();
        
        // Устанавливаем слушатель для обработки сообщений от других окон
        window.addEventListener('message', handleExternalMessages);
        
        // Проверяем наличие скрипта global-settings.js и подключаем его, если необходимо
        if (typeof window.globalSettings === 'undefined') {
            // Создаем скрипт
            const script = document.createElement('script');
            script.src = 'js/global-settings.js';
            script.async = true;
            
            // Добавляем обработчик загрузки
            script.onload = function() {
                console.log('[SLOT] Скрипт глобальных настроек загружен');
                if (window.globalSettings) {
                    window.globalSettings.init();
                }
            };
            
            // Добавляем скрипт на страницу
            document.head.appendChild(script);
        } else if (window.globalSettings) {
            window.globalSettings.init();
        }
        
        console.log('[SLOT] Система глобальных настроек инициализирована');
    }
    
    // Экспортируем публичные методы
    window.slotIntegration = {
        getInitialBalance: getInitialBalance,
        getPromoCodes: getPromoCodes,
        getThresholds: getThresholds,
        updateGameBalance: updateGameBalance
    };
    
    // Инициализируем систему при загрузке страницы
    document.addEventListener('DOMContentLoaded', initGlobalSettings);
    
    // Если DOM уже загружен, инициализируем сразу
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initGlobalSettings();
    }
})();
