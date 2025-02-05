// ==UserScript==
// @name           Fuck anti-flicker snippet(edit)
// @namespace         jasaj.me
// @match             *://*.mercari.com/*
// @match             *://*.lupicia.com/*
// @match             *://*.tonya.co.jp/*
// @match             *://*.monotaro.com/*
// @match             *://*
// @version           0.1.7.edit.2
// @description    This script is used to disable the anti-flicker snippet to bring the page load speed back to normal. (anti-flicker snippet: https://support.google.com/optimize/answer/7100284?hl=en )
// @author            Jasaj
// @downloadURL https://update.greasyfork.org/scripts/425174/%E3%83%A1%E3%83%AB%E3%82%AB%E3%83%AA%E3%81%AE%E3%83%AD%E3%83%BC%E3%83%89%E7%9B%B4%E5%BE%8C%E3%81%AE%E7%9C%9F%E3%81%A3%E7%99%BD%E3%81%AA%E6%95%B0%E7%A7%92%E9%96%93%E3%82%92%E3%81%AA%E3%81%8F%E3%81%97%E3%81%BE%E3%81%99.user.js
// @updateURL https://update.greasyfork.org/scripts/425174/%E3%83%A1%E3%83%AB%E3%82%AB%E3%83%AA%E3%81%AE%E3%83%AD%E3%83%BC%E3%83%89%E7%9B%B4%E5%BE%8C%E3%81%AE%E7%9C%9F%E3%81%A3%E7%99%BD%E3%81%AA%E6%95%B0%E7%A7%92%E9%96%93%E3%82%92%E3%81%AA%E3%81%8F%E3%81%97%E3%81%BE%E3%81%99.meta.js
// ==/UserScript==

/* jshint esversion: 6 */


const observer_to_anti_anti_flicker = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.classList.contains("async-hide")) {
            mutation.target.classList.remove("async-hide");
        }
    });
});

observer_to_anti_anti_flicker.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
});

for (let ele of document.getElementsByClassName("async-hide")){ele.classList.remove("async-hide");}