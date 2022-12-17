/*jshint esversion:11 */

// console.log=()=>{};
// console.eror=()=>{};


const RELEASE = "0.1.7";
const SW_NAME = "/pwa9c/sw.js";

const ualog = function (...args) {
  UaLog.log(...args);
};

const app_log = function (txt) {
  msg_prn(item1, txt);
};

const app_info = function (sw_name, release, state) {
  const txt = ` 
  <span class="info">
  <span>SW ${sw_name}</span>
  <span>(${release})</span>
  <span>${state.toUpperCase()}</span>
  </span>
  `;
  msg_prn(item0, txt);
};


"use strict"; //jshint ignore:line



// This variable will save the event for later use.
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevents the default mini-infobar or install dialog from appearing on mobile
  e.preventDefault();
  // Save the event because you'll need to trigger it later.
  deferredPrompt = e;
  // Show your customized install prompt for your PWA
  // Your own UI doesn't have to be a single element, you
  // can have buttons in different locations, or wait to prompt
  // as part of a critical journey.
  // showInAppInstallPromotion();
  alert("APP");
});



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
        navigator.serviceWorker.onmessage = receiveMessage;
      }
      if (sw) {
        sw.addEventListener("statechange", (e) => {
          console.log(`statechange ${e.target.state}`);
        });
      }
      app_info(SW_NAME, RELEASE, SW_STATE);
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


///////////////////////////////////


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
      registration.unregister().then((boolean) => {
        console.log("unregist:", boolean);
      });
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
  unregist();
  app_info(SW_NAME, RELEASE, "unregistred");
}

function reload() {
  window.location.reload();
}


