/*jshint esversion:8 */

// class CX {
//     method1() {
//         console.log("1");
//     }
//     method2(s) {
//         // this['method1']();
//         console.log("2"+s);
//     }
// }
// let x = new CX();
// x['method2']();
// const m = "method2";
// x[m](" LILLO");

// FX = function () {
const w = {
    method1: (s) => {
        console.log("1" + s);
    },
    method2: (s) => {
        w.method1('XXXX');
        console.log("2" + s);
    }
};
//     return w;
// };
// const w = FX();
w.method2("lillo");
const m = "method2";
w[m](" LILLO");

