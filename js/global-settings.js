/**
 * Обработчик глобальных настроек для Fruit Paradise Slot
 * 
 * Этот скрипт обеспечивает централизованное управление настройками на всем сайте,
 * позволяет обмениваться настройками между админ-панелью и игровым слотом.
 */

// Создаем самовыполняющуюся функцию для изоляции переменных
(function() {
    // Константы для имен cookie/storage
    const GLOBAL_COOKIE_PREFIX = 'fruitParadiseGlobal_';
    const INITIAL_BALANCE_KEY = GLOBAL_COOKIE_PREFIX + 'initialBalance';
    const PROMO_CODES_KEY = GLOBAL_COOKIE_PREFIX + 'promoCodes';
    const THRESHOLDS_KEY = GLOBAL_COOKIE_PREFIX + 'thresholds';
    
    // Значения по умолчанию
    const DEFAULT_INITIAL_BALANCE = 20; // Изменено со 100 на 20, как вы хотели
    const DEFAULT_PROMO_CODES = [
        { code: 'FRUIT10', amount: 10, maxActivations: 100 },
        { code: 'WELCOME20', amount: 20, maxActivations: 100 },
        { code: 'PARADISE50', amount: 50, maxActivations: 50 }
    ];
    const DEFAULT_THRESHOLDS = [
        { amount: 30, redirectUrl: "/claim" },
        { amount: 50, redirectUrl: "/claim-big" },
        { amount: 100, redirectUrl: "/claim-jackpot" }
    ];
    
    /**
     * Установка cookie, которая будет доступна всем пользователям на сайте
     */
    function setCookie(name, value, days = 365) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + ";" + expires + ";path=/;SameSite=Lax";
        console.log(`[Глобальные настройки] Установлен cookie ${name} со значением:`, value);
    }
    
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
                    console.error(`[Глобальные настройки] Ошибка при парсинге cookie ${name}:`, e);
                    return null;
                }
            }
        }
        return null;
    }
    
    /**
     * Создание скрытого iframe для доступа к глобальным настройкам
     * Это нужно для доступа к данным cookie из других доменов
     */
    function createSettingsFrame() {
        const frameName = 'globalSettingsFrame';
        
        // Проверяем, существует ли уже фрейм
        if (document.getElementById(frameName)) {
            return;
        }
        
        // Создаем iframe
        const iframe = document.createElement('iframe');
        iframe.id = frameName;
        iframe.name = frameName;
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
        
        document.body.appendChild(iframe);
        
        console.log('[Глобальные настройки] Создан скрытый фрейм для глобальных настроек');
        
        return iframe;
    }
    
    /**
     * Получение глобального значения начального баланса
     */
    function getInitialBalance() {
        const cookieValue = getCookie(INITIAL_BALANCE_KEY);
        
        if (cookieValue !== null && !isNaN(parseFloat(cookieValue))) {
            return parseFloat(cookieValue);
        }
        
        // Если cookie не найден, устанавливаем значение по умолчанию
        setInitialBalance(DEFAULT_INITIAL_BALANCE);
        return DEFAULT_INITIAL_BALANCE;
    }
    
    /**
     * Установка глобального значения начального баланса
     */
    function setInitialBalance(value) {
        if (isNaN(parseFloat(value))) {
            console.error('[Глобальные настройки] Неверное значение для начального баланса:', value);
            return false;
        }
        
        setCookie(INITIAL_BALANCE_KEY, value);
        broadcastSettingsUpdate({ type: 'initialBalance', value: value });
        
        // Также обновляем localStorage для обратной совместимости
        localStorage.setItem('fruitParadiseInitBalance', value);
        
        return true;
    }
    
    /**
     * Получение глобальных промокодов
     */
    function getPromoCodes() {
        const cookieValue = getCookie(PROMO_CODES_KEY);
        
        if (cookieValue !== null && Array.isArray(cookieValue)) {
            return cookieValue;
        }
        
        // Если cookie не найден, устанавливаем значение по умолчанию
        setPromoCodes(DEFAULT_PROMO_CODES);
        return DEFAULT_PROMO_CODES;
    }
    
    /**
     * Установка глобальных промокодов
     */
    function setPromoCodes(codes) {
        if (!Array.isArray(codes)) {
            console.error('[Глобальные настройки] Неверное значение для промокодов:', codes);
            return false;
        }
        
        setCookie(PROMO_CODES_KEY, codes);
        broadcastSettingsUpdate({ type: 'promoCodes', value: codes });
        
        // Также обновляем localStorage для обратной совместимости
        localStorage.setItem('fruitParadisePromoCodes', JSON.stringify(codes));
        
        return true;
    }
    
    /**
     * Получение глобальных порогов выигрышей
     */
    function getThresholds() {
        const cookieValue = getCookie(THRESHOLDS_KEY);
        
        if (cookieValue !== null && Array.isArray(cookieValue)) {
            return cookieValue;
        }
        
        // Если cookie не найден, устанавливаем значение по умолчанию
        setThresholds(DEFAULT_THRESHOLDS);
        return DEFAULT_THRESHOLDS;
    }
    
    /**
     * Установка глобальных порогов выигрышей
     */
    function setThresholds(thresholds) {
        if (!Array.isArray(thresholds)) {
            console.error('[Глобальные настройки] Неверное значение для порогов выигрышей:', thresholds);
            return false;
        }
        
        setCookie(THRESHOLDS_KEY, thresholds);
        broadcastSettingsUpdate({ type: 'thresholds', value: thresholds });
        
        // Также обновляем localStorage для обратной совместимости
        localStorage.setItem('fruitParadiseThresholds', JSON.stringify(thresholds));
        
        return true;
    }
    
    /**
     * Отправка сообщения о обновлении настроек всем фреймам и окнам
     */
    function broadcastSettingsUpdate(message) {
        // Отправляем сообщение всем фреймам
        if (window.frames && window.frames.length > 0) {
            for (let i = 0; i < window.frames.length; i++) {
                try {
                    window.frames[i].postMessage({
                        type: 'GLOBAL_SETTINGS_UPDATE',
                        data: message
                    }, '*');
                } catch (e) {
                    console.warn('[Глобальные настройки] Не удалось отправить сообщение фрейму:', e);
                }
            }
        }
        
        // Отправляем сообщение родительскому окну
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage({
                    type: 'GLOBAL_SETTINGS_UPDATE',
                    data: message
                }, '*');
            } catch (e) {
                console.warn('[Глобальные настройки] Не удалось отправить сообщение родительскому окну:', e);
            }
        }
        
        console.log('[Глобальные настройки] Отправлено сообщение об обновлении настроек:', message);
    }
    
    /**
     * Обработчик сообщений от других фреймов или окон
     */
    function handleSettingsMessage(event) {
        const data = event.data;
        
        // Проверяем, что это сообщение об обновлении настроек
        if (data.type !== 'GLOBAL_SETTINGS_UPDATE') {
            return;
        }
        
        console.log('[Глобальные настройки] Получено сообщение об обновлении настроек:', data);
        
        // Обработка обновлений
        const updateData = data.data;
        if (!updateData || !updateData.type) {
            return;
        }
        
        switch (updateData.type) {
            case 'initialBalance':
                // Обновляем начальный баланс в localStorage для обратной совместимости
                localStorage.setItem('fruitParadiseInitBalance', updateData.value);
                
                // Если это слот, то обновляем текущий баланс, если он не был изменен
                if (typeof window.s_oGame !== 'undefined' && window.location.href.includes('slot.html')) {
                    // Проверяем, был ли изменен баланс с момента его инициализации
                    const currentBalance = parseFloat(localStorage.getItem('fruitParadiseBalance')) || 0;
                    const initBalance = parseFloat(localStorage.getItem('fruitParadiseInitBalance')) || 0;
                    
                    // Если баланс не менялся, устанавливаем новое значение
                    if (currentBalance === 0 || currentBalance === initBalance) {
                        localStorage.setItem('fruitParadiseBalance', updateData.value);
                        console.log('[Глобальные настройки] Обновлен текущий баланс слота:', updateData.value);
                        
                        // Обновляем баланс в игре, если она загружена
                        if (window.s_oGame && window.s_oGame._oInterface) {
                            window.s_oGame._iMoney = updateData.value;
                            window.s_oGame._oInterface.refreshMoney(updateData.value);
                        }
                    }
                }
                break;
                
            case 'promoCodes':
                // Обновляем промокоды в localStorage для обратной совместимости
                localStorage.setItem('fruitParadisePromoCodes', JSON.stringify(updateData.value));
                break;
                
            case 'thresholds':
                // Обновляем пороги в localStorage для обратной совместимости
                localStorage.setItem('fruitParadiseThresholds', JSON.stringify(updateData.value));
                break;
                
            default:
                console.warn('[Глобальные настройки] Неизвестный тип обновления настроек:', updateData.type);
        }
    }
    
    /**
     * Инициализация системы глобальных настроек
     */
    function initGlobalSettings() {
        // Создаем скрытый iframe для доступа к глобальным настройкам
        createSettingsFrame();
        
        // Устанавливаем обработчик сообщений
        window.addEventListener('message', handleSettingsMessage);
        
        // Инициализируем значения, если они еще не установлены
        getInitialBalance();
        getPromoCodes();
        getThresholds();
        
        console.log('[Глобальные настройки] Система глобальных настроек инициализирована');
    }
    
    // Экспортируем публичные методы
    window.globalSettings = {
        init: initGlobalSettings,
        getInitialBalance: getInitialBalance,
        setInitialBalance: setInitialBalance,
        getPromoCodes: getPromoCodes,
        setPromoCodes: setPromoCodes,
        getThresholds: getThresholds,
        setThresholds: setThresholds
    };
    
    // Инициализируем при загрузке страницы
    document.addEventListener('DOMContentLoaded', initGlobalSettings);
    
    // Если DOM уже загружен, инициализируем сразу
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initGlobalSettings();
    }
})();