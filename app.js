/*jshint esversion:11 */

// console.log=()=>{};
// console.eror=()=>{};


const RELEASE = "0.1.7";
const SW_NAME = "/pwa9c/sw.js";

const ualog = function (...args) {
  UaLog.log(...args);
};

const app_info = function (txt) {
  msg_prn(item0, txt);
};

const app_log = function (txt) {
  msg_prn(item1, txt);
};


"use strict"; //jshint ignore:line


let SW_STATE = "unregistred";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(SW_NAME)
    .then((registration) => {
      let sw = null;
      if (registration.installing) {
        sw = registration.installing;
        SW_STATE = "installing";
        console.log('installing');
        console.log(`scope: ${registration.scope}`);
      } else if (registration.waiting) {
        sw = registration.waiting;
        SW_STATE = "waiting";
        console.log('waiting');
      } else if (registration.active) {
        sw = registration.active;
        SW_STATE = "active";
        console.log('active');
        //listen to messages
        navigator.serviceWorker.onmessage = receiveMessage;
        // navigator.serviceWorker.onerror = receivesError;
      }
      if (sw) {
        sw.addEventListener("statechange", (e) => {
          console.log(`statechange ${e.target.state}`);
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
    const methods = Object.getOwnPropertyNames(ReceiversMessage);
    if (!methods.includes(name)) {
      const s = JSON.stringify(msg);
      const err = `ERROR receiveMessage\nmessage:${s} `;
      alert(err);
      return;
    }
    ReceiversMessage[name](msg);
  }
  catch (err) {
    let j = JSON.stringify(msg);
    const s = `${err}\nmsg:${j}`;
    alert(s);
  }
};

const ReceiversMessage = {
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
  const msg = {
    name: "testMsg",
    ops: {},
    data: "Test Msg Log"
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};

const testMsgPrn = function () {
  const msg = {
    name: "testMsg",
    ops: {},
    data: "Test Msg Prn"
  };
  navigator.serviceWorker.onmessage = (event) => {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    app_log(data);
  };
  postMessage(msg);
};

const toggleLogSW = function () {
  const name = toggleLogSW.name;
  const msg = {
    name: name,
    ops: {},
    data: ""
  };
  postMessage(msg);
};

const cacheKeys = function (call) {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    call(data);
  };
  const name = cacheKeys.name;
  const msg = {
    name: name,
    ops: {},
    data: ""
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};

const setCache = function (key, text, cacche_name = null) {
  const msg = {
    name: setCache.name,
    ops: {
      key: key,
      cache_name: cacche_name
    },
    data: text
  };
  postMessage(msg);
};

const getCacheText = function (key, call, cache_name = null) {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    call(data);
  };
  const msg = {
    name: getCacheText.name,
    ops: {
      key: key,
      cache_name: cache_name
    },
    data: ""
  };
  navigator.serviceWorker.onmessage = fn;
  postMessage(msg);
};

const getCacheJson = function (key, call, cache_name = null) {
  const fn = function (event) {
    navigator.serviceWorker.onmessage = receiveMessage;
    const msg = event.data;
    const data = msg.data;
    call(data);
  };
  const msg = {
    name: getCacheJson.name,
    ops: {
      key: key,
      cache_name: cache_name
    },
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
  // window.location.reload();
}

function reload() {
  window.location.reload();
}


