// Локализованные строки для игрового слота
// Поддерживаемые языки: английский (en), немецкий (de), французский (fr), арабский (ar)

// Определение параметров из localStorage или URL
function getLocalizationParams() {
    try {
        // Проверяем сначала localStorage (данные из проксирующего iframe)
        const localeData = localStorage.getItem('fruitParadiseLocale');
        if (localeData) {
            return JSON.parse(localeData);
        }
    } catch (e) {
        console.error("Error reading from localStorage:", e);
    }

    // Если нет в localStorage, проверяем URL
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            country: urlParams.get('country') || 'US',
            lang: urlParams.get('lang') || 'en',
            currency: urlParams.get('currency') || '$'
        };
    } catch (e) {
        console.error("Error reading URL params:", e);
        // Возвращаем значения по умолчанию
        return {
            country: 'US',
            lang: 'en',
            currency: '$'
        };
    }
}

// Получаем параметры
const params = getLocalizationParams();
console.log("Game language settings:", params);

// Базовая локализация (английский - США)
const LOCALIZATION = {
    'en': {
        TEXT_MONEY: "MONEY",
        TEXT_PLAY: "PLAY",
        TEXT_BET: "BET",
        TEXT_COIN: "COIN",
        TEXT_MAX_BET: "MAX BET",
        TEXT_INFO: "INFO",
        TEXT_LINES: "LINES",
        TEXT_SPIN: "SPIN",
        TEXT_WIN: "WIN",
        TEXT_HELP_WILD: "THIS SYMBOL IS A WILD WHICH CAN REPLACE ANY OTHER SYMBOL TO MAKE UP A COMBO",
        TEXT_CREDITS_DEVELOPED: "DEVELOPED BY",
        TEXT_PRELOADER_CONTINUE: "START",
        TEXT_SHARE_TITLE: "Congratulations!",
        TEXT_SHARE_MSG1: "You collected <strong>",
        TEXT_SHARE_MSG2: " points</strong>!<br><br>Share your score with your friends!",
        TEXT_SHARE_SHARE1: "My score is ",
        TEXT_SHARE_SHARE2: " points! Can you do better?"
    },
    'de': {
        TEXT_MONEY: "GELD",
        TEXT_PLAY: "SPIELEN",
        TEXT_BET: "EINSATZ",
        TEXT_COIN: "MÜNZE",
        TEXT_MAX_BET: "MAX EINSATZ",
        TEXT_INFO: "INFO",
        TEXT_LINES: "LINIEN",
        TEXT_SPIN: "DREHEN",
        TEXT_WIN: "GEWINN",
        TEXT_HELP_WILD: "DIESES SYMBOL IST EIN JOKER, DER JEDES ANDERE SYMBOL ERSETZEN KANN, UM EINE KOMBINATION ZU BILDEN",
        TEXT_CREDITS_DEVELOPED: "ENTWICKELT VON",
        TEXT_PRELOADER_CONTINUE: "START",
        TEXT_SHARE_TITLE: "Glückwunsch!",
        TEXT_SHARE_MSG1: "Du hast <strong>",
        TEXT_SHARE_MSG2: " Punkte</strong> gesammelt!<br><br>Teile deinen Punktestand mit deinen Freunden!",
        TEXT_SHARE_SHARE1: "Mein Punktestand ist ",
        TEXT_SHARE_SHARE2: " Punkte! Kannst du es besser machen?"
    },
    'fr': {
        TEXT_MONEY: "ARGENT",
        TEXT_PLAY: "JOUER",
        TEXT_BET: "MISE",
        TEXT_COIN: "PIÈCE",
        TEXT_MAX_BET: "MISE MAX",
        TEXT_INFO: "INFO",
        TEXT_LINES: "LIGNES",
        TEXT_SPIN: "TOURNER",
        TEXT_WIN: "GAIN",
        TEXT_HELP_WILD: "CE SYMBOLE EST UN JOKER QUI PEUT REMPLACER N'IMPORTE QUEL AUTRE SYMBOLE POUR FORMER UNE COMBINAISON",
        TEXT_CREDITS_DEVELOPED: "DÉVELOPPÉ PAR",
        TEXT_PRELOADER_CONTINUE: "DÉMARRER",
        TEXT_SHARE_TITLE: "Félicitations!",
        TEXT_SHARE_MSG1: "Vous avez collecté <strong>",
        TEXT_SHARE_MSG2: " points</strong>!<br><br>Partagez votre score avec vos amis!",
        TEXT_SHARE_SHARE1: "Mon score est de ",
        TEXT_SHARE_SHARE2: " points! Pouvez-vous faire mieux?"
    },
    'ar': {
        TEXT_MONEY: "المال",
        TEXT_PLAY: "العب",
        TEXT_BET: "رهان",
        TEXT_COIN: "عملة",
        TEXT_MAX_BET: "أقصى رهان",
        TEXT_INFO: "معلومات",
        TEXT_LINES: "خطوط",
        TEXT_SPIN: "دوران",
        TEXT_WIN: "فوز",
        TEXT_HELP_WILD: "هذا الرمز هو رمز بري يمكنه استبدال أي رمز آخر لتكوين مجموعة",
        TEXT_CREDITS_DEVELOPED: "تم التطوير بواسطة",
        TEXT_PRELOADER_CONTINUE: "بدء",
        TEXT_SHARE_TITLE: "تهانينا!",
        TEXT_SHARE_MSG1: "لقد جمعت <strong>",
        TEXT_SHARE_MSG2: " نقطة</strong>!<br><br>شارك نتيجتك مع أصدقائك!",
        TEXT_SHARE_SHARE1: "نتيجتي هي ",
        TEXT_SHARE_SHARE2: " نقطة! هل يمكنك تحقيق نتيجة أفضل؟"
    }
};

// Настройки валют для разных стран
const CURRENCY_SETTINGS = {
    '$': '$',         // USD (США)
    'C$': 'C$',       // CAD (Канада)
    'A$': 'A$',       // AUD (Австралия)
    '€': '€',         // EUR (Германия, Франция)
    '£': '£',         // GBP (Великобритания)
    'AED': 'AED'      // AED (ОАЭ)
};

// Константа для сохранения изображения для расшаривания
const TEXT_SHARE_IMAGE = "200x200.jpg";

// Выбор языка на основе параметров
const lang = params.lang;
const selectedLang = LOCALIZATION[lang] || LOCALIZATION['en'];

// Настройка валюты
const currency = params.currency;
const selectedCurrency = CURRENCY_SETTINGS[currency] || CURRENCY_SETTINGS['$'];

// Назначение всех глобальных переменных для игры
TEXT_MONEY = selectedLang.TEXT_MONEY;
TEXT_PLAY = selectedLang.TEXT_PLAY;
TEXT_BET = selectedLang.TEXT_BET;
TEXT_COIN = selectedLang.TEXT_COIN;
TEXT_MAX_BET = selectedLang.TEXT_MAX_BET;
TEXT_INFO = selectedLang.TEXT_INFO;
TEXT_LINES = selectedLang.TEXT_LINES;
TEXT_SPIN = selectedLang.TEXT_SPIN;
TEXT_WIN = selectedLang.TEXT_WIN;
TEXT_HELP_WILD = selectedLang.TEXT_HELP_WILD;
TEXT_CREDITS_DEVELOPED = selectedLang.TEXT_CREDITS_DEVELOPED;
TEXT_CURRENCY = selectedCurrency;
TEXT_PRELOADER_CONTINUE = selectedLang.TEXT_PRELOADER_CONTINUE;

TEXT_SHARE_TITLE = selectedLang.TEXT_SHARE_TITLE;
TEXT_SHARE_MSG1 = selectedLang.TEXT_SHARE_MSG1;
TEXT_SHARE_MSG2 = selectedLang.TEXT_SHARE_MSG2;
TEXT_SHARE_SHARE1 = selectedLang.TEXT_SHARE_SHARE1;
TEXT_SHARE_SHARE2 = selectedLang.TEXT_SHARE_SHARE2;

// Логирование загруженной локализации для отладки
console.log("Loaded localization:", lang, "with currency:", currency);