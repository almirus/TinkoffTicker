const SEARCH_EXP = /\b[A-Z]{2,6}\b/gm;
const
    port = chrome.runtime.connect({
        name: "TinkoffTicker"
    });
const SHORT_CUR = {
    USD: '$',
    RUB: '₽',
    EUR: '€'
};
// слушатель, получение сообщений из background.js
port.onMessage.addListener(msg => {
    console.log("Content - message received " + JSON.stringify(msg.method));
    switch (msg.method) {
        case 'setLinks':
            changePage(msg.list);
            break;
    }
})


// замена на исходной странице найденных тикеров
function changePage(listTickers) {
    if (!listTickers || listTickers.length === 0) return
    let textNodes = findAllTextNodes(document.body);
    chrome.storage.sync.get(['OTC', 'price', 'iscolor', 'color', 'favourite', 'shortlong', 'activelink', 'isstyle', 'style', 'isblacklist', 'blacklist'], option => {
        textNodes.forEach(textNode => {
            textNodeReplace(textNode, SEARCH_EXP, possibleTicker => {
                // массив черного списка тикеров
                let blacklist = option.isblacklist ? option.blacklist.toUpperCase().split(' ') : [];
                let elementPos = listTickers.map(item => {
                    return item?.symbol?.ticker;
                }).indexOf(possibleTicker);
                // если нашли элемент и он не в черном списке
                if (elementPos > -1 && !blacklist.includes(possibleTicker)) {
                    return [
                        // в "объект для замены" обрамляем в стиль
                        {
                            ...(option.isstyle && {
                                name: 'span',
                                attrs: {
                                    "style": option.style,
                                }
                            }),
                            content: possibleTicker,

                        },
                        // в "объект для замены" обрамляем ссылкой
                        {
                            ...(option.activelink && {
                                name: 'a',
                                attrs: {
                                    "href": listTickers[elementPos].symbol.link,
                                    "target": '_blank',
                                    "title": 'Открыть на странице брокера',
                                    "style": option.iscolor ? `background-color: ${option.color}` : '',
                                }
                            }),
                            // добавляем emoji цену шорт лонг
                            content: {
                                name: 'b',
                                content: ''
                                    .concat(listTickers[elementPos].symbol.isOTC && option.OTC ? '👑' : '🔗')
                                    .concat(option.shortlong ? (
                                        (listTickers[elementPos].symbol.shortIsEnabled ? 'S' : '') +
                                        '/' +
                                        (listTickers[elementPos].symbol.longIsEnabled ? 'L' : '')
                                    ) : '')
                                    .concat(listTickers[elementPos].prices.last && option.price ? ` (${listTickers[elementPos].prices.last.value}${SHORT_CUR[listTickers[elementPos].prices.last.currency]})` : '')

                            }
                        }];
                } else
                    return possibleTicker;
            });
        });
    })

    function findAllTextNodes(n) {
        let walker = n.ownerDocument.createTreeWalker(n, NodeFilter.SHOW_TEXT);
        let textNodes = [];
        while (walker.nextNode())
            if (walker.currentNode.parentNode.tagName !== 'SCRIPT')
                textNodes.push(walker.currentNode);
        return textNodes;
    }

    function textNodeReplace(node, regex, handler) {
        let mom = node.parentNode, nxt = node.nextSibling,
            doc = node.ownerDocument, hits;
        if (regex.global) {
            while (node && (hits = regex.exec(node.nodeValue))) {
                regex.lastIndex = 0;
                node = handleResult(node, hits, handler.apply(this, hits));
            }
        } else if (hits = regex.exec(node.nodeValue))
            handleResult(node, hits, handler.apply(this, hits));

        function handleResult(node, hits, results) {
            let orig = node.nodeValue;
            node.nodeValue = orig.slice(0, hits.index);
            [].concat(create(mom, results)).forEach(function (n) {
                mom.insertBefore(n, nxt);
            });
            let rest = orig.slice(hits.index + hits[0].length);
            return rest && mom.insertBefore(doc.createTextNode(rest), nxt);
        }

        function create(el, o) {
            if (o.map) return o.map(function (v) {
                return create(el, v)
            });
            else if (typeof o === 'object') {
                let e = doc.createElementNS(o.namespaceURI || el.namespaceURI, o.name);
                if (o.attrs) for (let a in o.attrs) e.setAttribute(a, o.attrs[a]);
                if (o.content) [].concat(create(e, o.content)).forEach(e.appendChild, e);
                return e;
            } else return doc.createTextNode(o + "");
        }
    }
}

// функция получает все тикеры по REGEXP со страницы и шлет его для обработки в background.js
function createTickerLinks() {
    console.log('TinkoffTicker extension apply custom links');
    chrome.storage.sync.get(['favourite'], result => {
        let matches = [...document.body.innerText.matchAll(SEARCH_EXP)];
        // разворачиваем многомерный массив, в [0] хранятся найденные тикеры
        let tickers = matches.reduce((previousValue, currentValue, index, array) => previousValue.concat(array[index][0]), []);
        let unique = [...new Set(tickers)];
        console.log(unique);
        port.postMessage({method: "getTickers", params: {list: unique, isFavourite: result.favourite}});
    });
}

// восстанавливаем исходную страницу, удаляем добавленные ссылки
function removeTickerLinks() {
    console.log('TinkoffTicker extension disable custom link');
}

// если в настройках плагина выбрано Замена тикеров то вызываем сразу после окончания загрузки страницы
chrome.storage.sync.get(['cosmetic'], result => {
    if (result.cosmetic) createTickerLinks();
    else removeTickerLinks();
});

// меняем контент страницы при установки \ снятии галочки
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let key in changes) {
        if (key === 'cosmetic')
            if (changes[key].newValue) createTickerLinks();
            else removeTickerLinks();
    }
});