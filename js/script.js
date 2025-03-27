// Конфигурация локализации и валют

const CONFIG = {
    // Поддерживаемые страны и соответствующие языки/валюты
    countries: {
        'US': { lang: 'en', currency: '$', currency_name: 'USD' },
        'CA': { lang: 'en', currency: 'C$', currency_name: 'CAD' },
        'AU': { lang: 'en', currency: 'A$', currency_name: 'AUD' },
        'DE': { lang: 'de', currency: '€', currency_name: 'EUR' },
        'FR': { lang: 'fr', currency: '€', currency_name: 'EUR' },
        'GB': { lang: 'en', currency: '£', currency_name: 'GBP' },
        'AE': { lang: 'ar', currency: 'AED', currency_name: 'AED' },
        'CH': { lang: 'en', currency: 'CHF', currency_name: 'CHF' }
    },

    
    // Языковые ресурсы
    localization: {
        'en': {
            'free_spins': 'GET 500 FREE SPINS',
            'balance_label': 'Balance:',
    'claim_winnings': 'CLAIM WINNINGS',
    'promo_placeholder': 'Enter promo code',
    'activate_promo': 'Activate',
    'win_congratulations': 'CONGRATULATIONS!',
    'win_amount_label': 'Your winnings:',
    'win_message': 'You can claim your prize by clicking the button below',
    'win_claim_button': 'CLAIM WINNINGS',
            'balance_label': 'Balance:',
'claim_winnings': 'CLAIM WINNINGS',
'promo_placeholder': 'Enter promo code',
'activate_promo': 'Activate',
            'win_congratulations': 'CONGRATULATIONS!',
            'win_amount_label': 'Your winnings:',
            'win_message': 'You can claim your prize by clicking the button below',
            'win_claim_button': 'CLAIM WINNINGS',
            // Меню и общие элементы
            'menu_home': 'Home',
            'menu_slots': 'Slots',
            'menu_info': 'Info',
            'play': 'Play',
            'loading': 'Loading...',
            // Секция героя
            'hero_title': 'Cozy Fruit Slots',
            'hero_subtitle': 'Pleasant atmosphere and bright winnings',
            'start_game': 'Start Game',
            // Название секции игры
            'fruit_slots': 'Fruit Slots',
            // Секция особенностей
            'game_features': 'Game Features',
            'feature1_title': 'Fruit Theme',
            'feature1_desc': 'Classic fruit slot in modern execution',
            'feature2_title': 'Big Wins',
            'feature2_desc': 'Multiple combinations and special symbols for big prizes',
            'feature3_title': 'Play Anywhere',
            'feature3_desc': 'Full support for mobile devices and tablets',
            // Футер
            'rights_reserved': 'All rights reserved.',
            'age_restriction': 'The game is intended for people over 18 years old.',
            // Панель переключения языка (временная)
            'language_selector': 'Language:',
            'country_selector': 'Country:'
        },
        'de': {
            'free_spins': '500 FREISPIELE ERHALTEN',
            'balance_label': 'Guthaben:',
            'claim_winnings': 'GEWINN ABHOLEN',
            'promo_placeholder': 'Promocode eingeben',
            'activate_promo': 'Aktivieren',
            'win_congratulations': 'GLÜCKWUNSCH!',
            'win_amount_label': 'Ihr Gewinn:',
            'win_message': 'Sie können Ihren Gewinn einfordern, indem Sie auf die Schaltfläche unten klicken',
            'win_claim_button': 'GEWINN ABHOLEN',
            'balance_label': 'Guthaben:',
'claim_winnings': 'GEWINN ABHOLEN',
'promo_placeholder': 'Promocode eingeben',
'activate_promo': 'Aktivieren',
            'win_congratulations': 'GLÜCKWUNSCH!',
'win_amount_label': 'Ihr Gewinn:',
'win_message': 'Sie können Ihren Gewinn einfordern, indem Sie auf die Schaltfläche unten klicken',
'win_claim_button': 'GEWINN ABHOLEN',
            // Меню и общие элементы
            'menu_home': 'Startseite',
            'menu_slots': 'Spielautomaten',
            'menu_info': 'Information',
            'play': 'Spielen',
            'loading': 'Wird geladen...',
            // Секция героя
            'hero_title': 'Gemütliche Frucht-Spielautomaten',
            'hero_subtitle': 'Angenehme Atmosphäre und strahlende Gewinne',
            'start_game': 'Spiel starten',
            // Название секции игры
            'fruit_slots': 'Frucht-Spielautomaten',
            // Секция особенностей
            'game_features': 'Spielfunktionen',
            'feature1_title': 'Frucht-Thema',
            'feature1_desc': 'Klassischer Fruchtautomat in moderner Ausführung',
            'feature2_title': 'Große Gewinne',
            'feature2_desc': 'Mehrere Kombinationen und spezielle Symbole für große Preise',
            'feature3_title': 'Überall spielen',
            'feature3_desc': 'Volle Unterstützung für Mobilgeräte und Tablets',
            // Футер
            'rights_reserved': 'Alle Rechte vorbehalten.',
            'age_restriction': 'Das Spiel ist für Personen über 18 Jahre bestimmt.',
            // Панель переключения языка (временная)
            'language_selector': 'Sprache:',
            'country_selector': 'Land:'
        },
        'fr': {
            'free_spins': 'OBTENEZ 500 TOURS GRATUITS',
            'balance_label': 'Solde:',
            'claim_winnings': 'RÉCLAMER LES GAINS',
            'promo_placeholder': 'Entrez le code promo',
            'activate_promo': 'Activer',
            'win_congratulations': 'FÉLICITATIONS!',
            'win_amount_label': 'Vos gains:',
            'win_message': 'Vous pouvez réclamer votre prix en cliquant sur le bouton ci-dessous',
            'win_claim_button': 'RÉCLAMER LES GAINS',
            'balance_label': 'Solde:',
'claim_winnings': 'RÉCLAMER LES GAINS',
'promo_placeholder': 'Entrez le code promo',
'activate_promo': 'Activer',

            'win_congratulations': 'FÉLICITATIONS!',
'win_amount_label': 'Vos gains:',
'win_message': 'Vous pouvez réclamer votre prix en cliquant sur le bouton ci-dessous',
'win_claim_button': 'RÉCLAMER LES GAINS',
            // Меню и общие элементы
            'menu_home': 'Accueil',
            'menu_slots': 'Machines à sous',
            'menu_info': 'Informations',
            'play': 'Jouer',
            'loading': 'Chargement...',
            // Секция героя
            'hero_title': 'Machines à sous aux fruits confortables',
            'hero_subtitle': 'Atmosphère agréable et gains brillants',
            'start_game': 'Commencer le jeu',
            // Название секции игры
            'fruit_slots': 'Machines à sous aux fruits',
            // Секция особенностей
            'game_features': 'Caractéristiques du jeu',
            'feature1_title': 'Thème fruité',
            'feature1_desc': 'Machine à sous fruitée classique en exécution moderne',
            'feature2_title': 'Gros gains',
            'feature2_desc': 'Multiples combinaisons et symboles spéciaux pour de gros prix',
            'feature3_title': 'Jouez n\'importe où',
            'feature3_desc': 'Prise en charge complète des appareils mobiles et des tablettes',
            // Футер
            'rights_reserved': 'Tous droits réservés.',
            'age_restriction': 'Le jeu est destiné aux personnes de plus de 18 ans.',
            // Панель переключения языка (временная)
            'language_selector': 'Langue:',
            'country_selector': 'Pays:'
        },
        'ar': {
            'free_spins': 'احصل على 500 لفة مجانية',
            'balance_label': 'الرصيد:',
            'claim_winnings': 'استلام المكسب',
            'promo_placeholder': 'أدخل رمز العرض الترويجي',
            'activate_promo': 'تفعيل',
            'win_congratulations': 'تهانينا!',
            'win_amount_label': 'مكسبك:',
            'win_message': 'يمكنك المطالبة بجائزتك بالنقر على الزر أدناه',
            'win_claim_button': 'استلام المكسب',
            'balance_label': 'الرصيد:',
'claim_winnings': 'استلام المكسب',
'promo_placeholder': 'أدخل رمز العرض الترويجي',
'activate_promo': 'تفعيل',
            'win_congratulations': 'تهانينا!',
'win_amount_label': 'مكسبك:',
'win_message': 'يمكنك المطالبة بجائزتك بالنقر على الزر أدناه',
'win_claim_button': 'استلام المكسب',
            // Меню и общие элементы - обратите внимание на то, что текст на арабском отображается справа налево
            'menu_home': 'الرئيسية',
            'menu_slots': 'آلات القمار',
            'menu_info': 'معلومات',
            'play': 'العب',
            'loading': 'جاري التحميل...',
            // Секция героя
            'hero_title': 'آلات الفواكه المريحة',
            'hero_subtitle': 'أجواء ممتعة ومكاسب مثيرة',
            'start_game': 'ابدأ اللعبة',
            // Название секции игры
            'fruit_slots': 'آلات الفواكه',
            // Секция особенностей
            'game_features': 'ميزات اللعبة',
            'feature1_title': 'موضوع الفواكه',
            'feature1_desc': 'آلة فواكه كلاسيكية بتنفيذ حديث',
            'feature2_title': 'مكاسب كبيرة',
            'feature2_desc': 'مجموعات متعددة ورموز خاصة للجوائز الكبيرة',
            'feature3_title': 'العب في أي مكان',
            'feature3_desc': 'دعم كامل للأجهزة المحمولة والأجهزة اللوحية',
            // Футер
            'rights_reserved': 'جميع الحقوق محفوظة.',
            'age_restriction': 'اللعبة مخصصة للأشخاص الذين تزيد أعمارهم عن 18 عامًا.',
            // Панель переключения языка (временная)
            'language_selector': 'اللغة:',
            'country_selector': 'البلد:'
        }
    },
    // Сопоставление валют с конфигурациями слота
    slotConfig: {
        '$': { symbol: '$', position: 'prefix' },
        'C$': { symbol: 'C$', position: 'prefix' },
        'A$': { symbol: 'A$', position: 'prefix' },
        '€': { symbol: '€', position: 'suffix' },
        '£': { symbol: '£', position: 'prefix' },
        'AED': { symbol: 'AED', position: 'suffix' },
        'CHF': { symbol: 'CHF', position: 'suffix' }
    },
    // Значения по умолчанию
    default: {
        country: 'US',
        lang: 'en',
        currency: '$',
        currency_name: 'USD'
    }
};

// Класс для управления локализацией
class LocalizationManager {
    constructor(config) {
        this.config = config;
        this.currentCountry = null;
        this.currentLanguage = null;
        this.currentCurrency = null;
    }

    // Определение местоположения пользователя с помощью API
   async detectUserLocation() {
    return new Promise((resolve) => {
        try {
            // Создаем функцию для обработки JSONP-ответа
            window.ipCallbackFunction = (data) => {
                const countryCode = data.country_code;
                console.log("Определена страна (JSONP):", countryCode);
                
                // Проверяем, поддерживается ли страна
                if (this.config.countries[countryCode]) {
                    resolve(countryCode);
                } else {
                    console.log("Страна не поддерживается, используем значение по умолчанию");
                    resolve(this.config.default.country);
                }
                
                // Очищаем глобальную функцию
                delete window.ipCallbackFunction;
            };
            
            // Устанавливаем таймаут для резервного решения
            const timeoutId = setTimeout(() => {
                console.error("Таймаут при определении местоположения");
                delete window.ipCallbackFunction;
                resolve(this.config.default.country);
            }, 5000);
            
            // Создаем и добавляем скрипт для JSONP-запроса
            const script = document.createElement('script');
            script.src = 'https://ipapi.co/jsonp/?callback=ipCallbackFunction';
            
            // Обработчик успешной загрузки
            script.onload = () => clearTimeout(timeoutId);
            
            // Обработчик ошибки
            script.onerror = () => {
                console.error("Ошибка загрузки JSONP-скрипта");
                clearTimeout(timeoutId);
                resolve(this.config.default.country);
            };
            
            // Добавляем скрипт на страницу
            document.body.appendChild(script);
            
        } catch (error) {
            console.error("Произошла ошибка:", error);
            resolve(this.config.default.country);
        }
    });
}
    // Установка локали на основе кода страны
    setLocale(countryCode) {
        // Получаем настройки для страны
        const countrySettings = this.config.countries[countryCode] || this.config.default;
        
        this.currentCountry = countryCode;
        this.currentLanguage = countrySettings.lang;
        this.currentCurrency = countrySettings.currency;
        
        console.log(`Setting locale: Country=${countryCode}, Language=${this.currentLanguage}, Currency=${this.currentCurrency}`);
        
        // Применяем локализацию к странице
        this.applyLocalization();
        localStorage.setItem('selectedCountry', countryCode);
        if (window.currencyHandler) {
            // Устанавливаем правильную валюту на основе выбранной страны
            const countrySettings = this.config.countries[countryCode];
            if (countrySettings) {
                window.currencyHandler.userCurrency = countrySettings.currency_name;
                window.currencyHandler.currencySymbol = countrySettings.currency;
                
                // Сохраняем в localStorage
                localStorage.setItem('fruitParadiseCurrency', countrySettings.currency_name);
                
                // Обновляем отображение
                window.currencyHandler.updateCurrencyDisplay();
                console.log("[DEBUG] Forced currency update to:", countrySettings.currency_name);
            }
        }
        // Устанавливаем направление текста для арабского языка
        if (this.currentLanguage === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl-layout');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl-layout');
        }
        
        // Настраиваем iframe для игры
        this.configureGameFrame();
        
        // Обновляем языковой селектор (временно)
        this.updateLanguageSelector();
        
        return {
            country: countryCode,
            language: this.currentLanguage,
            currency: this.currentCurrency
        };
    }

    // Применение локализации к элементам страницы
    applyLocalization() {
        const translations = this.config.localization[this.currentLanguage];
        if (!translations) {
            console.error(`No translations found for language: ${this.currentLanguage}`);
            return;
        }
        
        // Выбираем все элементы с атрибутом data-locale-key
        const elements = document.querySelectorAll('[data-locale-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-locale-key');
            if (translations[key]) {
                // Для элементов ввода устанавливаем значение, для остальных textContent
                if (element.tagName === 'INPUT') {
                    if (element.hasAttribute('placeholder')) {
                        element.placeholder = translations[key];
                    } else {
                        element.value = translations[key];
                    }
                } else {
                    element.textContent = translations[key];
                }
            } else {
                console.warn(`No translation found for key: ${key}`);
            }
        });
    }

    // Конфигурирование iframe со слотом
    configureGameFrame() {
        const gameFrame = document.getElementById('game-frame');
        if (!gameFrame) {
            console.error("Game frame not found");
            return;
        }
        
        // Обновляем src с параметрами для передачи данных в слот
        const baseUrl = gameFrame.src.split('?')[0];
        const url = `${baseUrl}?country=${this.currentCountry}&lang=${this.currentLanguage}&currency=${encodeURIComponent(this.currentCurrency)}`;
        
        console.log("Setting game frame URL:", url);
        
        // Сохраняем настройки в localStorage для внутренней коммуникации
        localStorage.setItem('fruitParadiseLocale', JSON.stringify({
            country: this.currentCountry,
            lang: this.currentLanguage,
            currency: this.currentCurrency
        }));
        
        // Обновляем iframe только если URL изменился
        if (gameFrame.src !== url) {
            gameFrame.src = url;
        }
    }
    
    // Создание и обновление временного селектора языка (для тестирования)
    createLanguageSelector() {
        // Проверяем, существует ли уже селектор
        if (document.getElementById('temp-language-selector')) {
            return;
        }
        
        // Создаем контейнер для селектора
        const selectorContainer = document.createElement('div');
        selectorContainer.id = 'temp-language-selector';
        selectorContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: transparent;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-family: Arial, sans-serif;
        `;
        
        // Заголовок
        const title = document.createElement('div');
        title.textContent = 'Language Test Panel';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ccc;
        `;
        selectorContainer.appendChild(title);
        
        // Селектор страны
        const countryLabel = document.createElement('label');
        countryLabel.innerHTML = this.config.localization[this.currentLanguage].country_selector || 'Country:';
        countryLabel.style.marginRight = '5px';
        selectorContainer.appendChild(countryLabel);
        
        const countrySelect = document.createElement('select');
        countrySelect.id = 'country-select';
        countrySelect.style.cssText = `
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ccc;
            margin-bottom: 10px;
            width: 100%;
        `;
        
        // Добавляем опции стран
        Object.keys(this.config.countries).forEach(countryCode => {
            const option = document.createElement('option');
            option.value = countryCode;
            option.textContent = `${countryCode} (${this.config.countries[countryCode].lang.toUpperCase()}, ${this.config.countries[countryCode].currency})`;
            countrySelect.appendChild(option);
        });
        
        // Устанавливаем текущую страну
        countrySelect.value = this.currentCountry;
        
        // Обработчик изменения страны
        countrySelect.addEventListener('change', () => {
            this.setLocale(countrySelect.value);
        });
        
        selectorContainer.appendChild(countrySelect);
        
        // Кнопка закрытия
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            padding: 5px 10px;
            border-radius: 4px;
            border: none;
            background-color: #f44336;
            color: white;
            cursor: pointer;
            margin-top: 10px;
        `;
        closeButton.addEventListener('click', () => {
            document.body.removeChild(selectorContainer);
        });
        selectorContainer.appendChild(closeButton);
        
        // Добавляем селектор на страницу
        document.body.appendChild(selectorContainer);
    }
    
    // Обновление значений в селекторе языка
    updateLanguageSelector() {
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = this.currentCountry;
        }
    }
}

// Функция для создания и анимирования плавающих фруктов
function createFruitElements() {
    const fruits = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍒', '🍓', '🥝', '🍍'];
    const container = document.querySelector('.hero-section');
    
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const fruit = document.createElement('span');
        fruit.textContent = fruits[Math.floor(Math.random() * fruits.length)];
        fruit.classList.add('floating-fruit');
        fruit.style.left = `${Math.random() * 100}%`;
        fruit.style.animationDelay = `${Math.random() * 5}s`;
        fruit.style.fontSize = `${Math.random() * 20 + 20}px`;
        fruit.style.opacity = '0.2';
        container.appendChild(fruit);
    }
    
    // Добавляем стиль для плавающих фруктов
    const fruitStyle = document.createElement('style');
    fruitStyle.innerHTML = `
        .floating-fruit {
            position: absolute;
            z-index: 0;
            animation: floatFruit 15s linear infinite;
        }
        
        @keyframes floatFruit {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            50% {
                opacity: 0.2;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(fruitStyle);
}

// Обработчик бургер-меню
function setupBurgerMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!burgerMenu || !navMenu) return;
    
    // Функция для переключения мобильного меню
    function toggleMenu() {
        burgerMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
    
    // Обработчик клика по бургер-меню
    burgerMenu.addEventListener('click', toggleMenu);
    
    // Закрываем меню при клике на ссылку навигации
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

// Настройка плавной прокрутки
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Учитываем высоту фиксированного хедера при прокрутке
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Updated setupPlayButtons function
function setupPlayButtons() {
    // Select both the play-now-button and signup-bonus-btn
    const playButtons = document.querySelectorAll('.play-now-button, .signup-bonus-btn');
    const gameSection = document.getElementById('game');
    
    if (!gameSection) return;
    
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            gameSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// This function will be called when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure to call setupPlayButtons after the document is loaded
    setupPlayButtons();
});
// Изменение стиля хедера при скролле
function setupHeaderScrollEffect() {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    function scrollHeader() {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            header.style.padding = '10px 0';
        } else {
            header.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
            header.style.padding = '15px 0';
        }
    }
    
    // Прослушивание события скролла
    window.addEventListener('scroll', scrollHeader);
    
    // Вызываем функцию один раз для начальной настройки
    scrollHeader();
}



// Функция скрытия прелоадера
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

// Добавление кнопки для временного отображения селектора языка (для тестирования)
function addLanguageSelectorToggle() {
    // Создаем кнопку
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-language-selector';
    toggleButton.textContent = '🌍';
    toggleButton.title = 'Test Language Selector';
    toggleButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #da9446;
        color: white;
        font-size: 24px;
        border: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Обработчик нажатия
    toggleButton.addEventListener('click', function() {
        // Проверяем, существует ли уже селектор
        const existingSelector = document.getElementById('temp-language-selector');
        if (existingSelector) {
            document.body.removeChild(existingSelector);
        } else {
            // Создаем селектор через менеджер локализации
            window.localizationManager.createLanguageSelector();
        }
    });
    
    // Добавляем кнопку на страницу
    document.body.appendChild(toggleButton);
}

/**
 * ОБРАБОТЧИК МОДАЛЬНОГО ОКНА В ОСНОВНОЙ СТРАНИЦЕ
 * Добавьте этот код в конец файла script.js
 */

// Обработчик для показа существующего модального окна
function handleWinModalMessages() {
    // Слушаем сообщения от iframe
    window.addEventListener('message', function(event) {
        const data = event.data;
        
        // Проверяем тип сообщения
        if (typeof data === 'object' && data.type === 'SHOW_WIN_MODAL') {
            console.log('Получено сообщение для показа модального окна:', data.amount);
            
            // Находим элементы модального окна
            const winModal = document.getElementById('win-modal');
            const winAmount = document.getElementById('win-modal-amount');
            const winCurrency = document.getElementById('win-modal-currency');
            
            if (!winModal || !winAmount || !winCurrency) {
                console.error('Элементы модального окна не найдены');
                return;
            }
            
            // Получаем сумму выигрыша и форматируем её с учетом валюты
            let formattedAmount = data.amount;
            let currencySymbol = '$'; // Значение по умолчанию
            
            // Если есть обработчик валюты, используем его для форматирования
            if (window.currencyHandler) {
                const convertedAmount = window.currencyHandler.convertToUserCurrency(data.amount);
                formattedAmount = window.currencyHandler.formatCurrency(convertedAmount, false);
                currencySymbol = window.currencyHandler.userCurrency || '$';
            }
            
            // Устанавливаем значения в модальном окне
            winAmount.textContent = formattedAmount;
            winCurrency.textContent = currencySymbol;
            
            // Настраиваем кнопку забрать выигрыш
            const claimButton = document.getElementById('win-modal-claim-btn');
            if (claimButton) {
                // Удаляем предыдущие обработчики
                const newClaimButton = claimButton.cloneNode(true);
                claimButton.parentNode.replaceChild(newClaimButton, claimButton);
                
                // Добавляем новый обработчик
                newClaimButton.addEventListener('click', function() {
                    // Скрываем модальное окно
                    winModal.style.display = 'none';
                    
                    // Если есть обработчик получения выигрыша, вызываем его
                    if (window.currencyHandler && typeof window.currencyHandler.handleClaimWinnings === 'function') {
                        window.currencyHandler.handleClaimWinnings();
                    }
                });
            }
            
            // Показываем модальное окно
            winModal.style.display = 'flex';
        }
    });
    
    console.log('Обработчик модального окна выигрыша инициализирован');
}

// Инициализируем обработчик при загрузке DOM
document.addEventListener('DOMContentLoaded', handleWinModalMessages);

// Если DOM уже загружен, инициализируем немедленно
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    handleWinModalMessages();
}

// Инициализация всех компонентов при загрузке документа
document.addEventListener('DOMContentLoaded', async function() {
    // Инициализируем менеджер локализации
    const localizationManager = new LocalizationManager(CONFIG);
    
    // Определяем местоположение пользователя и устанавливаем локаль
    const countryCode = await localizationManager.detectUserLocation();
    localizationManager.setLocale(countryCode);
    
    // Настраиваем компоненты интерфейса
    setupBurgerMenu();
    setupSmoothScrolling();
    setupPlayButtons();
    setupHeaderScrollEffect();
    createFruitElements();
    
    // Добавляем переключатель селектора языка для тестирования
    addLanguageSelectorToggle();
    
    // Скрываем прелоадер после всех инициализаций
    hidePreloader();
    
    // Экспортируем менеджер локализации в глобальную область для доступа из других скриптов
    window.localizationManager = localizationManager;
});
