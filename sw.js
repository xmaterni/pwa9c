/*jshint esversion:8 */

const swlog = function (txt) {
    console.log(txt);
    if (clilog_active)
        MessagePusher.ualog(txt);
};

const logRequest = function (request, strategy) {
    console.log("-----------------------------");
    const url = new URL(request.url);
    // console.log("hostname:" + url.hostname);
    // console.log("host:" + url.host);
    // console.log("port:" + url.port);
    console.log("pathname:" + url.pathname);
    // console.log("origin:" + url.origin);

    // console.log("url:" + request.url);
    console.log("destination:" + request.destination);
    // const s = JSON.stringify(request.headers);
    // console.log("SW headers:" + s);
    // console.log("method:" + request.method);
    console.log("mode:" + request.mode);
    // console.log("SW cache:" + request.cache);

    console.log("*** strategy:" + strategy);
    console.log(".............................\n");
};

"use strict";  //jshint ignore:line

////////////////////
//dialogo app-sw
////////////////////

const CACHE_NAME_SW = "pwa9c_1";
let clilog_active = false;

const config = {
    version: "sw_3",
    staticCacheItems: [
        "/pwa9c/index.html",

        "/pwa9c/style.less",
        "/pwa9c/menu_h.less",
        "/pwa9c/uajs/less.js",
        // "/pwa9c/style.css",
        // "/pwa9c/menu_h.css",

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

///////////////////////
// fetch
///////////////////////
/*
destination:
audio, audioworklet, document, embed, font, frame, 
iframe, image, manifest, object, paintworklet, 
report, script, sharedworker, style, track, video, 
worker or xslt strings, 
or the empty string, which is the default value.
*/
self.addEventListener('fetch', (event) => {
    const dest = event.request.destination;
    const mode = event.request.mode;
    const info = event.request.url;

    let strategy = "n";
    if (["document", "style", "image", "audio"].includes(dest))
        strategy = "cn";
    else if (["script"].includes(dest))
        strategy = "svr";
    if (mode == "cors")
        strategy = "nc";

    // logRequest(event.request, strategy);

    if (strategy == "n") {
        swlog(`network only (${info})`);
        return networkOnly(event);
    }
    else if (strategy == "nc") {
        swlog(`network first (${info})`);
        return networkFirst(event);
    }
    else if (strategy == "cn") {
        swlog(`cache first (${info})`);
        return cacheFirst(event);
    }
    else if (strategy == "svr") {
        swlog(`staleWhileRevalidate (${info})`);
        return staleWhileRevalidate(event);
    }
    else {
        console.err("fetch null");
        return;
    }
});

const networkOnly = (event) => {
    swlog("networkOnly");
    event.respondWith(fetch(event.request));
};

const networkFirst = (event) => {
    event.respondWith(fetch(event.request)
        .then((networkResponse) => {
            swlog("networkFirst net");
            return caches.open(CACHE_NAME_SW)
                .then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
        })
        .catch(() => {
            swlog("networkFirst cache");
            return caches.match(event.request);
        })
    );
};


const cacheFirst = (event) => {
    event.respondWith(caches.open(CACHE_NAME_SW)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        swlog("cacheFirst cache");
                        return cachedResponse;
                    }
                    return fetch(event.request)
                        .then((fetchedResponse) => {
                            swlog("cacheFirst net");
                            cache.put(event.request, fetchedResponse.clone());
                            return fetchedResponse;
                        });
                });
        }));
};

const cacheOnly = (event) => {
    event.respondWith(caches.open(CACHE_NAME_SW)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        swlog("cacheOnly cache");
                        return cachedResponse;
                    }
                });
        }));
};

//cache first and network update cache 
//else 
//network and update cache)
const staleWhileRevalidate = (event) => {
    event.respondWith(caches.open(CACHE_NAME_SW)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        swlog("staleWhileRevalidate cache");
                        fetch(event.request)
                            .then((networkResponse) => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        return cachedResponse;
                    }
                    else {
                        swlog("staleWhileRevalidate net");
                        return fetch(event.request)
                            .then((networkResponse) => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                    }
                });
        }));
};

/////////////////////
//cache setter/getter
//////////////////////

const CacheManager = {
    set: function (key, data, cache_key = null) {
        const cache_name = cache_key || CACHE_NAME_SW;
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
    getText: function (key, cache_key = null) {
        const cache_name = cache_key || CACHE_NAME_SW;
        return caches.open(cache_name).then((cache) => {
            return cache.match(key);
        }).then((response) => {
            return response.text();
        }).catch(() => {
            return "";
        });
    },
    getJson: function (key, cache_key = null) {
        const cache_name = cache_key || CACHE_NAME_SW;
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








