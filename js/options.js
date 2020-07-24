'use strict';

import {
    OPTION_ACTIVELINK,
    OPTION_COLOR,
    OPTION_COSMETICS,
    OPTION_FAVOURITE,
    OPTION_ISCOLOR,
    OPTION_OTC,
    OPTION_PRICE,
    OPTION_SHORTLONG
} from "/js/constants.mjs";


// сохраняем применение косметического фильтра
document.getElementById(OPTION_COSMETICS).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_COSMETICS]: e.target.checked}, function () {
        console.log('Cosmetic option set to ' + e.target.checked);
    })
});

// подгружаем настройки
chrome.storage.sync.get([OPTION_COSMETICS], function (result) {
    console.log('get Cosmetic filter option');
    document.getElementById(OPTION_COSMETICS).checked = result[OPTION_COSMETICS] === true;
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
});

// сохраняем фильтрации избранного
document.getElementById(OPTION_ACTIVELINK).addEventListener('change', function (e) {
    chrome.storage.sync.set({[OPTION_ACTIVELINK]: e.target.checked}, function () {
        console.log('active link option set to ' + e.target.checked);
    })
});