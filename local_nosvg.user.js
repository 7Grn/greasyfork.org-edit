// ==UserScript==
// @name         no svg
// @namespace    https://violentmonkey.github.io
// @version      1.0.1
// @description  prevents the render svg elements and deletes or hide existing svg
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

    // hook createElementNS method to prevent the creation element
    const originalCreateElementNS = document.createElementNS;
    document.createElementNS = function(namespaceURI, qualifiedName, options) {
        if (namespaceURI === "http://www.w3.org/2000/svg" || (qualifiedName && qualifiedName.toLowerCase() === 'svg')) {
            // either return a dummy element (such as a div) instead of the SVG, or return err
            return document.createElement('div');
        }
        return originalCreateElementNS.call(document, namespaceURI, qualifiedName, options);
    };

    // remove existing and dynamical added svg elements from dom storage
    const removeSvgs = () => {
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(el => el.remove());
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                removeSvgs();
                break;
            }
        }
    });

    if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    window.addEventListener('DOMContentLoaded', () => {
        removeSvgs();
    });

    // hide SVG loaded via `<img>` or `<object>`, as well as svg provided as data URI
    const style = document.createElement('style');
    style.innerHTML = `
        svg,
        img[src$=".svg"], 
        img[src^="data:image/svg+xml"],
        object[type="image/svg+xml"], 
        embed[type="image/svg+xml"] {
            display: none !important;
        }
    `;
    
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(style);
        });
    }
})();
