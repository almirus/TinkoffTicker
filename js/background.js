'use strict';

import {
    FAVORITE_URL,
    INFO_URL,
    NEW_TICKERS,
    PLURAL_SECURITY_TYPE,
    SEARCH_URL,
    SHELVES_URL,
    SYMBOL_LINK,

} from "/js/constants.mjs";


chrome.runtime.onConnect.addListener(port => {
    console.log("Connected .....");
    port.onMessage.addListener(msg => {
        console.log("Background - message received " + JSON.stringify(msg));
        switch (msg.method) {
            case 'getTickers':
                (async () => {
                        let sessionId = await getTCSsession();
                        let unique = msg.params.list;
                        if (sessionId && msg.params.isFavourite) {
                            let favourite = await getFavorite(sessionId);
                            unique = msg.params.list.filter(el => favourite.includes(el));
                        }
                        createLinks(unique, sessionId).then(list => {
                            console.log("send message Links .....");
                            let result = {};
                            result['method'] = 'setLinks';
                            result['list'] = list;
                            port.postMessage(result);
                        });
                    }
                )()
                break;
            case 'getNewTickers':
                Promise.all([getNewTickers(), getIPO()]).then(([newTickers, IPOs]) => {
                    port.postMessage(Object.assign({},
                        {result: "newTickers"},
                        {IPOs: IPOs},
                        {newTickers: newTickers}));
                    console.log("send list of new tickers.....");
                });
                break;
            case 'cleanNewTickers':
                Promise.all([getNewTickers(true), getIPO()]).then(([newTickers, IPOs]) => {
                    port.postMessage(Object.assign({},
                        {result: "newTickers"},
                        {IPOs: IPOs},
                        {newTickers: newTickers}));
                    console.log("send list of new tickers.....");
                });
                break;
        }
    })
});

async function getIPO() {
    let sessionId = await getTCSsession();
    let response = await fetch(SHELVES_URL + sessionId, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });
    let shelves = await response.json();

    if (shelves.status.toLocaleUpperCase() === 'OK') {
        return shelves.payload.shelves.filter(item => {
            return item.shelfName && item.shelfName.toLocaleUpperCase() === 'РАЗМЕЩЕНИЯ'
        })

    } else {
        console.log('Сервис поиска недоступен');
        return undefined
    }
}

async function getNewTickers(clean) {
    let sessionId = await getTCSsession();
    let search_obj = {
        country: "All",
        sortType: "ByPrice",
        orderType: "Asc",
    };
    let response = await fetch(SEARCH_URL + sessionId, {
        method: "POST",
        body: JSON.stringify(search_obj),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });
    let listOfFound = await response.json();
    let list = listOfFound.payload.values.reduce((result, item, index) => {
        result.push({
            ticker: item.symbol.ticker,
            showName: item.symbol.showName,
            isOTC: item.symbol.isOTC,
            symbolType: item.symbol.symbolType,
        });
        return result;
    }, []);
    if (listOfFound.status.toLocaleUpperCase() === 'OK') {
        async function getValue(name) {
            return new Promise(resolve => {
                chrome.storage.local.get(name, data => {
                    resolve(data);
                });
            });
        }

        let newList = [];
        // сохраненение нового списка newList останется undefined
        if (!clean) {
            // берем список ранее сохраненного списка
            newList = await getValue(NEW_TICKERS);
            newList = newList[NEW_TICKERS];
        }
        console.log('get old list');
        if (newList?.length) {
            // ищем разницу между списками
            const different = newList.filter(o1 => !list.some(o2 => o1.ticker === o2.ticker));
            // ищем одинаковые но которые поменяли флаг isOTC
            let isNotOTC = newList.filter(o1 => list.some(o2 => o1.ticker === o2.ticker && o1.isOTC !== o2.isOTC));
            // брокер возвращает дубли, удаляем
            isNotOTC = isNotOTC.filter(item => {
                return !item.isOTC
            });
            return {different: different, isNotOTC: isNotOTC};
        } else {
            chrome.storage.local.set({[NEW_TICKERS]: list}, () => {
                console.log('save newtickets list');
            })
            return {different: undefined, isNotOTC: undefined};
        }

    } else {
        console.log('Сервис поиска недоступен');
        return undefined
    }
}

// создаем список объектов с инф о тикере от брокера
async function createLinks(list, sessionId) {
    if (list.length > 0) {
        let json = await findTickers(list, sessionId);
        if (json.payload.values.length > 0)
            return json.payload.values.map(item => (
                    {
                        prices: item.prices,
                        symbol: {
                            ticker: item.symbol.ticker,
                            showName: item.symbol.showName,
                            lotSize: item.symbol.lotSize,
                            isOTC: item.symbol.isOTC,
                            link: `${SYMBOL_LINK.replace('${securityType}', PLURAL_SECURITY_TYPE[item.symbol.symbolType || 'Stock'])}${item.symbol.ticker}`,
                            longIsEnabled: item.symbol.longIsEnabled,
                            shortIsEnabled: item.symbol.shortIsEnabled
                        },
                        exchangeStatus: item.exchangeStatus
                    }
                )
            )
        else return undefined;
    } else return undefined;
}

function findTickers(search, session_id) {
    return new Promise((resolve, reject) => {
            // POST
            fetch(SEARCH_URL + session_id, {
                method: "POST",
                body: JSON.stringify({
                    start: 0,
                    end: 100,
                    sortType: "ByName",
                    orderType: "Asc",
                    country: "All",
                    tickers: search
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }).then(response => response.json())
                .then(listOfFound => {
                    if (listOfFound.status.toLocaleUpperCase() === 'OK') {
                        resolve(listOfFound);
                    } else {
                        console.log('Сервис поиска недоступен');
                        reject(undefined)
                    }
                }).catch(e => {
                console.error(e);
                reject(undefined);
            })
        }
    )
}

/**
 * проверяем что сессия жива
 * @param {string} sessionId значение
 * @return {Promise<Response  | boolean>} можно использовать или нет
 */
function sessionIsAlive(sessionId) {
    console.log(sessionId);
    return fetch(INFO_URL + sessionId)
        .then(response => response.json())
        .then(json => {
            if (json.resultCode.toLocaleUpperCase() === 'OK' && json.payload.accessLevel === 'CLIENT') {
                if (json.payload.accessLevel.toLocaleUpperCase() === 'ANONYMOUS') {
                    console.log('session is dead');
                    return false;
                } else {
                    console.log('session is alive');
                    return true;
                }
            } else {
                console.log('session is dead');
                return false;
            }
        }).catch(function (ex) {
            console.log('parsing failed', ex);
            return false;
        });
}

/**
 * получаем сессию пользователя из cookies + проверка что она валидна
 * @return {object} - возвращается строка с sessionId через promise
 */
function getTCSsession() {
    return new Promise((resolve, reject) => {
        console.log('try to get cookies');
        chrome.cookies.getAll({}, cookie => {
            let psid = cookie.filter(value => value.name === 'psid' && value.domain === 'www.tinkoff.ru');
            if (psid.length > 0 && psid[0].value) {
                console.log('psid founded' + psid[0].value);
                sessionIsAlive(psid[0].value).then(response => {
                    if (response) {
                        resolve(psid[0].value)
                    }
                    resolve('');
                }).catch(e => {
                    console.log(e);
                });
            } else {
                console.log('psid not found');
                resolve(undefined);
            }
        });
    })
}

// список Избранного
function getFavorite(sessionId) {
    return new Promise((resolve, reject) => {
        fetch(FAVORITE_URL + sessionId)
            .then(response => response.json())
            .then(json => {
                console.log('list of Favourite');
                let return_data = [];
                [].concat(json.payload.stocks)
                    .concat(json.payload.bonds)
                    .concat(json.payload.currencies)
                    .concat(json.payload.etf)
                    .concat(json.payload.isgs)
                    .forEach(item => {
                        return_data.push(item.symbol.ticker);
                    });
                resolve(return_data);
            }).catch(function (ex) {
            console.log('parsing failed', ex);
            reject([]);
        })
    });
}