/*jshint esversion:8 */

////////////////////
//dialogo app-sw
////////////////////
/*
REQUEST => buildRspMsgToClients
rqs_cmd:test
  rsp_cmd:log
  rsp_cmd:prn
rqs_cmd:toggle_ualog
rqs_cmd:read_cache
 
PUSH  => buildPushMsgToClients 
rqs_cmd=push (simulato)
    rsp_cmd=log (SW)

    */

const RELEASE = "0.1.3";
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
        navigator.serviceWorker.onmessage = receivesMessage;
        SW_STATE = "active";
        log('active');
      }
      if (sw) {
        sw.addEventListener("statechange", (e) => {
          log('statechange', e.target.state);
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

const json2str = function (js, ln = '\n') {
  const es = Object.entries(js);
  const lst = es.map((kv) => `${kv[0]}:${kv[1]}`);
  return lst.join(ln);
};


const buildMessageToWorker = function (rqs_cmd, rsp_cmd = "", data = "") {
  const msg = {
    rqs_cmd: rqs_cmd,
    rsp_cmd: rsp_cmd,
    rqs_data: data
  };
  return msg;
};

//post message to worker
const postMessageToWorker = function (msg) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  } else {
    alert(`Error(4) app.js ServiceWorker not activated \n ${SW_NAME}`);
  }
};


const receivesMessage = function (event) {
  const msg = event.data;
  const rqs_cmd = msg.rqs_cmd || "";
  const rsp_cmd = msg.rsp_cmd || "";
  const rsp_data = msg.rsp_data || "";

  if (rqs_cmd == "push") {
    if (rsp_cmd == "log") {
      ualog(rsp_data);
    }
    else {
      const s = `ReceiveMessage Error 
      rqs_cmd:push
      rsp_cmd:${rsp_cmd} Not Found`;
      alert(s);
    }
  }
  // 
  else if (rqs_cmd == "test") {
    if (rsp_cmd == "log") {
      ualog(rsp_data);
    }
    else if (rsp_cmd == "prn") {
      app_log(rsp_data);
    }
  }
  else if (rqs_cmd == "read_cache") {
    if (rsp_cmd == "testFn") {
      testFnRsp(msg);
    }
    else {
      showReadCacheRsp(msg);
    }
  }
  else if (rqs_cmd == "read_cache_url") {
    testFnRspShow(msg);
  }
  else {
    const s = `ReceiveMessage Error 
    rqs_cmd:${rqs_cmd} Not Found`;
    alert(s);
  }

};

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

function toggleUaLog() {
  const msg = buildMessageToWorker("toggle_ualog");
  postMessageToWorker(msg);
}

function readCacheSW() {
  const msg = buildMessageToWorker("read_cache",);
  postMessageToWorker(msg);
  // => showReadCacheResp(msg_rsp)
}

function showReadCacheRsp(msg) {
  const rsp_data = msg.rsp_data || [];
  showList(rsp_data);
  // const html = json2str(rsp_data, "<br>");
  // app_log(html);
}

function testFn() {
  const msg = buildMessageToWorker("read_cache", "testFn");
  postMessageToWorker(msg);
  // => testFnRsp(msg_rsp)
}

function testFnRsp(msg) {
  const urls = msg.rsp_data || [];
  let url = "";
  for (let u of urls) {
    if (u.indexOf("20") > -1) {
      url = u;
      break;
    }
  }
  const msg2 = buildMessageToWorker("read_cache_url", "", url);
  postMessageToWorker(msg2);
  //=> testFnRspShow
}

function testFnRspShow(msg) {
  const rsp_data = msg.rsp_data || [];
  msg_prn(item1, rsp_data);
}