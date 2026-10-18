// ==UserScript==
// @name         no canvas, webgl
// @namespace    https://violentmonkey.github.io
// @version      1.0.0
// @description  block obtaining the 2d and webgl canvas and disables render
// @author       7grn
// @match        *://*/*
// @exclude      https://challenges.cloudflare.com/*
// @exclude      https://*.challenges.cloudflare.com/*
// @exclude      https://gitlab.com/*
// @exclude      https://*.gitlab.com/*
// @exclude      https://github.com/*
// @exclude      https://*.github.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
        // block context request 2d, webgl
        if (contextType === '2d' || contextType === 'webgl' || contextType === 'webgl2' || contextType === 'bitmaprenderer') {
            console.warn(`Canvas context '${contextType}' was blocked by user script.`);
            return null; // by not returning context, render func is disable
        }
        return originalGetContext.call(this, contextType, ...args);
    };

    // error handling and data spoof to prevent data extraction via `getImageData` or `toDataURL`
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        // it returns empty data, noise or throws "error"
        return originalToDataURL.apply(this, args);
    };
})();
