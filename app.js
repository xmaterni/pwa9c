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
        navigator.serviceWorker.onmessage = receivesMessage;
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


const receivesMessage = function (event) {
  try {
    const sw_msg = event.data;
    const cli_fn = sw_msg.cli_fn;
    ReceiveMsgRsp[cli_fn](sw_msg);
  }
  catch (err) {
    msg = `${err}`;
    alert(msg);
  }
};

const ReceiveMsgRsp = {
  ualog: function (sw_msg) {
    ualog(sw_msg.cli_fn_arg);
  },
  testMsgLog: function (sw_msg) {
    const data = sw_msg.cli_fn_arg;
    ualog(data);
  },
  testMsgPrn: function (sw_msg) {
    const data = sw_msg.cli_fn_arg;
    app_log(data);
  },
  readCacheSW: function (sw_msg) {
    const data = sw_msg.cli_fn_arg || [];
    showList(data);
  },
  readCacheUrl: function (sw_msg) {
    const data = sw_msg.cli_fn_arg || {};
    const s = JSON.stringify(data);
    msg_prn(item1, s);
  },
  getCache: function (sw_msg) {
    const data = sw_msg.cli_fn_arg || "";
    ualog(data);
    msg_prn(item1, data);
  },
};

////////////////////////////////////
const postMessageToSW = function (msg) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  } else {
    alert(`Error(4) app.js ServiceWorker not activated \n ${SW_NAME}`);
  }
};

const buildMessageCli = function (sw_fn, sw_fn_arg = null) {
  return {
    sw_fn: sw_fn,
    sw_fn_arg: sw_fn_arg
  };
};

///////////////////////

const testMsgLog = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name, "Test Log");
  postMessageToSW(msg);
};

const testMsgPrn = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name, "Test Prn");
  postMessageToSW(msg);
};

const toggleUaLog = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name);
  postMessageToSW(msg);
};

const readCacheSW = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name);
  postMessageToSW(msg);
};

const getCacheUrl = function () {
  // const url="http://127.0.0.1:5501/pwa9c/data/anag.json";
  const url = "/pwa9c/data/anag.json";
  const cli_msg = buildMessageCli("readCacheUrl", url);
  postMessageToSW(cli_msg);
};

const putCache = function () {
  const msg = buildMessageCli("putCache", "Prova con Camomilla");
  postMessageToSW(msg);
};

const getCache = function () {
  const url = "/pwa9c/data/test.xxx";
  const cli_msg = buildMessageCli("getCache", url);
  postMessageToSW(cli_msg);
};

////////////////////////////////////////

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


