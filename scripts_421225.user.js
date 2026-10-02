// ==UserScript==
// @name        Disable WebGL API (edit)
// @description Disables WebGL support, keeping only basic 2D canvas. That reduces potential exploits via OpenGL and broken drivers but can break many websites requiring OpenGL. Some most common ones are excluded. 
// @namespace   disablewebglapi
// @author      k3abird / 7grn(for exclude mihoyo webgl, webgpu page)
// @include     *
// @exclude     https://*.google.com/*
// @exclude     https://github.com/*
// @exclude     https://www.shadertoy.com/*
// @exclude     https://www.youtube.com/*
// @exclude     https://act.hoyolab.com/*
// @exclude     https://act.hoyoverse.com/*
// @exclude     https://act.miyoushe.com/*
// @exclude     https://act-webstatic.hoyoverse.com*
// @exclude     https://webstatic.hoyoverse.com/*
// @version     1.0.edit.2
// @run-at      document-start
// ==/UserScript==
(function() {
    console.log("disable-webgl-api: will remove canvas and webGL support");

    const kb_canvas_getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(name) {
        if (name == "webgl" || name == "experimental-webgl" || name == "webgl2") {
            console.log("disable-webgl-api: disabled "+name)
            return null;
        }
        console.log("disable-webgl-api: allowing context of type "+name)
        return kb_canvas_getContext.apply(this, arguments);
    }
})();
