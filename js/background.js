'use strict';

import {INFO_URL, PLURAL_SECURITY_TYPE, SEARCH_URL, SYMBOL_LINK} from "/js/constants.mjs";


chrome.runtime.onConnect.addListener(port => {
    console.log("Connected .....");
    port.onMessage.addListener(msg => {
        console.log("Background - message received " + JSON.stringify(msg));
        switch (msg.method) {
            case 'getTickers':
                getTCSsession().then(sessionId => {
                    createLinks(msg.params, sessionId).then(list => {
                        console.log("send message Links .....");
                        let result = {};
                        result['method'] = 'setLinks';
                        result['list'] = list;
                        port.postMessage(result);
                    });
                });
                break;
        }
    })
});

// создаем список объектов с инф о тикере от брокера
async function createLinks(params, sessionId) {
    if (params.list.length > 0) {
        return await Promise.all(params.list.map(async item => {
            let json = await findTicker(item, sessionId);
            // берем первый из списка найденных
            if (json.payload.values.length > 0)
                return {
                    prices: json.payload.values[0].prices,
                    symbol: {
                        ticker: json.payload.values[0].symbol.ticker,
                        showName: json.payload.values[0].symbol.showName,
                        lotSize: json.payload.values[0].symbol.lotSize,
                        isOTC: json.payload.values[0].symbol.isOTC,
                        link: `${SYMBOL_LINK.replace('${securityType}', PLURAL_SECURITY_TYPE[json.payload.values[0].symbol.symbolType || 'Stock'])}${json.payload.values[0].symbol.ticker}`,
                    },
                    exchangeStatus: json.payload.values[0].exchangeStatus
                }
            else return undefined;
        }))
    }
}

function findTicker(search, session_id) {
    return new Promise((resolve, reject) => {
            // POST
            fetch(SEARCH_URL + session_id, {
                method: "POST",
                body: JSON.stringify({
                    start: 0,
                    end: 1,
                    sortType: "ByName",
                    orderType: "Asc",
                    country: "All",
                    filter: search
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
            }
        });
    })
}