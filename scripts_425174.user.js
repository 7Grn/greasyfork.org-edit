// ==UserScript==
// @name           Fuck anti-flicker snippet(edit)
// @namespace         jasaj.me
// @match             *://*.mercari.com/*
// @match             *://*.lupicia.com/*
// @match             *://*.tonya.co.jp/*
// @match             *://*.monotaro.com/*
// @match             *://*
// @version           0.1.7.edit.3
// @description    This script is used to disable the anti-flicker snippet to bring the page load speed back to normal. (anti-flicker snippet: https://support.google.com/optimize/answer/7100284?hl=en )
// @author            Jasaj
// @downloadURL https://github.com/7grn/greasyfork.org-edit/raw/refs/heads/main/scripts_425174.user.js
// @updateURL https://github.com/7grn/greasyfork.org-edit/raw/refs/heads/main/scripts_425174.user.js
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