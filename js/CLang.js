// Локализованные строки для игрового слота
// Поддерживаемые языки: английский (en), немецкий (de), французский (fr), арабский (ar)

// Определение параметров из localStorage или URL
function getLocalizationParams() {
    try {
        // First check localStorage (data from proxy iframe or main site)
        const localeData = localStorage.getItem('fruitParadiseLocale');
        if (localeData) {
            return JSON.parse(localeData);
        }
        
        // Check for currency settings specifically
        const currencyData = localStorage.getItem('fruitParadiseCurrency');
        if (currencyData) {
            const lang = localStorage.getItem('selectedLanguage') || 'en';
            const country = localStorage.getItem('selectedCountry') || 'US';
            
            return {
                country: country,
                lang: lang.toLowerCase(),
                currency: currencyData
            };
        }
    } catch (e) {
        console.error("[LOCALE] Error reading from localStorage:", e);
    }

    // If not in localStorage, check URL
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            country: urlParams.get('country') || 'US',
            lang: urlParams.get('lang') || 'en',
            currency: urlParams.get('currency') || '$'
        };
    } catch (e) {
        console.error("[LOCALE] Error reading URL params:", e);
        // Return defaults
        return {
            country: 'US',
            lang: 'en',
            currency: '$'
        };
    }
}

// Get parameters
const params = getLocalizationParams();
console.log("[LOCALE] Game language settings:", params);

// Базовая локализация (английский - США)
// Base localization (English - US)
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
    },
    'zh': { // Chinese
        TEXT_MONEY: "金钱",
        TEXT_PLAY: "开始",
        TEXT_BET: "投注",
        TEXT_COIN: "硬币",
        TEXT_MAX_BET: "最大投注",
        TEXT_INFO: "信息",
        TEXT_LINES: "线路",
        TEXT_SPIN: "旋转",
        TEXT_WIN: "赢取",
        TEXT_HELP_WILD: "这个符号是一个百搭符号，可以替代任何其他符号组成组合",
        TEXT_CREDITS_DEVELOPED: "开发者",
        TEXT_PRELOADER_CONTINUE: "开始",
        TEXT_SHARE_TITLE: "恭喜！",
        TEXT_SHARE_MSG1: "您已收集 <strong>",
        TEXT_SHARE_MSG2: " 分</strong>！<br><br>与您的朋友分享您的分数！",
        TEXT_SHARE_SHARE1: "我的分数是 ",
        TEXT_SHARE_SHARE2: " 分！你能做得更好吗？"
    },
    'ja': { // Japanese
        TEXT_MONEY: "お金",
        TEXT_PLAY: "プレイ",
        TEXT_BET: "ベット",
        TEXT_COIN: "コイン",
        TEXT_MAX_BET: "最大ベット",
        TEXT_INFO: "情報",
        TEXT_LINES: "ライン",
        TEXT_SPIN: "スピン",
        TEXT_WIN: "勝利",
        TEXT_HELP_WILD: "このシンボルはワイルドで、組み合わせを作るために他のシンボルに置き換えることができます",
        TEXT_CREDITS_DEVELOPED: "開発者",
        TEXT_PRELOADER_CONTINUE: "スタート",
        TEXT_SHARE_TITLE: "おめでとう！",
        TEXT_SHARE_MSG1: "あなたは <strong>",
        TEXT_SHARE_MSG2: " ポイント</strong>を獲得しました！<br><br>友達とスコアをシェアしましょう！",
        TEXT_SHARE_SHARE1: "私のスコアは ",
        TEXT_SHARE_SHARE2: " ポイントです！あなたはもっと良くできますか？"
    },
    'ru': { // Russian
        TEXT_MONEY: "ДЕНЬГИ",
        TEXT_PLAY: "ИГРАТЬ",
        TEXT_BET: "СТАВКА",
        TEXT_COIN: "МОНЕТА",
        TEXT_MAX_BET: "МАКС. СТАВКА",
        TEXT_INFO: "ИНФО",
        TEXT_LINES: "ЛИНИИ",
        TEXT_SPIN: "ВРАЩАТЬ",
        TEXT_WIN: "ВЫИГРЫШ",
        TEXT_HELP_WILD: "ЭТОТ СИМВОЛ ЯВЛЯЕТСЯ ДИКИМ И МОЖЕТ ЗАМЕНИТЬ ЛЮБОЙ ДРУГОЙ СИМВОЛ ДЛЯ СОЗДАНИЯ КОМБИНАЦИИ",
        TEXT_CREDITS_DEVELOPED: "РАЗРАБОТАНО",
        TEXT_PRELOADER_CONTINUE: "НАЧАТЬ",
        TEXT_SHARE_TITLE: "Поздравляем!",
        TEXT_SHARE_MSG1: "Вы набрали <strong>",
        TEXT_SHARE_MSG2: " очков</strong>!<br><br>Поделитесь своим результатом с друзьями!",
        TEXT_SHARE_SHARE1: "Мой результат ",
        TEXT_SHARE_SHARE2: " очков! Сможете лучше?"
    },
    'es': { // Spanish
        TEXT_MONEY: "DINERO",
        TEXT_PLAY: "JUGAR",
        TEXT_BET: "APUESTA",
        TEXT_COIN: "MONEDA",
        TEXT_MAX_BET: "APUESTA MÁX",
        TEXT_INFO: "INFO",
        TEXT_LINES: "LÍNEAS",
        TEXT_SPIN: "GIRAR",
        TEXT_WIN: "GANA",
        TEXT_HELP_WILD: "ESTE SÍMBOLO ES UN COMODÍN QUE PUEDE REEMPLAZAR CUALQUIER OTRO SÍMBOLO PARA FORMAR UNA COMBINACIÓN",
        TEXT_CREDITS_DEVELOPED: "DESARROLLADO POR",
        TEXT_PRELOADER_CONTINUE: "INICIAR",
        TEXT_SHARE_TITLE: "¡Felicidades!",
        TEXT_SHARE_MSG1: "¡Has recolectado <strong>",
        TEXT_SHARE_MSG2: " puntos</strong>!<br><br>¡Comparte tu puntuación con tus amigos!",
        TEXT_SHARE_SHARE1: "¡Mi puntuación es de ",
        TEXT_SHARE_SHARE2: " puntos! ¿Puedes hacerlo mejor?"
    },
    'it': { // Italian
        TEXT_MONEY: "DENARO",
        TEXT_PLAY: "GIOCA",
        TEXT_BET: "PUNTATA",
        TEXT_COIN: "MONETA",
        TEXT_MAX_BET: "PUNTATA MAX",
        TEXT_INFO: "INFO",
        TEXT_LINES: "LINEE",
        TEXT_SPIN: "GIRA",
        TEXT_WIN: "VINCITA",
        TEXT_HELP_WILD: "QUESTO SIMBOLO È UN JOLLY CHE PUÒ SOSTITUIRE QUALSIASI ALTRO SIMBOLO PER CREARE UNA COMBINAZIONE",
        TEXT_CREDITS_DEVELOPED: "SVILUPPATO DA",
        TEXT_PRELOADER_CONTINUE: "INIZIA",
        TEXT_SHARE_TITLE: "Congratulazioni!",
        TEXT_SHARE_MSG1: "Hai raccolto <strong>",
        TEXT_SHARE_MSG2: " punti</strong>!<br><br>Condividi il tuo punteggio con i tuoi amici!",
        TEXT_SHARE_SHARE1: "Il mio punteggio è ",
        TEXT_SHARE_SHARE2: " punti! Puoi fare meglio?"
    }
};

// Настройки валют для разных стран
const CURRENCY_SETTINGS = {
    '$': '$',         // USD (США)
    'C$': 'C$',       // CAD (Канада)
    'A$': 'A$',       // AUD (Австралия)
    '€': '€',         // EUR (Германия, Франция)
    '£': '£',         // GBP (Великобритания)
    'AED': 'AED',      // AED (ОАЭ)
    'CHF': 'CHF'  // CHF (SWITZERLAND)
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
