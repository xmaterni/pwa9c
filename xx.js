/*jshint esversion:8 */

let a = 0;
const s = a || "pippo";
const n = a || 100;
const ss = a ?? "pippo";
const nn = a ?? 100;

console.clear();
console.log(s);
console.log(n);
console.log(ss);
console.log(nn);
