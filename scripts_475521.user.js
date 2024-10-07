// ==UserScript==
// @name         improve Twitter Video Player.edit
// @namespace    yakisova.com.edit
// @version      0.2.1.7grn.12
// @description  Change the difficult-to-use Twitter player to a native player
// @author       yakisova41.edit
// @match        *://twitter.com/*
// @match        *://x.com/*
// @match        *://X.com/*
// @grant        none
// @license      MIT
// @run-at       document-start
// @downloadURL https://raw.githubusercontent.com/7Grn/greasyfork.org-edit/main/scripts_475521.user.js
// @updateURL https://raw.githubusercontent.com/7Grn/greasyfork.org-edit/main/scripts_475521.user.js
// ==/UserScript==

(function() {
    'use strict';

    const bodyElem = document.querySelector("body");

    if(bodyElem !== null) {
        const observer = new MutationObserver(() => {
           const videoComponent = bodyElem.querySelector('div[data-testid="videoComponent"]:not(.improved-video)');
           if(videoComponent !== null) {
                videoComponent.classList.add("improved-video");
                setTimeout(() => {
                    replacePlayer(videoComponent);
                }, 100);
           }
        });

        observer.observe(bodyElem, {
            subtree: true,
            childList: true
        });
    }

    function replacePlayer(componentElement) {
        const originalVid = componentElement.querySelector("div:nth-child(1) > div > video");
        if(originalVid !== null) {

            originalVid.controls = true;
            originalVid.removeAttribute("disablepictureinpicture");

            const handleClick = (e) => {
                e.preventDefault();
                originalVid.play();
                setTimeout(() => {
                    originalVid.muted = false;
                });

                const handleMute = (e) => {
                    if(e.target.muted) {
                        e.target.muted = false;
                    }
                    e.srcElement.removeEventListener("volumechange", handleMute);
                };

                e.srcElement.addEventListener("volumechange", handleMute);

                originalVid.removeEventListener("click", handleClick)
            }
            originalVid.addEventListener("click", handleClick);

            componentElement.parentElement.appendChild(originalVid);
            componentElement.remove();
        }
    }
})();
