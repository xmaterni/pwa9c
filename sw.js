/*jshint esversion:8 */
// "use strict";

const swlog = function (txt) {
    console.log(txt);
    if (ualog_status) {
        // const msg = buildPushMsgToClients(txt, "log");
        const sw_msg = buildMessagesSW(null, txt, "swlog");
        postMessageToClients(sw_msg);
    }
};

const logRequest = function (request) {
    swlog("-----------------------------");
    swlog("url:" + request.url);
    swlog("destination:" + request.destination);
    // const s = JSON.stringify(request.headers);
    // swlog("SW headers:" + s);
    swlog("method:" + request.method);
    swlog("mode:" + request.mode);
    // swlog("SW cache:" + request.cache);
    const url = new URL(request.url);
    // swlog("hostname:" + url.hostname);
    // swlog("host:" + url.host);
    // swlog("port:" + url.port);
    swlog("pathname:" + url.pathname);
    swlog("origin:" + url.origin);
    swlog(".............................");
};


////////////////////
//dialogo app-sw
////////////////////

const CACHE_NAME = "pwa9c_1";
let ualog_status = true;

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
    event.waitUntil(caches.open(CACHE_NAME)
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
                    if (cache_key !== CACHE_NAME) {
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
self.addEventListener('fetch', (event) => {
    // logRequest(event.request);
    const dest = event.request.destination;
    const mode = event.request.mode;
    const info = "";
    // 
    let strategy = "n";
    if (["document", "style", "image", "audio"].includes(dest))
        strategy = "cn";
    else if (["script"].includes(dest))
        strategy = "svr";
    if (mode == "cors")
        strategy = "nc";
    // 
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
        swlog("fetch null");
        return;
    }
});

const networkOnly = (event) => {
    event.respondWith(fetch(event.request));
};

const networkFirst = (event) => {
    event.respondWith(fetch(event.request)
        .then((networkResponse) => {
            swlog("networkFirst net");
            return caches.open(CACHE_NAME)
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
    event.respondWith(caches.open(CACHE_NAME)
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


//cache first and network update cache 
//else 
//network and update cache)
const staleWhileRevalidate = (event) => {
    event.respondWith(caches.open(CACHE_NAME)
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

/////////////////////////
// gestione messaggi
///////////////////////
// self.addEventListener('message', (event) => {
//     if (event.data) {
//         const rqs = event.data || {};
//         const rqs_cmd = rqs.rqs_cmd || "none";
//         const rqs_data = rqs.rqs_data || "";
//         if (rqs_cmd == "test") {
//             const data = `received from client ${rqs_data}`;
//             const msg = buildRspMsgToClients(data, rqs);
//             postMessageToClients(msg);
//         }
//         else if (rqs_cmd == "toggle_ualog") {
//             ualog_status = !ualog_status;
//         }
//         else if (rqs_cmd == "read_cache") {
//             const fn = "readCache";
//             SW_FUNCS[fn](rqs);
//         }
//         else if (rqs_cmd == "read_cache_url") {
//             const fn = "readCacheUrl";
//             SW_FUNCS[fn](rqs,rqs_data);
//         }
//         else {
//             const s = `SW Error listener(messag)<br>
//              rqs_cmd: ${rqs_cmd} Not Found.`;
//             swlog(s);
//         }
//     }
// });


self.addEventListener('message', (event) => {
    if (event.data) {
        try {
            const cli_msg = event.data | {};
            const sw_fn = cli_msg.sw_fn;
            SW_FUNCS[sw_fn](cli_msg);
        }
        catch (e) {
            const s = ` 
            SW ERROR addEventListener(messag)\n
            ${err}\n
            event.data: ${event.data} `;
            swlog(s);
        }
    }
});


const SW_FUNCS = {
    testMsgLog: (cli_msg) => {
        testMsgLog(cli_msg);
    },
    testMsgPrn: (cli_msg) => {
        testMsgPrn(cli_msg);
    },
    toggleUaLog: (cli_msg) => {
        toggleUaLog(cli_msg);
    },
    readCache: (cli_msg) => {
        readCache(cli_msg);
    },
    readCacheUrl: (cli_msg) => {
        readCacheUrl(cli_msg);
    }
};

// const postMessageToClients = function (message) {
//     return self.clients.matchAll().then(clients => {
//         return Promise.all(clients.map(client => {
//             return client.postMessage(message);
//         }));
//     });
// };
const postMessageToClients = function (message) {
    return self.clients.matchAll().then(clients => {
        clients.forEach((client) => {
            client.postMessage(message);
        });
    });
};

const buildMessagesSW = function (msg_cli, cli_fn = null, cli_fn_arg = null) {
    let fn = "deafult_response";
    if (!!msg_cli.cli_fn)
        fn = msg_cli.cli_fn + "_rresponse";
    if (!!cli_fn)
        fn = cli_fn;
    return {
        cli_fn: fn,
        cli_fn_arg: cli_fn_arg
    };
};

const testMsgLog = function (cli_msg) {
    const cli_data = cli_msg.sw_fn_arg;
    const data = `received from client ${cli_data}`;
    const sw_msg = buildMessagesSW(cli_msg, null, data);
    postMessageToClients(sw_msg);
};

const testMsgPrn = function (cli_msg) {
    const cli_data = cli_msg.sw_fn_arg;
    const data = `received from client ${cli_data}`;
    const sw_msg = buildMessagesSW(cli_msg, null, data);
    postMessageToClients(sw_msg);
};

const toggleUaLog = function (msg_cli) {
    ualog_status = !ualog_status;
};

const readCache = (cli_msg) => {
    swlog("readCache");
    return caches.open(CACHE_NAME).then((cache) => {
        return cache.keys();
    }).then((requests) => {
        const lst = [];
        for (let rqs of requests)
            lst.push(rqs.url);
        return lst;
    }).then((urls) => {
        const sw_msg = buildMessagesSW(cli_msg, null, urls);
        // event.source.postMessage(msg);
        postMessageToClients(sw_msg);
    });
};

// const ops = {
//     ignoreSearch: true,
//     ignoreMethod: true,
//     ignoreVary: true
// };

const readCacheUrl = (cli_msg,) => {
    swlog("readCacheUrl");
    const url = cli_msg.sw_fn_arg;
    return caches.open(CACHE_NAME).then((cache) => {
        console.log(url);
        return cache.match(url);
    }).then((response) => {
        return response.json();
    }).then((json) => {
        const msg = buildMessagesSW(cli_msg, null, json);
        // event.source.postMessage(msg);
        postMessageToClients(msg);
    });
};

