// ==UserScript==
// @match *://*.youtube.com/*
// @version 0.6.1.edit
// @run-at document-start
// @name Return YouTube Comment Username
// @description This script replaces the "handle" in the YouTube comments section to user name
// @author yakisova41.edit
// @namespace https://yt-returnname-api.pages.dev/extension/
// @grant unsafeWindow
// @license MIT
// @downloadURL https://github.com/7Grn/greasyfork.org-edit/raw/refs/heads/main/scripts_460361.user.js
// @updateURL https://github.com/7Grn/greasyfork.org-edit/raw/refs/heads/main/scripts_460361.user.js
// ==/UserScript==

// src/index.ts
function c3JjL2luZGV4LnRz() {
  "use strict";
  (() => {
    // node_modules/crx-monkey/dist/client/main.js
    function getRunningRuntime() {
      if (typeof window.__CRX_CONTENT_BUILD_ID === "undefined") {
        return "Userscript";
      } else {
        return "Extension";
      }
    }
    async function bypassSendMessage(message, options, callback) {
      const actionId = crypto.randomUUID();
      window.postMessage(
        {
          type: "send-message",
          crxContentBuildId: window.__CRX_CONTENT_BUILD_ID,
          detail: { message, options },
          actionId,
        },
        "*",
      );
      const data = await waitResultOnce("send-message", actionId);
      if (callback !== void 0) {
        callback(data.response);
      }
    }
    async function waitResultOnce(type, actionId) {
      return new Promise((resolve) => {
        const onResult = (e) => {
          if (e.detail.type === type && e.detail.actionId === actionId) {
            window.removeEventListener(
              "crx-isolate-connector-result",
              onResult,
            );
            resolve(e.detail.data);
          }
        };
        window.addEventListener("crx-isolate-connector-result", onResult);
      });
    }

    // src/utils/isCommentRenderer.ts
    function isCommentRenderer(continuationItems) {
      if (continuationItems.length > 0) {
        if ("commentThreadRenderer" in continuationItems[0]) {
          return false;
        }
        if ("commentRenderer" in continuationItems[0]) {
          return true;
        }
      }
      return false;
    }
    function isCommentRendererV2(continuationItems) {
      if (continuationItems.length > 0) {
        if ("commentThreadRenderer" in continuationItems[0]) {
          return false;
        }
        if ("commentViewModel" in continuationItems[0]) {
          return true;
        }
      }
      return false;
    }

    // package.json
    var package_default = {
      name: "return-youtube-comment-username",
      version: "0.6.0",
      devDependencies: {
        "@types/chrome": "^0.0.263",
        "@types/encoding-japanese": "^2.0.5",
        "@types/markdown-it": "^13.0.8",
        eslint: "^8.57.0",
        prettier: "^3.3.1",
        "ts-extension-builder": "^0.2.8",
      },
      license: "MIT",
      scripts: {
        "esbuild-register": "node --require esbuild-register",
        build: "npx crx-monkey build",
        dev: "npx crx-monkey dev",
        lint: "npx eslint --fix src/**/*.ts",
      },
      type: "module",
      dependencies: {
        "@mdit-vue/plugin-title": "^2.1.3",
        "@typescript-eslint/eslint-plugin": "^6.21.0",
        "@typescript-eslint/parser": "^6.21.0",
        "crx-monkey": "0.11.2",
        "encoding-japanese": "^2.2.0",
        "eslint-config-prettier": "^9.1.0",
        "markdown-it": "^14.1.0",
        typescript: "^5.4.5",
      },
    };

    // src/utils/debugLog.ts
    function debugLog(message, value = "") {
      if (getRunningRuntime() === "Extension") {
        bypassSendMessage({
          type: "log",
          value: [`[rycu] ${message} %c${value}`, "color:cyan;"],
        });
      } else {
        console.log(`[rycu] ${message} %c${value}`, "color:cyan;");
      }
    }
    function debugErr(message) {
      console.error(`[rycu] ${message}`);
      if (getRunningRuntime() === "Extension") {
        bypassSendMessage({
          type: "err",
          value: [`[rycu] ${message}`],
        });
      }
    }
    function outputDebugInfo() {
      const logs = [""];
      const ytConf = window.yt.config_;
      if (ytConf !== void 0) {
        logs.push(
          "PAGE_BUILD_LABEL: " +
            (ytConf.PAGE_BUILD_LABEL !== void 0
              ? ytConf.PAGE_BUILD_LABEL
              : " undefined"),
        );
        logs.push(
          "INNERTUBE_CLIENT_VERSION: " +
            (ytConf.INNERTUBE_CLIENT_VERSION !== void 0
              ? ytConf.INNERTUBE_CLIENT_VERSION
              : " undefined"),
        );
        logs.push(
          "INNERTUBE_CONTEXT_CLIENT_VERSION: " +
            (ytConf.INNERTUBE_CONTEXT_CLIENT_VERSION !== void 0
              ? ytConf.INNERTUBE_CONTEXT_CLIENT_VERSION
              : " undefined"),
        );
        logs.push(
          "INNERTUBE_CONTEXT_GL: " +
            (ytConf.INNERTUBE_CONTEXT_GL !== void 0
              ? ytConf.INNERTUBE_CONTEXT_GL
              : " undefined"),
        );
        logs.push(
          "Browser: " +
            (ytConf.INNERTUBE_CONTEXT.client.browserName !== void 0
              ? ytConf.INNERTUBE_CONTEXT.client.browserName
              : " undefined"),
        );
        logs.push(
          "Is login: " +
            (ytConf.LOGGED_IN !== void 0
              ? `${ytConf.LOGGED_IN}`
              : " undefined"),
        );
      }
      logs.push(`Href: ${location.href}`);
      debugLog(
        `Return Youtube comment Username v${package_default.version}`,
        logs.join("\n"),
      );
    }

    // src/utils/findElementByTrackingParams.ts
    function findElementByTrackingParams(trackingParams, elementSelector) {
      let returnElement = null;
      let errorAlerted = false;
      const elems = document.querySelectorAll(elementSelector);
      for (let i = 0; i < elems.length; i++) {
        if (
          elems[i]?.trackedParams === void 0 &&
          elems[i]?.polymerController?.trackedParams === void 0
        ) {
          debugErr(new Error("TrackedParams not found in element property."));
        }
        if (elems[i].trackedParams === trackingParams) {
          returnElement = elems[i];
          break;
        } else if (
          elems[i]?.polymerController?.trackedParams === trackingParams
        ) {
          returnElement = elems[i];
          break;
        } else {
          if (!errorAlerted) {
            void searchTrackedParamsByObject(trackingParams, elems[i]);
            errorAlerted = true;
          }
        }
      }
      return returnElement;
    }
    async function reSearchElement(trackingParams, selector) {
      return await new Promise((resolve) => {
        let isFinding = true;
        const search = () => {
          const el = findElementByTrackingParams(trackingParams, selector);
          if (el !== null) {
            resolve(el);
            isFinding = false;
          }
          if (isFinding) {
            setTimeout(() => {
              search();
            }, 100);
          }
        };
        search();
      });
    }
    function findElementAllByCommentId(commnetId, elementSelector) {
      const returnElements = [];
      const elems = document.querySelectorAll(elementSelector);
      for (let i = 0; i < elems.length; i++) {
        if (elems[i] !== void 0) {
          if (
            elems[i]?.__data?.data?.commentId === void 0 &&
            elems[i]?.polymerController?.__data?.data?.commentId === void 0
          ) {
            debugErr(new Error("Reply CommentId not found."));
          } else if (
            elems[i]?.__data?.data?.commentId !== void 0 &&
            elems[i].__data.data.commentId === commnetId
          ) {
            returnElements.push(elems[i]);
          } else if (
            elems[i]?.polymerController?.__data?.data?.commentId !== void 0 &&
            elems[i].polymerController.__data.data.commentId === commnetId
          ) {
            returnElements.push(elems[i]);
          }
        }
      }
      return returnElements;
    }
    async function reSearchElementAllByCommentId(commnetId, selector) {
      return await new Promise((resolve) => {
        let isFinding = true;
        const search = () => {
          const el = findElementAllByCommentId(commnetId, selector);
          if (el !== null) {
            resolve(el);
            isFinding = false;
          }
          if (isFinding) {
            setTimeout(() => {
              search();
            }, 100);
          }
        };
        search();
      });
    }
    async function searchTrackedParamsByObject(param, elem) {
      const elemObj = Object(elem);
      const search = (obj, history) => {
        Object.keys(obj).forEach((k) => {
          if (typeof obj[k] === "object") {
            search(obj[k], [...history, k]);
          } else if (obj[k] === param) {
            history.push(k);
            throw debugErr(
              new Error(`Unknown Object format!
"${history.join(" > ")}"`),
            );
          }
        });
      };
      search(elemObj, []);
    }

    // src/types/AppendContinuationItemsAction.ts
    function isReplyContinuationItemsV1(obj) {
      return Object.hasOwn(obj[0], "commentRenderer");
    }
    function isReplyContinuationItemsV2(obj) {
      return Object.hasOwn(obj[0], "commentViewModel");
    }
    function isConfinuationItemV2(obj) {
      return Object.hasOwn(obj, "commentViewModel");
    }
    function isConfinuationItemV1(obj) {
      return Object.hasOwn(obj, "comment");
    }

    // src/utils/escapeString.ts
    function escapeString(text) {
      return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, `&quot;`)
        .replace(/'/g, `&#39;`)
        .replace(/&/g, `&amp;`);
    }
    function decodeString(text) {
      return text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, `"`)
        .replace(/&#39;/g, `'`)
        .replace(/&amp;/g, `&`);
    }

    // src/utils/getUserName.ts
    var isUseFeed = true;
    async function getUserName(id) {
      return new Promise((resolve) => {
        if (isUseFeed) {
          fetchFeed(id)
            .then((name) => {
              resolve(name);
            })
            .catch(() => {
              isUseFeed = false;
              debugErr(
                new Error("Catch Feed API Error, so change to Browse mode."),
              );
              fetchBrowse(id).then((name) => {
                resolve(name);
              });
            });
        } else {
          fetchBrowse(id).then((name) => {
            resolve(name);
          });
        }
      });
    }
    async function fetchFeed(id) {
      return await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
        {
          method: "GET",
          cache: "default",
          keepalive: true,
        },
      )
        .then(async (res) => {
          if (res.status !== 200)
            throw debugErr(
              new Error(`Feed API Error
status: ${res.status}`),
            );
          return await res.text();
        })
        .then((text) => {
          const match = text.match("<title>([^<].*)</title>");
          if (match !== null) {
            return decodeString(match[1]);
          } else {
            debugErr("XML title not found");
            return "";
          }
        });
    }
    async function fetchBrowse(id) {
      return await fetch(
        `https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false`,
        {
          method: "POST",
          headers: {
            cache: "default",
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en",
            "content-type": "application/json",
            dnt: "1",
            referer: `https://www.youtube.com/channel/${id}`,
          },
          body: JSON.stringify({
            context: {
              client: {
                hl: window.yt.config_.HL,
                gl: window.yt.config_.GL,
                clientName: "WEB",
                clientVersion: "2.20230628.01.00",
                platform: "DESKTOP",
                acceptHeader:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              },
              user: { lockedSafetyMode: false },
              request: {
                useSsl: true,
              },
            },
            browseId: id,
            params: "EgVhYm91dPIGBAoCEgA%3D",
          }),
        },
      )
        .then(async (res) => {
          if (res.status !== 200)
            throw debugErr(
              new Error(`Browse API Error
status: ${res.status}`),
            );
          return await res.json();
        })
        .then((text) => {
          const name = text.header.c4TabbedHeaderRenderer.title;
          return decodeString(name);
        });
    }

    // src/rewrites/rewriteOfCommentRenderer/nameRewriteOfCommentRenderer.ts
    function nameRewriteOfCommentRenderer(
      commentRenderer,
      isNameContainerRender,
      userId,
    ) {
      const commentRendererBody =
        commentRenderer.__shady_native_children.namedItem("body");
      if (commentRendererBody === null) {
        throw debugErr(new Error("Comment renderer body is null."));
      }
      let nameElem = commentRendererBody.querySelector(
        "#main > #header > #header-author > h3 > a > yt-formatted-string",
      );
      if (isNameContainerRender) {
        const containerMain =
          commentRendererBody.__shady_native_children.namedItem("main");
        if (containerMain !== null) {
          nameElem = containerMain.querySelector(
            "#header > #header-author > #author-comment-badge > ytd-author-comment-badge-renderer > a > #channel-name > #container > #text-container > yt-formatted-string",
          );
        }
      }
      void getUserName(userId)
        .then((name) => {
          if (nameElem !== null) {
            if (nameElem.getAttribute("is-empty") !== null) {
              nameElem.removeAttribute("is-empty");
            }
            if (isNameContainerRender) {
              nameElem.textContent = escapeString(name);
            } else {
              nameElem.textContent = name;
            }
          } else {
            debugErr(new Error("Name element is null"));
          }
        })
        .catch((e) => {
          debugErr(e);
        });
    }

    // src/rewrites/rewriteOfCommentRenderer/mentionRewriteOfCommentRenderer.ts
    function mentionRewriteOfCommentRenderer(commentRenderer) {
      const commentRendererBody =
        commentRenderer.__shady_native_children.namedItem("body");
      const main2 = commentRendererBody?.querySelector("#main");
      if (main2 !== void 0 && main2 !== null) {
        const aTags = main2.querySelectorAll(
          "#comment-content > ytd-expander > #content > #content-text > a",
        );
        for (let i = 0; i < aTags.length; i++) {
          if (aTags[i].getAttribute("href")?.match("/channel/.*") !== null) {
            const href = aTags[i].getAttribute("href");
            if (href !== null) {
              void getUserName(href.split("/")[2])
                .then((name) => {
                  aTags[i].textContent = `@${name} `;
                })
                .catch((e) => {
                  debugErr(e);
                });
            } else {
              debugErr(new Error("Mention Atag has not Href attr."));
            }
          }
        }
      }
    }

    // src/rewrites/rewriteOfCommentRenderer/nameRewriteOfCommentViewModel.ts
    function nameRewriteOfCommentViewModel(commentViewModel) {
      const commentViewModelBody =
        commentViewModel.__shady_native_children.namedItem("body");
      if (commentViewModelBody === null) {
        throw debugErr(new Error("Comment view model body is null."));
      }
      if (!commentViewModelBodyGuard(commentViewModelBody)) {
        throw debugErr(
          new Error("The object format of comment view model is invalid."),
        );
      }
      const isNameContainerRender =
        commentViewModelBody.__shady.ea.__shady.ea.host.authorCommentBadge !==
        null;
      let nameElem = commentViewModelBody.querySelector(
        "#main > #header > #header-author > h3 > a > span",
      );
      const userId =
        commentViewModelBody.__shady.ea.__shady.ea.host.authorNameEndpoint
          .browseEndpoint.browseId;
      const userHandle =
        commentViewModelBody.__shady.ea.__shady.ea.host.authorNameEndpoint.browseEndpoint.canonicalBaseUrl.substring(
          1,
        );
      if (isNameContainerRender) {
        const containerMain =
          commentViewModelBody.__shady_native_children.namedItem("main");
        if (containerMain !== null) {
          nameElem = containerMain.querySelector(
            "#header > #header-author > #author-comment-badge > ytd-author-comment-badge-renderer > a > #channel-name > #container > #text-container > yt-formatted-string",
          );
        }
      }
      void getUserName(userId)
        .then((name) => {
          if (nameElem !== null) {
            if (nameElem.getAttribute("is-empty") !== null) {
              nameElem.removeAttribute("is-empty");
            }
            let innerText = name;
            if (window.__rycu.settings.isShowNameToHandle) {
              innerText = decodeURI(userHandle) + `  ( ${name} )`;
            }
            if (window.__rycu.settings.isShowHandleToName) {
              innerText = name + `  ( ${decodeURI(userHandle)} )`;
            }
            if (isNameContainerRender) {
              nameElem.textContent = escapeString(innerText);
            } else {
              nameElem.textContent = innerText;
            }
          } else {
            debugErr(new Error("Name element is null"));
          }
        })
        .catch((e) => {
          debugErr(e);
        });
    }
    function commentViewModelBodyGuard(elem) {
      return Object.hasOwn(elem, "__shady");
    }

    // src/rewrites/rewriteOfCommentRenderer/mentionRewriteOfCommentRendererV2.ts
    function mentionRewriteOfCommentRendererV2(commentRenderer) {
      const commentRendererBody =
        commentRenderer.__shady_native_children.namedItem("body");
      const main2 = commentRendererBody?.querySelector("#main");
      if (main2 !== void 0 && main2 !== null) {
        const aTags = main2.querySelectorAll(
          "#expander > #content > #content-text > span > span > a",
        );
        for (let i = 0; i < aTags.length; i++) {
          if (aTags[i].getAttribute("href")?.match("/channel/.*") !== null) {
            const href = aTags[i].getAttribute("href");
            if (href !== null) {
              void getUserName(href.split("/")[2])
                .then((name) => {
                  aTags[i].textContent = `@${name} `;
                })
                .catch((e) => {
                  debugErr(e);
                });
            } else {
              debugErr(new Error("Mention Atag has not Href attr."));
            }
          }
        }
      }
    }

    // src/rewrites/reply.ts
    function rewriteReplytNameFromContinuationItems(continuationItems) {
      debugLog("Rewrite Reply.");
      if (isReplyContinuationItemsV1(continuationItems)) {
        debugLog("Rewrite reply of continuationItems.");
        for (let i = 0; i < continuationItems.length; i++) {
          const { commentRenderer } = continuationItems[i];
          if (commentRenderer !== void 0) {
            void getReplyElem(commentRenderer.trackingParams, "V1").then(
              (replyElem) => {
                reWriteReplyElem(replyElem, commentRenderer);
              },
            );
          }
        }
      }
      if (isReplyContinuationItemsV2(continuationItems)) {
        debugLog("Rewrite reply of comment view model.");
        for (let i = 0; i < continuationItems.length; i++) {
          const { commentViewModel } = continuationItems[i];
          if (commentViewModel !== void 0) {
            void getReplyElem(
              commentViewModel.rendererContext.loggingContext.loggingDirectives
                .trackingParams,
              "V2",
            ).then((replyElem) => {
              reWriteReplyElemV2(replyElem);
            });
          }
        }
      }
    }
    function reWriteReplyElem(replyElem, rendererData) {
      let isContainer = rendererData.authorIsChannelOwner;
      if (rendererData.authorCommentBadge !== void 0) {
        isContainer = true;
      }
      nameRewriteOfCommentRenderer(
        replyElem,
        isContainer,
        rendererData.authorEndpoint.browseEndpoint.browseId,
      );
      mentionRewriteOfCommentRenderer(replyElem);
      replyInputRewrite(replyElem);
    }
    function reWriteReplyElemV2(replyElem) {
      nameRewriteOfCommentViewModel(replyElem);
      mentionRewriteOfCommentRendererV2(replyElem);
      replyInputRewrite(replyElem);
    }
    async function getReplyElem(trackedParams, version) {
      return await new Promise((resolve) => {
        const selector =
          "#replies > ytd-comment-replies-renderer > #expander > #expander-contents > #contents > " +
          (version === "V1"
            ? "ytd-comment-renderer"
            : "ytd-comment-view-model");
        const commentRenderer = findElementByTrackingParams(
          trackedParams,
          selector,
        );
        if (commentRenderer !== null) {
          resolve(commentRenderer);
        } else {
          void reSearchElement(trackedParams, selector).then(
            (commentRenderer2) => {
              resolve(commentRenderer2);
            },
          );
        }
      });
    }
    function rewriteTeaserReplytNameFromContinuationItems(continuationItems) {
      debugLog("Rewrite teaser Reply.");
      for (let i = 0; i < continuationItems.length; i++) {
        if (isReplyContinuationItemsV1(continuationItems)) {
          debugLog("Teaser reply of continuationItems.");
          const { commentRenderer } = continuationItems[i];
          if (commentRenderer !== void 0) {
            void reSearchElementAllByCommentId(
              commentRenderer.commentId,
              "ytd-comment-replies-renderer > #teaser-replies > ytd-comment-renderer",
            ).then((replyElems) => {
              replyElems.forEach((replyElem) => {
                reWriteReplyElem(replyElem, commentRenderer);
              });
            });
            void reSearchElementAllByCommentId(
              commentRenderer.commentId,
              "ytd-comment-replies-renderer > #expander > #expander-contents > #contents > ytd-comment-renderer",
            ).then((replyElems) => {
              replyElems.forEach((replyElem) => {
                reWriteReplyElem(replyElem, commentRenderer);
              });
            });
          }
        }
        if (isReplyContinuationItemsV2(continuationItems)) {
          debugLog("Teaser reply of comment view model.");
          const { commentViewModel } = continuationItems[i];
          if (commentViewModel !== void 0) {
            const elem = findElementByTrackingParams(
              commentViewModel.rendererContext.loggingContext.loggingDirectives
                .trackingParams,
              "#teaser-replies > ytd-comment-view-model",
            );
            if (elem === null) {
              throw debugErr(
                new Error("Can not found Teaser Reply in V2 Elem."),
              );
            }
            reWriteReplyElemV2(elem);
          }
        }
      }
    }
    function replyInputRewrite(replyElem) {
      const replyToReplyBtn = replyElem.querySelector(
        "#reply-button-end > ytd-button-renderer",
      );
      const replyToReplyHander = () => {
        const replyLink = replyElem.querySelector("#contenteditable-root > a");
        const href = replyLink?.getAttribute("href");
        const channelId = href?.split("/")[2];
        if (channelId !== void 0 && replyLink !== null) {
          void getUserName(channelId).then((name) => {
            replyLink.textContent = ` @${name}`;
          });
        }
        replyToReplyBtn?.removeEventListener("click", replyToReplyHander);
      };
      replyToReplyBtn?.addEventListener("click", replyToReplyHander);
      document.addEventListener("rycu-pagechange", () => {
        replyToReplyBtn?.removeEventListener("click", replyToReplyHander);
      });
    }

    // src/rewrites/comment.ts
    function rewriteCommentNameFromContinuationItems(continuationItems) {
      debugLog("Rewrite Comment.");
      for (let i = 0; i < continuationItems.length; i++) {
        if (continuationItems[i].commentThreadRenderer !== void 0) {
          void getCommentElem(
            continuationItems[i].commentThreadRenderer.trackingParams,
          ).then((commentElem) => {
            reWriteCommentElem(
              commentElem,
              continuationItems[i].commentThreadRenderer,
            );
          });
          const teaserContents =
            continuationItems[i].commentThreadRenderer.replies
              ?.commentRepliesRenderer.teaserContents;
          if (teaserContents !== void 0) {
            rewriteTeaserReplytNameFromContinuationItems(teaserContents);
          }
        }
      }
    }
    function reWriteCommentElem(commentElem, commentThreadRenderer) {
      const commentRenderer =
        commentElem.__shady_native_children.namedItem("comment");
      if (commentRenderer !== null && commentRenderer !== void 0) {
        if (isConfinuationItemV1(commentThreadRenderer)) {
          debugLog("Rewrite of Comment Renderer.");
          let isContainer =
            commentThreadRenderer.comment.commentRenderer.authorIsChannelOwner;
          if (
            commentThreadRenderer.comment.commentRenderer.authorCommentBadge !==
            void 0
          ) {
            isContainer = true;
          }
          nameRewriteOfCommentRenderer(
            commentRenderer,
            isContainer,
            commentThreadRenderer.comment.commentRenderer.authorEndpoint
              .browseEndpoint.browseId,
          );
        }
        if (isConfinuationItemV2(commentThreadRenderer)) {
          debugLog("Rewrite of Comment view model.");
          nameRewriteOfCommentViewModel(commentRenderer);
        }
      }
    }
    async function getCommentElem(trackingParams) {
      return await new Promise((resolve) => {
        const commentElem = findElementByTrackingParams(
          trackingParams,
          "#comments > #sections > #contents > ytd-comment-thread-renderer",
        );
        if (commentElem !== null) {
          resolve(commentElem);
        } else {
          void reSearchElement(trackingParams, "ytd-comment-thread-renderer")
            .then((commentElem2) => {
              resolve(commentElem2);
            })
            .catch((e) => {
              debugErr(e);
            });
        }
      });
    }

    // src/handlers/handleYtAppendContinuationItemsAction.ts
    function handleYtAppendContinuationItemsAction(detail) {
      const continuationItems =
        detail.args[0].appendContinuationItemsAction.continuationItems;
      if (
        isCommentRenderer(continuationItems) ||
        isCommentRendererV2(continuationItems)
      ) {
        const replyDetail = detail;
        setTimeout(() => {
          rewriteReplytNameFromContinuationItems(
            replyDetail.args[0].appendContinuationItemsAction.continuationItems,
          );
        }, 100);
      } else {
        const commentDetail = detail;
        setTimeout(() => {
          rewriteCommentNameFromContinuationItems(
            commentDetail.args[0].appendContinuationItemsAction
              .continuationItems,
          );
        }, 400);
      }
    }

    // src/handlers/handleYtCreateCommentAction.ts
    function handleYtCreateCommentAction(detail) {
      const createCommentDetail = detail;
      const continuationItems = [
        {
          commentThreadRenderer:
            createCommentDetail.args[0].createCommentAction.contents
              .commentThreadRenderer,
        },
      ];
      setTimeout(() => {
        rewriteCommentNameFromContinuationItems(continuationItems);
      }, 100);
    }

    // src/handlers/handleYtCreateCommentReplyAction.ts
    function handleYtCreateCommentReplyAction(detail) {
      const createReplyDetail = detail;
      const continuationItems = [
        {
          commentRenderer:
            createReplyDetail.args[0].createCommentReplyAction.contents
              .commentRenderer,
        },
      ];
      setTimeout(() => {
        rewriteTeaserReplytNameFromContinuationItems(continuationItems);
      }, 100);
    }

    // src/rewrites/highlightedReply.ts
    function rewriteHighlightedReply(trackedParams) {
      getReplyElem2(trackedParams, "V1").then((replyElem) => {
        reWriteReplyElemV2(replyElem);
      });
    }
    function rewriteHighlightedReplyV2(trackedParams) {
      getReplyElem2(trackedParams, "V2").then((replyElem) => {
        reWriteReplyElemV2(replyElem);
      });
    }
    async function getReplyElem2(trackedParams, version) {
      return await new Promise((resolve) => {
        const selector =
          "ytd-comment-replies-renderer > #teaser-replies > " +
          (version === "V1"
            ? "ytd-comment-renderer"
            : "ytd-comment-view-model");
        const commentRenderer = findElementByTrackingParams(
          trackedParams,
          selector,
        );
        if (commentRenderer !== null) {
          resolve(commentRenderer);
        } else {
          void reSearchElement(trackedParams, selector).then(
            (commentRenderer2) => {
              resolve(commentRenderer2);
            },
          );
        }
      });
    }

    // src/handlers/handleYtGetMultiPageMenuAction.ts
    function handleYtGetMultiPageMenuAction(detail) {
      debugLog("handleYtGetMultiPageMenuAction");
      const getMultiPageMenuDetail = detail;
      const continuationItems =
        getMultiPageMenuDetail.args[0].getMultiPageMenuAction.menu
          .multiPageMenuRenderer.sections[1].itemSectionRenderer?.contents;
      const highLightedTeaserContents =
        getMultiPageMenuDetail.args[0]?.getMultiPageMenuAction?.menu
          ?.multiPageMenuRenderer.sections[1].itemSectionRenderer?.contents[0]
          ?.commentThreadRenderer.replies?.commentRepliesRenderer
          ?.teaserContents;
      if (continuationItems !== void 0) {
        setTimeout(() => {
          rewriteCommentNameFromContinuationItems(continuationItems);
          if (highLightedTeaserContents !== void 0) {
            debugLog("HighLighted Teaser Reply found.");
            if (isReplyContinuationItemsV1(highLightedTeaserContents)) {
              debugLog("highLighted Teaser Reply V1");
              const highLightedReplyRenderer =
                highLightedTeaserContents[0]?.commentRenderer;
              rewriteHighlightedReply(highLightedReplyRenderer.trackingParams);
            } else {
              debugLog("highLighted Teaser Reply V2");
              const commentViewModel =
                highLightedTeaserContents[0]?.commentViewModel;
              const trackingParams =
                commentViewModel.rendererContext.loggingContext
                  .loggingDirectives.trackingParams;
              rewriteHighlightedReplyV2(trackingParams);
            }
          }
        }, 100);
      }
    }

    // src/handlers/handleYtHistory.ts
    function handleYtHistory(detail) {
      const historyDetail = detail;
      const continuationItems =
        historyDetail.args[1].historyEntry?.rootData.response.contents
          .twoColumnWatchNextResults?.results?.results?.contents[3]
          ?.itemSectionRenderer?.contents;
      if (continuationItems !== void 0) {
        setTimeout(() => {
          rewriteCommentNameFromContinuationItems(continuationItems);
        }, 100);
      }
    }

    // src/handlers/handleYtReloadContinuationItemsCommand.ts
    function handleYtReloadContinuationItemsCommand(detail) {
      const reloadDetail = detail;
      const { slot } = reloadDetail.args[0].reloadContinuationItemsCommand;
      if (slot === "RELOAD_CONTINUATION_SLOT_BODY") {
        const continuationItems =
          reloadDetail.args[0].reloadContinuationItemsCommand.continuationItems;
        if (continuationItems !== void 0) {
          setTimeout(() => {
            rewriteCommentNameFromContinuationItems(continuationItems);
          }, 100);
        }
      }
    }

    // src/index.ts
    function main() {
      const settings = {
        isShowHandleToName: false,
        isShowNameToHandle: false,
      };
      window.__rycu = {
        settings,
      };
      if (getRunningRuntime() === "Extension") {
        bypassSendMessage(
          {
            type: "getShowHandleToName",
            value: null,
          },
          {},
          (isShowHandleToName) => {
            window.__rycu.settings.isShowHandleToName = isShowHandleToName;
          },
        );
        bypassSendMessage(
          {
            type: "getShowNameToHandle",
            value: null,
          },
          {},
          (isShowNameToHandle) => {
            window.__rycu.settings.isShowNameToHandle = isShowNameToHandle;
          },
        );
      }
      const handleYtAction = (e) => {
        switch (e.detail.actionName) {
          case "yt-append-continuation-items-action":
            handleYtAppendContinuationItemsAction(e.detail);
            break;
          case "yt-reload-continuation-items-command":
            handleYtReloadContinuationItemsCommand(e.detail);
            break;
          case "yt-history-load":
            handleYtHistory(e.detail);
            break;
          case "yt-get-multi-page-menu-action":
            handleYtGetMultiPageMenuAction(e.detail);
            break;
          case "yt-create-comment-action":
            handleYtCreateCommentAction(e.detail);
            break;
          case "yt-create-comment-reply-action":
            handleYtCreateCommentReplyAction(e.detail);
            break;
        }
      };
      document.addEventListener("yt-action", handleYtAction);
      document.addEventListener("yt-navigate-finish", () => {
        document.dispatchEvent(new Event("rycu-pagechange"));
        outputDebugInfo();
      });
    }
    main();
  })();
}

if (location.href.match("https://www.youtube.com/*") !== null) {
  document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    if (unsafeWindow.trustedTypes !== undefined) {
      const policy = unsafeWindow.trustedTypes.createPolicy(
        "crx-monkey-trusted-inject-policy",
        { createScript: (input) => input },
      );
      script.text = policy.createScript(
        script.text + `(${c3JjL2luZGV4LnRz.toString()})();`,
      );
    } else {
      script.innerHTML =
        script.innerHTML + `(${c3JjL2luZGV4LnRz.toString()})();`;
    }
    unsafeWindow.document.body.appendChild(script);
  });
}