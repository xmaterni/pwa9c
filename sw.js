/*jshint esversion:11 */

// console.log=()=>{};
// console.eror=()=>{};

const swlog = function (txt) {
    console.log(txt);
    if (clilog_active)
        MessagePusher.ualog(txt);
};

"use strict";  //jshint ignore:line

const CACHE_NAME_SW = "pwa9c_3";
let clilog_active = false;

const config = {
    version: "sw_3",
    staticCacheItems: [
        // "/pwa9c/",
        "/pwa9c/index.html",

        // "/pwa9c/style.less",
        // "/pwa9c/menu_h.less",
        // "/pwa9c/uajs/less.js",
        "/pwa9c/style.css",
        "/pwa9c/menu_h.css",

        "/pwa9c/index.js",
        "/pwa9c/app.js",

        "/pwa9c/uajs/uawindow.js",
        "/pwa9c/uajs/uadrag.js",
        "/pwa9c/uajs/ualog.js",
        "/pwa9c/uajs/uajthl.js",

        "/pwa9c/icons/maskable_icon_x512.png",
        "/pwa9c/icons/maskable_icon_x384.png",
        "/pwa9c/icons/maskable_icon_x192.png",
        "/pwa9c/icons/maskable_icon_x144.png",

        "/pwa9c/icons/icon07_x512.png",
        "/pwa9c/icons/icon07_x384.png",
        "/pwa9c/icons/icon07_x192.png",
        "/pwa9c/icons/icon07_x144.png",

        "/pwa9c/imgs/fox1.jpg",
        "/pwa9c/imgs/fox2.jpg",
        "/pwa9c/imgs/fox3.jpg",
        "/pwa9c/imgs/fox4.jpg",

        "/pwa9c/sounds/fox1.mp3",
        "/pwa9c/sounds/fox2.mp3",
        "/pwa9c/sounds/fox3.mp3",
        "/pwa9c/sounds/fox4.mp3",

        "/pwa9c/data/anag.json",
        "/pwa9c/data/anag20.json",

        "/pwa9c/favicon.ico"
    ]
};

self.addEventListener('install', (event) => {
    swlog("install " + config.version);
    event.waitUntil(caches.open(CACHE_NAME_SW)
        .then((cache) => cache.addAll(config.staticCacheItems))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    swlog("activate " + config.version);
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((cache_key) => {
                    if (cache_key !== CACHE_NAME_SW) {
                        return caches.delete(cache_key);
                    }
                })
            );
        }).then(() => {
            swlog("Old caches are cleared!");
            return self.clients.claim();
        })
    );
});

// TODO log gestione errori 
// self.addEventListener('error', function (e) {
//     console.error("XXX_", e);
// });

///////////////////////
// fetch
///////////////////////
const SW_N = "n"; //networkOnly
const SW_C = "c"; //cacheOnly
const SW_NC = "nc"; //networkFirs
const SW_CN = "cn"; //cacheFirest
const SW_SVR = "svr"; //staleWhileRevalidate

const STRATEGY_NAME = {
    "n": "nwtrworkOnly",
    "c": "cacheOnly",
    "nc": "nwtrworkFirst",
    "cn": "cacheFirst",
    "svr": "staleWhileRevalidate"
};

/*
destination:
audio, audioworklet, document, embed, font, frame, 
iframe, image, manifest, object, paintworklet, 
report, script, sharedworker, style, track, video, worker 
or xslt strings or the empty string.
*/
const setStrategy = function (rqs) {
    const url = new URL(rqs.url);
    // "hostname:" + url.hostname);
    // "host:" + url.host);
    // "port:" + url.port);
    // "origin:" + url.origin);
    const dest = rqs.destination;
    const mode = rqs.mode;
    // const headers = rqs.headers;
    // const cache = rqs.cache;

    let strategy = SW_NC;
    if (["document", "image", "audio", "manifest"].includes(dest))
        strategy = SW_CN;
    else if (url.pathname.endsWith(".mp3"))
        strategy = SW_CN;
    else if (["script", "style"].includes(dest))
        strategy = SW_SVR;
    else if (url.pathname.endsWith(".less"))
        strategy = SW_SVR;
    else if (url.pathname.endsWith(".json"))
        strategy = SW_NC;
    else if (mode == "cors")
        strategy = SW_NC;
    return {
        "url": url.pathname,
        "destination": dest,
        "mode": mode,
        // "headers": JSON.stringify(headers),
        // "methos": rqs.method,
        // "cahe": cache,
        "strategy": strategy,
        "strategy_name": STRATEGY_NAME[strategy]
    };
};

self.addEventListener('fetch', (event) => {
    const rqs_info = setStrategy(event.request);
    const strategy = rqs_info.strategy;

    //TODO log strategy
    console.log(JSON.stringify(rqs_info, null, 4));

    if (strategy == SW_N)
        return networkOnly(event);
    else if (strategy == SW_NC)
        return networkFirst(event);
    else if (strategy == SW_CN)
        return cacheFirst(event);
    else if (strategy == SW_SVR)
        return staleWhileRevalidate(event);
    else {
        console.err("XXX_0 fetch null");
        return;
    }
});

const networkOnly = (event) => {
    event.respondWith(fetch(event.request));
};

const networkFirst = (event) => {
    event.respondWith(fetch(event.request)
        .then((networkResponse) => {
            console.log("networkFirst net");
            return caches.open(CACHE_NAME_SW)
                .then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    console.log("networkFirst cahae.put");
                    return networkResponse;
                });
        })
        .catch(() => {
            console.log("networkFirst cache");
            return caches.match(event.request);
        })
    );
};

/*
cahe
else
network => cache.puts
*/
const cacheFirst = (event) => {
    event.respondWith(caches.open(CACHE_NAME_SW)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("cacheFirst cache");
                        return cachedResponse;
                    }
                    return fetch(event.request)
                        .then((fetchedResponse) => {
                            console.log("cacheFirst net ");
                            if (fetchedResponse.status == 200) {
                                cache.put(event.request, fetchedResponse.clone());
                                console.log("cacheFirst cahae.put");
                            } else {
                                console.error("XXX_1 fetchFirst cache.put response:", fetchedResponse);
                            }
                            return fetchedResponse;
                        }).catch((error) => {
                            console.error("XXX_1 fetchFirst ", error);
                            return null;
                        });
                });
        }));
};

//TODO come è possibile
const cacheOnly = (event) => {
    event.respondWith(caches.open(CACHE_NAME_SW)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("cacheOnly");
                        return cachedResponse;
                    }
                });
        }));
};

/*
cache first and network update cache 
else 
network and update cache)
/*
cache => network => cache.put
else
network => cache.put
*/
const staleWhileRevalidate = (event) => {
    const url = event.request.url;
    event.respondWith(caches.open(CACHE_NAME_SW)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("staleWhileRevalidate cache");
                        //TODO gestire errore in modalita on offline ??
                        fetch(event.request)
                            .then((networkResponse) => {
                                cache.put(event.request, networkResponse.clone());
                            }).catch((error) => {
                                console.error(`"XXX_2 staleWhileRevalidate\n${url}\n`, error);
                            });

                        return cachedResponse;
                    }
                    else {
                        console.log("staleWhileRevalidate net");
                        return fetch(event.request)
                            .then((networkResponse) => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            }).catch((error) => {
                                console.error(`"XXX_3 staleWhileRevalidate\n${url}\n`, error);
                            });
                    }
                });
        }));
};

/////////////////////
//cache setter/getter
//////////////////////

const CacheManager = {
    set: function (key, data, name = null) {
        const cache_name = name || CACHE_NAME_SW;
        caches.open(cache_name)
            .then((cache) => {
                const rqs = new Request(key);
                const rsp = new Response(data);
                cache.put(rqs, rsp);
            });
    },
    // const ops = {
    //     ignoreSearch: true,
    //     ignoreMethod: true,
    //     ignoreVary: true
    // };
    getText: function (key, name = null) {
        const cache_name = name || CACHE_NAME_SW;
        return caches.open(cache_name).then((cache) => {
            return cache.match(key);
        }).then((response) => {
            return response.text();
        }).catch(() => {
            return "";
        });
    },
    getJson: function (key, name = null) {
        const cache_name = name || CACHE_NAME_SW;
        return caches.open(cache_name).then((cache) => {
            return cache.match(key);
        }).then((response) => {
            return response.json();
        }).catch(() => {
            return {};
        });
    },
    keys: function () {
        return caches.open(CACHE_NAME_SW).then((cache) => {
            return cache.keys();
        }).then((requests) => {
            const keys = [];
            for (let rqs of requests)
                keys.push(rqs.url);
            return keys;
        });
    }
};

//////////////////////
// gestione messaggi
///////////////////////
self.addEventListener('message', (event) => {
    const msg = event.data;
    const name = msg.name;
    try {
        // console.log("msg:" + JSON.stringify(msg));
        MessageResponder[name](msg, event);
    }
    catch (err) {
        const s = JSON.stringify(msg);
        const es = `${err}\nmsg:${s}`;
        console.error(es);
    }
});

const MessageResponder = {
    testMsg: function (msg, event) {
        swlog("testMsgLog");
        msg.data = `received from client ${msg.data}`;
        event.source.postMessage(msg);
    },
    toggleLogSW: function () {
        clilog_active = !clilog_active;
    },
    cacheKeys: async function (msg, event) {
        swlog("cacheKeys");
        const urls = await CacheManager.keys();
        msg.data = urls;
        event.source.postMessage(msg);
    },
    getCacheJson: async function (msg, event) {
        swlog("getCacheJson");
        const key = msg.ops.key;
        const json = await CacheManager.getJson(key);
        msg.data = json;
        event.source.postMessage(msg);
    },
    setCache: function (msg) {
        swlog("setCache");
        const key = msg.ops.key;
        const data = msg.data;
        CacheManager.set(key, data);
    },
    getCacheText: function (msg, event) {
        swlog("getCache");
        const key = msg.ops.key;
        CacheManager.getText(key)
            .then((text) => {
                msg.data = text;
                event.source.postMessage(msg);
            });
    }
};

const MessagePusher = {
    postMessage: (message) => {
        return self.clients.matchAll().then(clients => {
            clients.forEach((client) => {
                client.postMessage(message);
            });
        });
    },
    ualog: function (text) {
        const msg = {
            name: "ualog",
            ops: null,
            data: text
        };
        this.postMessage(msg);
    }
};








