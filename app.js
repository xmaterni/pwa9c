/*jshint esversion:11 */

const RELEASE = "0.1.7";
const SW_NAME = "/pwa9c/sw.js";

const log = function (...args) {
  console.log(...args);
};

const ualog = function (...args) {
  UaLog.log(...args);
};

const app_info = function (txt) {
  msg_prn(item0, txt);
};

const app_log = function (txt) {
  msg_prn(item1, txt);
};


"use strict";


let SW_STATE = "unregistred";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(SW_NAME)
    .then((registration) => {
      let sw = null;
      if (registration.installing) {
        sw = registration.installing;
        SW_STATE = "installing";
        log('installing');
        log(`scope: ${registration.scope}`);
      } else if (registration.waiting) {
        sw = registration.waiting;
        SW_STATE = "waiting";
        log('waiting');
      } else if (registration.active) {
        sw = registration.active;
        SW_STATE = "active";
        log('active');
        //listen to messages
        navigator.serviceWorker.onmessage = receiveMessage;
        // navigator.serviceWorker.onerror = receivesError;
      }
      if (sw) {
        sw.addEventListener("statechange", (e) => {
          log(`statechange ${e.target.state}`);
        });
      }
      const msg = ` <span>SW ${SW_NAME}</span>
      <span>(${RELEASE})</span>
      <span>${SW_STATE.toUpperCase()}</span>`;
      app_info(msg);
    })
    .catch((error) => {
      alert(`Error(0) app.js\n${SW_NAME}\n ${error}`);
    });
} else {
  alert(`Erroro(1) app.js \n${SW_NAME} not in navigator`);
}

///////////////////
//gestione messaggi
////////////////////


const receiveMessage = function (event) {
  let msg = event.data;
  try {
    const name = msg.name;
    ReceiveMessageManager[name](msg);
  }
  catch (err) {
    let j = JSON.stringify(msg);
    const s = `${err}\nmsg:${j}`;
    alert(s);
  }
};

const ReceiveMessageManager = {
  ualog: function (msg) {
    const data = msg.data;
    ualog(data);
  }
};

const postMessage = function (msg) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  } else {
    alert(`Error(4) app.js ServiceWorker not activated \n ${SW_NAME}`);
  }
};


const testMsgLog = function () {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    UaLog.log_show(data);
  };
  const name = arguments.callee.name;
  const msg = {
    name: name,
    ops: {},
    data: "Test Log"
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};

const testMsgPrn = function () {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    app_log(data);
  };
  const name = arguments.callee.name;
  const msg = {
    name: name,
    ops: {},
    data: "Test Prn"
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};

const toggleUaLog = function () {
  const name = arguments.callee.name;
  const msg = {
    name: name,
    ops: {},
    data: ""
  };
  postMessage(msg);
};

const listCacheUrls = function (call) {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    call(data);
  };
  const name = arguments.callee.name;
  const msg = {
    name: name,
    ops: {},
    data: ""
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};

const getCacheUrl = function (url, call) {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    call(data);
  };
  const name = arguments.callee.name;
  const msg = {
    name: name,
    ops: { url: url },
    data: ""
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};

const setCache = function (key, text) {
  const name = arguments.callee.name;
  const msg = {
    name: name,
    ops: { url: key },
    data: text
  };
  postMessage(msg);
};

const getCache = function (key, call) {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    call(data);
  };
  const name = arguments.callee.name;
  const msg = {
    name: name,
    ops: { key: key },
    data: ""
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};


////////////////////////////////////////////////////////

function unregist() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
function unregistAll() {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

function clearCaches() {
  caches.keys().then(function (names) {
    for (let name of names)
      caches.delete(name);
  });
}

function reset() {
  clearCaches();
  unregistAll();
  window.location.reload();
}

function reload() {
  window.location.reload();
}


