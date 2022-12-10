/*jshint esversion:8 */

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
      let sw;
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
        // navigator.serviceWorker.onmessage = (event) => {
        //   receivesMessage(event);
        // };
      }
      if (sw) {
        sw.addEventListener("statechange", (e) => {
          log(`statechange ${e.target.state}`);
        });
      }
      const msg = `SW ${SW_NAME}
      &nbsp;&nbsp;&nbsp;&nbsp;(${RELEASE})&nbsp;&nbsp;&nbsp;&nbsp;
      ${SW_STATE.toUpperCase()}`;
      app_info(msg);
    })
    .catch((error) => {
      alert(`Error(0) app.js\n${SW_NAME}\n ${error}`);
    });
} else {
  alert(`Erroro(1) app-js \n${SW_NAME} not in navigator`);
}

///////////////////
//gestione messaggi
////////////////////

const receivesMessage = function (event) {
  if (!event.data) {
    alert("event.data null");
    return;
  }
  try {
    const sw_msg = event.data;
    const cli_fn = sw_msg.cli_fn;
    SW_FUNCS[cli_fn](sw_msg);
  }
  catch (e) {
    const s = `ERROR receiveMessage(event)
      event_data:${event_data}`;
    alert(s);
  }

};

const CLI_FUNCS = {
  default_response: (sw_msg) => {
    s = `default_response\n
    sw_msg:${sw_msg}`;
    alert(s);
  },
  swlog: (sw_msg) => {
    ualog(sw_msg.cli_fn_arg);
  },
  testMsgLog_response: (sw_msg) => {
    testMsgLog_response(sw_msg);
  },
  testMsgPrn_response: (sw_msg) => {
    testMsgPrn_response(sw_msg);
  },
  readCache_response: (sw_msg) => {
    readCache_response(sw_msg);
  },
  readCacheUrlRsp: (sw_msg) => {
    readCacheUrlRsp(sw_msg);
  }
};

const postMessageToWorker = function (msg) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  } else {
    alert(`Error(4) app.js ServiceWorker not activated \n ${SW_NAME}`);
  }
};

const buildMessageCli = function (sw_fn, sw_fn_arg = null, cli_fn = null) {
  return {
    sw_fn: sw_fn,
    sw_fn_arg: sw_fn_arg,
    cli_fn: cli_fn
  };
};

const testMsgLog = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name, "Test Log");
  postMessageToWorker(msg);
};

const testMsgLog_response = function (sw_msg) {
  const data = sw_msg - cli_fn_arg;
  ualog(data);
};


const testMgPrn = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name, "Test Prn");
  postMessageToWorker(msg);
};

const testMsgPrn_response = function (sw_msg) {
  const data = sw_msg - cli_fn_arg;
  app_log(data);
};

const toggleUaLog = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name);
  postMessageToWorker(msg);
};

const readCacheSW = function () {
  const fn_name = arguments.callee.name;
  const msg = buildMessageCli(fn_name, null, "showReadCacheRsp");
  postMessageToWorker(msg);
};

const readCacheSW_response = function (sw_msg) {
  const data = sw_msg.cli_fn_arg || [];
  showList(data);
};

// const testFn = function () {
//   navigator.serviceWorker.onmessage = (event) => {
//     const sw_msg = event.data;
//     const data = sw_msg.cli_fn_arg || {};
//     const s = JSON.stringify(data);
//     msg_prn(item1, s);
//   };
//   // const url="http://127.0.0.1:5501/pwa9c/data/anag.json";
//   const url = "/pwa9c/data/anag.json";
//   // const fn_name = arguments.callee.name;
//   const msg = buildMessageCli(null, url,"readCacheUrl");
//   postMessageToWorker(msg);
// };


const testFn = function () {
  // const url="http://127.0.0.1:5501/pwa9c/data/anag.json";
  const url = "/pwa9c/data/anag.json";
  const cli_msg = buildMessageCli("readCacheUrl", url,"readCaceUrlRsp");
  postMessageToWorker(cli_msg);
};

const readCacheUrlRsp= function (sw_msg) {
  const data = sw_msg.cli_fn_arg || {};
  const s = JSON.stringify(data);
  msg_prn(item1, s);
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
  reload();
}

function reload() {
  window.location.reload();
}


