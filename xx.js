/*jshint esversion:8 */

const fnx=function(v){
    const n=arguments.callee.name;
    console.log(v);
    console.log(n);
};

fnx("pippo");