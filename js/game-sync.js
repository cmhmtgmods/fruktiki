/**
 * Файл для интеграции в игру для синхронизации баланса между игрой и основным сайтом
 * Добавьте этот код в slot.html перед закрытием тега body
 */

(function() {
    // Слушатель для получения сообщений от родительского окна
    window.addEventListener('message', receiveMessageFromParent, false);
    
    // Функция для получения сообщений от родительского окна
    function receiveMessageFromParent(event) {
        // Более мягкая проверка источника (потенциально позволяет cross-origin сообщения)
        // Это может быть необходимо, если фрейм и страница находятся на разных доменах
        console.log('[SLOT] Received message from parent:', event.data);
        
        const data = event.data;
        
        if (typeof data !== 'object' || !data.type) {
            return; // Игнорируем сообщения неправильного формата
        }
        
        // Увеличиваем приоритет SET_BALANCE
        if (data.type === 'SET_BALANCE' && typeof data.balance === 'number') {
            console.log('[SLOT] Received SET_BALANCE command:', data.balance);
            
            // Более агрессивное применение баланса
            try {
                // Принудительно сохраняем в localStorage в любом случае
                localStorage.setItem('fruitParadiseBalance', data.balance);
                
                // Если игра уже инициализирована
                if (window.s_oGame) {
                    // Устанавливаем баланс напрямую
                    window.s_oGame._iMoney = data.balance;
                    
                    // Обновляем интерфейс если возможно
                    if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
                        window.s_oGame._oInterface.refreshMoney(data.balance);
                        console.log('[SLOT] Balance updated in game UI:', data.balance);
                    }
                    
                    // Создаем пользовательское событие для уведомления всех слушателей
                    const balanceEvent = new CustomEvent('game_balance_updated', { 
                        detail: { balance: data.balance } 
                    });
                    window.dispatchEvent(balanceEvent);
                    
                    return; // Early return on success
                } else {
                    // Если игра еще не загрузилась, сделаем повторную попытку через короткие промежутки
                    console.log('[SLOT] Game not loaded yet, scheduling update attempts');
                    [100, 300, 600, 1000].forEach(delay => {
                        setTimeout(() => {
                            if (window.s_oGame) {
                                window.s_oGame._iMoney = data.balance;
                                if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
                                    window.s_oGame._oInterface.refreshMoney(data.balance);
                                    console.log('[SLOT] Delayed balance update successful:', data.balance);
                                }
                            }
                        }, delay);
                    });
                    
                    // Подпишемся на событие загрузки игры, если оно еще не произошло
                    if (window.s_oMain) {
                        $(window.s_oMain).one("start_session", function() {
                            setTimeout(() => {
                                if (window.s_oGame) {
                                    window.s_oGame._iMoney = data.balance;
                                    if (window.s_oGame._oInterface) {
                                        window.s_oGame._oInterface.refreshMoney(data.balance);
                                        console.log('[SLOT] Post-load balance update successful:', data.balance);
                                    }
                                }
                            }, 500);
                        });
                    }
                }
            } catch (e) {
                console.error('[SLOT] Error updating game balance:', e);
            }
        } else if (data.type === 'UPDATE_BALANCE') {
            // Доверяем родительскому окну, обновляем наш баланс
            if (typeof data.balance === 'number') {
                localStorage.setItem('fruitParadiseBalance', data.balance);
                if (window.s_oGame) {
                    window.s_oGame._iMoney = data.balance;
                    if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
                        window.s_oGame._oInterface.refreshMoney(data.balance);
                    }
                }
            }
        } else if (data.type === 'GAME_STARTED') {
            // Отвечаем, что мы получили сообщение о старте
            if (window.parent) {
                window.parent.postMessage({
                    type: 'GAME_READY',
                    ready: true
                }, '*');
                
                // Читаем текущий баланс
                const currentBalance = parseFloat(localStorage.getItem('fruitParadiseBalance')) || 0;
                console.log('[SLOT] Game started, current balance:', currentBalance);
                
                // Если игра уже загружена, сразу применяем баланс
                if (window.s_oGame) {
                    window.s_oGame._iMoney = currentBalance;
                    if (window.s_oGame._oInterface && typeof window.s_oGame._oInterface.refreshMoney === 'function') {
                        window.s_oGame._oInterface.refreshMoney(currentBalance);
                    }
                }
            }
        }
    }

    // Модифицированная функция для переопределения функций обновления денег в игре 
function overrideMoneyUpdateFunctions() { 
    // Проверяем, загружена ли игра и есть ли доступ к её интерфейсу 
    if (!window.s_oGame || !window.s_oGame._oInterface) { 
        // Если игра ещё не загружена, пробуем через секунду 
        setTimeout(overrideMoneyUpdateFunctions, 1000); 
        return; 
    } 
    
    try { 
        console.log('[SLOT] Overriding money update functions...'); 
        
        // Сохраняем оригинальную функцию обновления денег 
        const originalRefreshMoney = window.s_oGame._oInterface.refreshMoney; 
        
        // Переопределяем функцию обновления денег 
        window.s_oGame._oInterface.refreshMoney = function(iMoney) { 
            // Вызываем оригинальную функцию 
            originalRefreshMoney.call(this, iMoney); 
            
            // Отправляем обновленный баланс в родительское окно, но только если он изменился 
            if (iMoney !== lastSentBalance) { 
                lastSentBalance = iMoney; 
                
                // Сохраняем значение в localStorage 
                localStorage.setItem('fruitParadiseBalance', iMoney); 
                
                // Отправляем сообщение в родительское окно 
                sendMessageToParent({ 
                    type: 'UPDATE_BALANCE', 
                    balance: iMoney 
                }); 
                
                console.log('[SLOT] Money refreshed:', iMoney);
            }
        };
        
        // Переопределяем функцию обработки выигрыша
        if (window.s_oGame._endReelAnimation) {
            const originalEndReelAnimation = window.s_oGame._endReelAnimation;
            
            window.s_oGame._endReelAnimation = function() {
                // Вызываем оригинальную функцию
                originalEndReelAnimation.call(this);
                
                // Если был выигрыш, отправляем обновленный баланс
                if (this._iTotWin > 0) {
                    setTimeout(() => {
                        const currentBalance = this._iMoney;
                        
                        // Проверяем, изменился ли баланс с момента последней отправки
                        if (currentBalance !== lastSentBalance) {
                            localStorage.setItem('fruitParadiseBalance', currentBalance);
                            
                            sendMessageToParent({
                                type: 'UPDATE_BALANCE',
                                balance: currentBalance
                            });
                            
                            lastSentBalance = currentBalance;
                            console.log('[SLOT] Win processed, new balance:', currentBalance);
                        }
                    }, 500);
                }
            };
        }
        
        // НОВОЕ: Переопределяем функцию вращения барабанов
        if (window.s_oGame && window.s_oGame.onSpin) {
            const originalOnSpin = window.s_oGame.onSpin;
            
            window.s_oGame.onSpin = function() {
                // Call original function
                originalOnSpin.call(this);
                
                // Send spin event to parent
                setTimeout(() => {
                    sendMessageToParent({
                        type: 'UPDATE_BALANCE',
                        balance: this._iMoney,
                        spinMade: true  // Add this flag to indicate a spin was made
                    });
                    
                    console.log('[SLOT] Spin tracked and reported to parent');
                }, 200);
            };
            
            console.log('[SLOT] Spin tracking initialized');
        }
        
        // Устанавливаем начальный баланс из localStorage при загрузке игры
        const storedBalance = parseFloat(localStorage.getItem('fruitParadiseBalance'));
        if (!isNaN(storedBalance) && storedBalance !== window.s_oGame._iMoney) {
            console.log(`[SLOT] Applying stored balance: ${storedBalance} (current: ${window.s_oGame._iMoney})`);
            window.s_oGame._iMoney = storedBalance;
            window.s_oGame._oInterface.refreshMoney(storedBalance);
            lastSentBalance = storedBalance;
        }
        
        // Отправляем сообщение о текущем балансе в родительское окно
        sendMessageToParent({
            type: 'UPDATE_BALANCE',
            balance: window.s_oGame._iMoney
        });
        lastSentBalance = window.s_oGame._iMoney;
        
        console.log('[SLOT] Game sync successfully initialized');
        
    } catch (e) {
        console.error('Failed to override money functions:', e);
        // Пробуем ещё раз через некоторое время
        setTimeout(overrideMoneyUpdateFunctions, 2000);
    }
}
    
    // Функция для отправки сообщения в родительское окно
    function sendMessageToParent(message) {
        window.parent.postMessage(message, '*');
    }
    
    // Переопределяем функцию обновления денег в игре для синхронизации с сайтом
    function overrideMoneyUpdateFunctions() {
        // Проверяем, загружена ли игра и есть ли доступ к её интерфейсу
        if (!window.s_oGame || !window.s_oInterface) {
            // Если игра ещё не загружена, пробуем через секунду
            setTimeout(overrideMoneyUpdateFunctions, 1000);
            return;
        }
        
        try {
            // Сохраняем оригинальную функцию
            const originalRefreshMoney = window.s_oInterface.refreshMoney;
            
            // Переопределяем функцию
            window.s_oInterface.refreshMoney = function(iMoney) {
                // Вызываем оригинальную функцию
                originalRefreshMoney.call(this, iMoney);
                
                // Отправляем обновленный баланс в родительское окно
                sendMessageToParent({
                    type: 'UPDATE_BALANCE',
                    balance: iMoney
                });
            };
            
            // Также переопределим функцию обработки выигрыша
            const originalEndReelAnimation = window.s_oGame._endReelAnimation;
            
            window.s_oGame._endReelAnimation = function() {
                // Вызываем оригинальную функцию
                originalEndReelAnimation.call(this);
                
                // Если был выигрыш, отправляем обновленный баланс
                if (this._iTotWin > 0) {
                    setTimeout(() => {
                        sendMessageToParent({
                            type: 'UPDATE_BALANCE',
                            balance: this._iMoney
                        });
                    }, 500);
                }
            };
            
            // Начальная синхронизация
            sendMessageToParent({
                type: 'UPDATE_BALANCE',
                balance: window.s_oGame._iMoney
            });
            
            console.log('Game balance sync successfully initialized');
        } catch (e) {
            console.error('Failed to override money functions:', e);
            // Пробуем ещё раз через некоторое время
            setTimeout(overrideMoneyUpdateFunctions, 2000);
        }
    }
    
    // Инициализация при загрузке игры
    function initGameSync() {
        // Проверяем наличие игры в window
        if (typeof window.s_oMain === 'undefined') {
            // Пробуем ещё раз через некоторое время
            setTimeout(initGameSync, 500);
            return;
        }
        
        // Отслеживаем событие начала игры
        $(window.s_oMain).on("start_session", function() {
            overrideMoneyUpdateFunctions();
        });
        
        // Также пробуем переопределить функции сразу, на случай если событие уже сработало
        setTimeout(overrideMoneyUpdateFunctions, 1000);
    }
    
    // Запускаем инициализацию
    window.addEventListener('DOMContentLoaded', initGameSync);
    
    // Также запускаем инициализацию при загрузке всей страницы, для надежности
    window.addEventListener('load', initGameSync);
})();