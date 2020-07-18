'use strict';

import {FAVORITE_URL, INFO_URL, PLURAL_SECURITY_TYPE, SEARCH_URL, SYMBOL_LINK} from "/js/constants.mjs";


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
        }
    })
});

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