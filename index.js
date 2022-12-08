/* jshint esversion: 8 */
const item0 = "item0";
const item1 = "item1";

const msg_prn = function (id, txt) {
    document.getElementById(id).innerHTML = txt;
};

const msg_log = function (id, txt) {
    const h0 = document.getElementById(id).innerHTML;
    const h1 = h0 + "<br>" + txt;
    document.getElementById(id).innerHTML = h1;
};

const msg_clear = function (id) {
    document.getElementById(id).innerHTML = '';
};


const fn0 = function () {
    fetch("data/anag.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            msg_prn(item1, response.type);
            msg_log(item1, response.url);
            msg_log(item1, response.status);
            msg_log(item1, response.statusText);
            msg_log(item1, response.ok);
            return response.text();
        })
        .then(function (text) {
            msg_log(item1, text);
        })
        .catch(function (err) {
            alert("fn0\n " + err);
        });
};

const fn1 = function () {
    fetch("data/anag.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            const fnh = (d) => {
                return `
                <br/> 
                anagid:${d.anagid}<br/> 
                cognome:${d.cognome}<br/> 
                nome:${d.nome}<br/> 
                 `;
            };
            const html = UaJthl().set_template(fnh).append(data).text();
            msg_prn(item1, html);
        })
        .catch(function (err) {
            alert("fn1\n " + err);
        });
};

const fn2 = function () {
    fetch("data/anag20.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            const template = (d, i) => {
                return `<br>
                ${i}&nbsp;  ${d.id} ${d.cognome} ${d.nome}
                <br/>`;
            };
            const jt = UaJthl().set_template(template);
            jt.append_json_array(data, 1);
            const html = jt.html();
            msg_prn(item1, html);
        })
        .catch(function (err) {
            alert("fn2\n " + err);
        });
};

const fn3 = function () {
    const msg = buildMessageToWorker("test", "prn", "Test Prn");
    postMessageToWorker(msg);
};


const fn4 = function () {
    const msg = buildMessageToWorker("test", "log", "Test Log");
    postMessageToWorker(msg);
};

const fn5 = function (name) {
    document.getElementById(item1).innerHTML = "";
    const img = document.createElement("img");
    img.src = "/pwa9c/imgs/" + name + ".jpg";
    // img.style.height = "100%";
    img.style.width = "100%";
    document.getElementById(item1).appendChild(img);
    const audio = new Audio("/pwa9c/sounds/" + name + ".mp3");
    audio.play();
};

//blocca-sblocca menu
const fix_unfix_menu = function () {
    const e = document.querySelector("div.menu-boxes");
    e.classList.toggle("menu-test");
};

const showList = function (lst) {
    const templ = (d) => {
        return `
        <li>${d}</li>
        `;
    };
    const jt = UaJthl().set_template(templ);
    jt.append_html("<div class='list'><ul>");
    for (let item of lst)
        jt.append(item);
    jt.append_html("</ul></div>");
    const t = jt.text();
    const item1 = document.getElementById("item1");
    item1.innerHTML = t;

    // const l=item1.querySelector(".list");
    // UaDrag(l);
    // const wnd = UaWindowAdm.create("list_");
    // wnd.drag();
    // wnd.setXY(100,100);
    // wnd.setHtml(t).show();
};