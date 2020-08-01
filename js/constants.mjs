'use strict';
export const INFO_URL = 'https://api.tinkoff.ru/v1/session_status?appName=invest_terminal&appVersion=1.0.0&sessionid=';
export const LOGIN_URL = 'https://www.tinkoff.ru/login/?redirectTo=/invest/broker_account/';
export const SIGN_OUT_URL = 'https://api.tinkoff.ru/v1/sign_out?appName=invest_terminal&appVersion=1.0.0&sessionid=';
export const HOST_URL = 'https://www.tinkoff.ru/';
export const SYMBOL_LINK = 'https://www.tinkoff.ru/invest/${securityType}/';
export const PING_URL = 'https://api.tinkoff.ru/v1/ping?sessionid=';
export const FAVORITE_URL = 'https://api.tinkoff.ru/trading/user/get_favorites?sessionId=';

export const SEARCH_URL = 'https://api.tinkoff.ru/trading/stocks/list?cpswc=true&ccc=true&deviceId=2cb59723b132726c&appVersion=4.0.2&platform=android&appName=investing&origin=mobile%2Cib5%2Cloyalty%2Cplatform&sessionId=';
export const INTERVAL_TO_CHECK = 1;//min
export const OPTION_COSMETICS = 'cosmetic';
export const OPTION_OTC = 'OTC';
export const OPTION_ISCOLOR = 'iscolor';
export const OPTION_COLOR = 'color';
export const OPTION_PRICE = 'price';
export const OPTION_FAVOURITE = 'favourite';
export const OPTION_SHORTLONG = 'shortlong';
export const OPTION_ACTIVELINK = 'activelink';
export const OPTION_ISSTYLE = 'isstyle';
export const OPTION_STYLE = 'style';
export const USD_RUB = 'USDRUB';
export const EUR_RUB = 'EURRUB';

export const PLURAL_SECURITY_TYPE = {
    Stock: 'stocks',
    Share: 'stocks',
    Currency: 'currencies',
    Bond: 'bonds',
    Bonds: 'bonds',
    ETF: 'etfs',
    Note: 'notes'
};

export let port = chrome.runtime.connect({
    name: "tcs_ticker"
});
