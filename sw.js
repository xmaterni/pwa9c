/*jshint esversion:8 */
// "use strict";

const swlog = function (txt) {
    console.log(txt);
    if (ualog_active)
        SenderMsgPush.ualog(txt);
};

const logRequest = function (request, strategy) {
    console.log("-----------------------------");
    console.log("url:" + request.url);
    console.log("destination:" + request.destination);
    // const s = JSON.stringify(request.headers);
    // console.log("SW headers:" + s);
    console.log("method:" + request.method);
    console.log("mode:" + request.mode);
    // console.log("SW cache:" + request.cache);
    const url = new URL(request.url);
    // console.log("hostname:" + url.hostname);
    // console.log("host:" + url.host);
    // console.log("port:" + url.port);
    // console.log("pathname:" + url.pathname);
    // console.log("origin:" + url.origin);
    console.log("*** strategy:" + strategy)
    console.log(".............................\n");
};


////////////////////
//dialogo app-sw
////////////////////

const CACHE_NAME = "pwa9c_1";
let ualog_active = false;

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
    const info = "";
     
    let strategy = "n";
    if (["document", "style", "image", "audio"].includes(dest))
        strategy = "cn";
    else if (["script"].includes(dest))
        strategy = "svr";
    if (mode == "cors")
        strategy = "nc";

    logRequest(event.request, strategy);

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

const cacheOnly = (event) => {
    event.respondWith(caches.open(CACHE_NAME)
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

//////////////////////
// gestione messaggi
///////////////////////


self.addEventListener('message', (event) => {
    try {
        const cli_msg = event.data;
        const sw_fn = cli_msg.sw_fn;
        console.log("cli_msg:" + cli_msg);
        SenderMsgRsp[sw_fn](cli_msg, event);
    }
    catch (err) {
        console.error(err);
    }
});

const SenderMsgRsp = {
    buildMessage: function (cli_msg, cli_fn_arg = null, cli_fn = null) {
        let fn = cli_msg.sw_fn;
        if (!!cli_fn)
            fn = cli_fn;
        return {
            cli_fn: fn,
            cli_fn_arg: cli_fn_arg
        };
    },
    postMessage: function (message) {
        return self.clients.matchAll().then(clients => {
            clients.forEach((client) => {
                client.postMessage(message);
            });
        });
    },
    testMsgLog: function (cli_msg) {
        const cli_data = cli_msg.sw_fn_arg;
        const data = `received from client ${cli_data}`;
        const msg = this.buildMessage(cli_msg, data);
        this.postMessage(msg);
    },
    testMsgPrn: function (cli_msg, event) {
        const cli_data = cli_msg.sw_fn_arg;
        const data = `received from client ${cli_data}`;
        const msg = this.buildMessage(cli_msg, data);
        // this.postMessage(sw_msg);
        event.source.postMessage(msg);
    },
    toggleUaLog: function (cli_msg) {
        ualog_active = !ualog_active;
    },
    listCacheUrls: function (cli_msg, event) {
        swlog("readCache");
        return caches.open(CACHE_NAME).then((cache) => {
            return cache.keys();
        }).then((requests) => {
            const lst = [];
            for (let rqs of requests)
                lst.push(rqs.url);
            return lst;
        }).then((urls) => {
            const msg = this.buildMessage(cli_msg, urls);
            event.source.postMessage(msg);
        });
    },
    readCacheUrl: function (cli_msg, event) {
        swlog("readCacheUrl");
        const url = cli_msg.sw_fn_arg;
        return caches.open(CACHE_NAME).then((cache) => {
            // const ops = {
            //     ignoreSearch: true,
            //     ignoreMethod: true,
            //     ignoreVary: true
            // };
            return cache.match(url);
        }).then((response) => {
            return response.json();
        }).then((json) => {
            const msg = this.buildMessage(cli_msg, json);
            event.source.postMessage(msg);
        });
    },
    setCache: function (cli_msg) {
        const arg = cli_msg.sw_fn_arg;
        const url = arg.url;
        const text = arg.text;
        caches.open(CACHE_NAME)
            .then((cache) => {
                const rqs = new Request(url);
                const rsp = new Response(text);
                cache.put(rqs, rsp);
            });
    },
    getCache: function (cli_msg, event) {
        swlog("getCache");
        const url = cli_msg.sw_fn_arg;
        console.log("hetCache url:" + url);
        return caches.open(CACHE_NAME).then((cache) => {
            return cache.match(url);
        }).then((response) => {
            return response.text();
        }).then((text) => {
            const msg = this.buildMessage(cli_msg, text);
            event.source.postMessage(msg);
        }).catch(() => {
            const msg = this.buildMessage(cli_msg, "");
            event.source.postMessage(msg);
        });
    }
};

const SenderMsgPush = {
    buildMessage: (cli_fn, cli_fn_arg = null) => {
        return {
            cli_fn: cli_fn,
            cli_fn_arg: cli_fn_arg
        };
    },
    postMessage: (message) => {
        return self.clients.matchAll().then(clients => {
            clients.forEach((client) => {
                client.postMessage(message);
            });
        });
    },
    ualog: function (text) {
        const sw_msg = this.buildMessage("ualog", text);
        this.postMessage(sw_msg);
    }
};







