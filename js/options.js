'use strict';

import {
    OPTION_ACTIVELINK,
    OPTION_BLACKLIST,
    OPTION_COLOR,
    OPTION_COSMETICS,
    OPTION_FAVOURITE,
    OPTION_ISBLACKLIST,
    OPTION_ISCOLOR,
    OPTION_ISSTYLE,
    OPTION_OTC,
    OPTION_PRICE,
    OPTION_SHORTLONG,
    OPTION_STYLE,
    OPTION_UPDATE,
} from "/js/constants.mjs";

const
    port = chrome.runtime.connect({
        name: "TinkoffTicker"
    });
port.onMessage.addListener(function (msg) {
    console.log(`Option - message received ${msg.result}`);
    switch (msg.result) {
        case 'newTickers':
            renderTickers(msg);
            break;
    }
});

// сохраняем применение косметического фильтра
document.getElementById(OPTION_COSMETICS).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_COSMETICS]: e.target.checked}, function () {
        console.log('Cosmetic option set to ' + e.target.checked);
    })
    document.getElementById(OPTION_ACTIVELINK).disabled = !e.target.checked;
    document.getElementById(OPTION_FAVOURITE).disabled = !e.target.checked;
    document.getElementById(OPTION_SHORTLONG).disabled = !e.target.checked;
    document.getElementById(OPTION_PRICE).disabled = !e.target.checked;
    document.getElementById(OPTION_ISSTYLE).disabled = !e.target.checked;
    document.getElementById(OPTION_ISCOLOR).disabled = !e.target.checked;
    document.getElementById(OPTION_OTC).disabled = !e.target.checked;
    document.getElementById(OPTION_UPDATE).disabled = !e.target.checked;
    document.getElementById(OPTION_ISBLACKLIST).disabled = !e.target.checked;
    document.getElementById(OPTION_BLACKLIST).disabled = !e.target.checked;
});

// подгружаем настройки
chrome.storage.sync.get([OPTION_COSMETICS], function (result) {
    console.log('get Cosmetic filter option');
    document.getElementById(OPTION_COSMETICS).checked = result[OPTION_COSMETICS] === true;
    document.getElementById(OPTION_ACTIVELINK).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_FAVOURITE).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_SHORTLONG).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_PRICE).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_ISSTYLE).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_ISCOLOR).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_OTC).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_UPDATE).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_ISBLACKLIST).disabled = result[OPTION_COSMETICS] === false;
    document.getElementById(OPTION_BLACKLIST).disabled = result[OPTION_COSMETICS] === false;
});


// сохраняем применение 👑
document.getElementById(OPTION_OTC).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_OTC]: e.target.checked}, function () {
        console.log('OTC option set to ' + e.target.checked);
    })
});

// подгружаем настройки
chrome.storage.sync.get([OPTION_OTC], function (result) {
    console.log('get OTC filter option');
    document.getElementById(OPTION_OTC).checked = result[OPTION_OTC] === true;
});

// сохраняем применение цвета
document.getElementById(OPTION_ISCOLOR).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_ISCOLOR]: e.target.checked}, function () {
        console.log('iscolor option set to ' + e.target.checked);
    })
});

// подгружаем настройки
chrome.storage.sync.get([OPTION_ISCOLOR], function (result) {
    console.log('get iscolor filter option');
    document.getElementById(OPTION_ISCOLOR).checked = result[OPTION_ISCOLOR] === true;
});

// сохраняем применение цвета
document.getElementById(OPTION_COLOR).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_COLOR]: e.target.value}, function () {
        console.log('color option set to ' + e.target.value);
    })
});

// подгружаем настройки
chrome.storage.sync.get([OPTION_COLOR], function (result) {
    console.log('get Color filter option');
    document.getElementById(OPTION_COLOR).value = result[OPTION_COLOR];
});

// сохраняем применение цены
document.getElementById(OPTION_PRICE).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_PRICE]: e.target.checked}, function () {
        console.log('price option set to ' + e.target.checked);
    })
});

// подгружаем настройки
chrome.storage.sync.get([OPTION_PRICE], function (result) {
    console.log('get price filter option');
    document.getElementById(OPTION_PRICE).checked = result[OPTION_PRICE] === true;
});

// подгружаем настройки фильтрации избранного
chrome.storage.sync.get([OPTION_FAVOURITE], function (result) {
    console.log('get only favourite filter option');
    document.getElementById(OPTION_FAVOURITE).checked = result[OPTION_FAVOURITE] === true;
});

// сохраняем фильтрации избранного
document.getElementById(OPTION_FAVOURITE).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_FAVOURITE]: e.target.checked}, function () {
        console.log('only favourite option set to ' + e.target.checked);
    })
});

// подгружаем настройки шорт лонг
chrome.storage.sync.get([OPTION_SHORTLONG], function (result) {
    console.log('get short long option');
    document.getElementById(OPTION_SHORTLONG).checked = result[OPTION_SHORTLONG] === true;
});

// сохраняем фильтрации избранного
document.getElementById(OPTION_SHORTLONG).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_SHORTLONG]: e.target.checked}, function () {
        console.log('short long option set to ' + e.target.checked);
    })
});

// подгружаем настройки активная ссылка
chrome.storage.sync.get([OPTION_ACTIVELINK], function (result) {
    console.log('get active link option');
    document.getElementById(OPTION_ACTIVELINK).checked = result[OPTION_ACTIVELINK] === true;
    // document.getElementById(OPTION_ISCOLOR).disabled = !result[OPTION_ACTIVELINK] === true
});

// сохраняем фильтрации избранного
document.getElementById(OPTION_ACTIVELINK).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_ACTIVELINK]: e.target.checked}, function () {
        console.log('active link option set to ' + e.target.checked);
        // document.getElementById(OPTION_ISCOLOR).disabled = !e.target.checked
    })
});

// подгружаем настройки применение стиля
chrome.storage.sync.get([OPTION_ISSTYLE], function (result) {
    console.log('style link option');
    document.getElementById(OPTION_ISSTYLE).checked = result[OPTION_ISSTYLE] === true;
    document.getElementById(OPTION_STYLE).disabled = !result[OPTION_ISSTYLE] === true
});

// сохраняем фильтрации избранного
document.getElementById(OPTION_ISSTYLE).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_ISSTYLE]: e.target.checked}, function () {
        console.log('style option set to ' + e.target.checked);
        document.getElementById(OPTION_STYLE).disabled = !e.target.checked
    })
});

// подгружаем стиль
chrome.storage.sync.get([OPTION_STYLE], function (result) {
    console.log('get style filter option');
    document.getElementById(OPTION_STYLE).value = result[OPTION_STYLE] || '';
});

// сохраняем применение цены
document.getElementById(OPTION_STYLE).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_STYLE]: e.target.value}, function () {
        console.log('style option set to ' + e.target.value);
    })
});

// подгружаем настройки фильтрации
chrome.storage.sync.get([OPTION_ISBLACKLIST], function (result) {
    console.log('is blacklist option');
    document.getElementById(OPTION_ISBLACKLIST).checked = result[OPTION_ISBLACKLIST] === true;
    document.getElementById(OPTION_BLACKLIST).disabled = !result[OPTION_ISBLACKLIST] === true
});

// сохраняем фильтрации избранного
document.getElementById(OPTION_ISBLACKLIST).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_ISBLACKLIST]: e.target.checked}, function () {
        console.log('is blacklist option set to ' + e.target.checked);
        document.getElementById(OPTION_BLACKLIST).disabled = !e.target.checked
    })
});

// подгружаем фильтр
chrome.storage.sync.get([OPTION_BLACKLIST], function (result) {
    console.log('get blacklist option');
    document.getElementById(OPTION_BLACKLIST).value = result[OPTION_BLACKLIST] || '';
});

// сохраняем применение цены
document.getElementById(OPTION_BLACKLIST).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_BLACKLIST]: e.target.value}, function () {
        console.log('blacklist option set to ' + e.target.value);
    })
});

// сохраняем создание кнопки Обновить
document.getElementById(OPTION_UPDATE).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_UPDATE]: e.target.checked}, function () {
        console.log('Update option set to ' + e.target.checked);
    })
});

// подгружаем настройки
chrome.storage.sync.get([OPTION_UPDATE], function (result) {
    console.log('get Update filter option');
    document.getElementById(OPTION_UPDATE).checked = result[OPTION_UPDATE] === true;
});

document.getElementById('hideNewList').addEventListener('click', function (e) {
    document.getElementById("newtickers_container").innerHTML = ' <img src="css/loader.gif" alt="loading">';
    port.postMessage({method: "cleanNewTickers"});
});

function renderTickers(object) {
    let buffer = '<div class="scroll">';
    let newTickers = object.newTickers;
    let IPOs = object.IPOs[0];
    if (newTickers.different?.length) {
        buffer += '<h3>Новые тикеры</h3>';
        buffer += newTickers.different.map(item => {
            return `<span class="item" title="${item.showName}">${item.isOTC ? '👑' : ''}${item.ticker}</span>`
        }).join('');
    } else {
        buffer += '<h3>Список новых тикеров пуст</h3>'
    }
    if (newTickers.isNotOTC?.length) {
        buffer += '<h3>Внебиржевые, которые стали доступны для всех</h3>';
        buffer += newTickers.isNotOTC.map(item => {
            return `<span class="item" title="${item.showName}">${item.isOTC ? '👑' : ''}${item.ticker}</span>`
        }).join('');
    } else {
        buffer += '<h3>Список внебирживых, которые стали доступны всем пуст</h3>'
    }
    if (IPOs?.shelfSections.length) {
        buffer += '<h3>Первичное размещение</h3>';
        buffer += IPOs.shelfSections.map(item => {
            return `<div title="подробности в приложении" class="newsAnnounce bordered" style="background-size: cover; background-image: url(${item.security?.logo.url || item.picture})">
            <h2 class="header white">${item.name}</h2>
            <div class="announce white">${item.title}</div>
            <div class="announce white">${item.security?.asset.ticker || ('Корзина: ' + item.shortDescription)}</div>
            </div>`
        }).join('');
    }
    buffer += '</div>';
    document.getElementById('newtickers_container').innerHTML = buffer;
    document.getElementById('hideNewList').style.display = 'block';
}

port.postMessage({method: "getNewTickers"});