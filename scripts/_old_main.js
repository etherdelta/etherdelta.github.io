define(function loader1 (require) {
    const miscmodules = require('lib/miscmodules')

function loader (mainModuleLoaderFunc) {
    if ('object' == typeof exports && 'undefined' != typeof module) {
        console.warn('found exports + module (CommonJS module support)')
        module.exports = mainModuleLoaderFunc();
    }
    else if ('function' == typeof define && define.amd) {
        console.warn('found define function (AMD module support)')
        //define([], mainModuleLoaderFunc);
        define([], mainModuleLoaderFunc);
    }
    else {
        console.warn('No module support, attaching main function to browser window')
        ('undefined' != typeof window
            ? window
            : 'undefined' != typeof global ? global : 'undefined' != typeof self ? self : this
        ).main = mainModuleLoaderFunc();
    }
}

function loadMainModule () {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(moduleName, u) {
            console.warn('SSSSS:', moduleName, ',', u);
            if (!n[moduleName]) {
                if (!t[moduleName]) {
                    var requireImpl = 'function' == typeof require && require;
                    if (!u && requireImpl) return requireImpl(moduleName, !0);
                    if (i) return i(moduleName, !0);
                    var f = new Error("Cannot find module '" + moduleName + "'");
                    throw ((f.code = 'MODULE_NOT_FOUND'), f);
                }
                var l = (n[moduleName] = { exports: {} });
                t[moduleName][0].call(
                    l.exports,
                    function requireShimFunc (e) {
                        console.warn('requireShimFunc:', e);
                        var n = t[moduleName][1][e];
                        return s(n || e);
                    },
                    l,
                    l.exports,
                    e,
                    t,
                    n,
                    r
                );
            }
            return n[moduleName].exports;
        }
        for (var i = 'function' == typeof require && require, moduleNumber = 0; moduleNumber < r.length; moduleNumber++) {
            s(r[moduleNumber]);
        }
        return s;
    })(
        miscmodules,
        {},
        [555]
    )(555);
}

loader(loadMainModule());

})