//Navbar ikonuna klikledikde yazilar olan listin acilmasi
document.querySelector('.hamburger').addEventListener('click', function () {
    document.querySelector('.nav-items').classList.toggle('active');
});

const fromMenu = document.getElementById('from-currency-menu');
const toMenu = document.getElementById('to-currency-menu');
const fromInput = document.getElementById('from-amount');
const toInput = document.getElementById('to-amount');
const fromInfo = document.getElementById('from-info');
const toInfo = document.getElementById('to-info');

let rates = {};

//default deyerler
let fromCurrency = 'RUB';
let toCurrency = 'USD';
let lastEdited = 'from'; // son yazılan inputu saxlayırıq

//API ile valyutalarin alinmasi
async function getRates() {
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();

        rates = {
            USD: 1,
            EUR: data.rates.EUR,
            GBP: data.rates.GBP,
            RUB: data.rates.RUB
        };

        updateUI();
    } catch (err) {
        console.error('API xətası:', err);
    }
}

// Valyuta çevirme funksiyası
function convert(amount, from, to) {
    const usd = from === 'USD' ? amount : amount / rates[from];
    return to === 'USD' ? usd : usd * rates[to];
}

// UI-ni yenileyir
function updateUI() {
    if (!rates[fromCurrency] || !rates[toCurrency]) return;

    const fromAmount = parseFloat(fromInput.value) || 0;
    const toAmount = parseFloat(toInput.value) || 0;

    if (fromCurrency === toCurrency) {
        fromInfo.textContent = `1 ${fromCurrency} = 1.000000 ${toCurrency}`;
        toInfo.textContent = `1 ${toCurrency} = 1.000000 ${fromCurrency}`;
        if (lastEdited === 'from') {
            toInput.value = fromAmount.toFixed(2);
        } else {
            fromInput.value = toAmount.toFixed(2);
        }
        return;
    }

    const rateFromTo = (1 / rates[fromCurrency]) * rates[toCurrency];
    const rateToFrom = rates[fromCurrency] / rates[toCurrency];

    fromInfo.textContent = `1 ${fromCurrency} = ${rateFromTo.toFixed(6)} ${toCurrency}`;
    toInfo.textContent = `1 ${toCurrency} = ${rateToFrom.toFixed(6)} ${fromCurrency}`;

    if (lastEdited === 'from') {
        const result = convert(fromAmount, fromCurrency, toCurrency);
        toInput.value = result.toFixed(2);
    } else {
        const result = convert(toAmount, toCurrency, fromCurrency);
        fromInput.value = result.toFixed(2);
    }
}

// Valyuta menyusuna kliklemek funksiyası
function handleCurrencySelection(menu, isFrom) {
    menu.querySelectorAll('.currency-option').forEach(option => {
        option.addEventListener('click', () => {
            menu.querySelector('.active')?.classList.remove('active');
            option.classList.add('active');
            isFrom ? fromCurrency = option.dataset.currency : toCurrency = option.dataset.currency;
            updateUI();
        });
    });
}

// Inputlara dinləyici əlavə edilir
fromInput.addEventListener('input', () => {
    lastEdited = 'from';
    updateUI();
});

toInput.addEventListener('input', () => {
    lastEdited = 'to';
    updateUI();
});

// Valyuta seçimlərini aktiv edir
handleCurrencySelection(fromMenu, true);
handleCurrencySelection(toMenu, false);

// İlk açılışda valyuta məzənnələrini aliriq
getRates();
setInterval(getRates, 10 * 60 * 1000);

//Wifi meselesi 
function checkConnection() {
    const offlineAlert = document.getElementById('offline-alert');
    const isOnline = navigator.onLine;

    document.querySelectorAll('.currency-option').forEach(option => {
        if (!isOnline) {
            option.style.pointerEvents = 'none';
            option.style.opacity = '0.5';
            option.style.cursor = 'not-allowed';
        } else {
            option.style.pointerEvents = 'auto';
            option.style.opacity = '1';
            option.style.cursor = 'pointer';
        }
    });

    if (!isOnline) {
        offlineAlert.style.display = 'block';
        fromInput.disabled = true;
        toInput.disabled = true;
    } else {
        offlineAlert.style.display = 'none';
        fromInput.disabled = false;
        toInput.disabled = false;
        getRates();
    }
}

window.addEventListener('online', checkConnection);
window.addEventListener('offline', checkConnection);

checkConnection();
