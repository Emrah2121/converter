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
    const amount = parseFloat(fromInput.value) || 0;
        // Eyni valyuta olduqda sadece meblegi gosdermek(apiye sorgu getmeden)
    if (fromCurrency === toCurrency) {
        toInput.value = amount.toFixed(2);
        fromInfo.textContent = `1 ${fromCurrency} = 1.000000 ${toCurrency}`;
        toInfo.textContent = `1 ${toCurrency} = 1.000000 ${fromCurrency}`;
    } else {
        const result = convert(amount, fromCurrency, toCurrency);
        toInput.value = result.toFixed(2);
        fromInfo.textContent = `1 ${fromCurrency} = ${(1 / rates[fromCurrency] * rates[toCurrency]).toFixed(6)} ${toCurrency}`;
        toInfo.textContent = `1 ${toCurrency} = ${(rates[fromCurrency] / rates[toCurrency]).toFixed(6)} ${fromCurrency}`;
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

// İstifadəçi mebleği deyişdikde UI yenileyen funk.
fromInput.addEventListener('input', updateUI);

// Əksinə çevirmə
toInput.addEventListener('input', () => {
    const amount = parseFloat(toInput.value) || 0;
    fromInput.value = convert(amount, toCurrency, fromCurrency).toFixed(2);
});

// Valyuta seçimlərini aktiv edilir
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
