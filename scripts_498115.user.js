// ==UserScript==
// @name                Twitter kaizen-498115
// @description         Twitterの表示を改善するスクリプト
// @version             2.3
// @author              Yos_sy.edit
// @match               https://x.com/*
// @match               https://X.com/*
// @match               https://twitter.com/*
// @namespace           http://tampermonkey.net/
// @license             MIT
// @run-at              document-start
// @require             https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js
// @resource            IMPORTED_CSS https://raw.githubusercontent.com/yossy17/twitter-kaizen/main/style.css
// @grant               GM_addStyle
// @grant               GM_getResourceText
// @grant               GM_registerMenuCommand
// @downloadURL https://github.com/7Grn/greasyfork.org-edit/raw/refs/heads/main/scripts_498115.user.js
// @updateURL https://github.com/7Grn/greasyfork.org-edit/raw/refs/heads/main/scripts_498115.user.js
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(`
    /* -----------------------------------------------------------------------------------
    基本的なボーダーを消す
    ----------------------------------------------------------------------------------- */
    .r-1kqtdi0,
    .r-1igl3o0 {
      border: none !important;
    }
    
    /* -----------------------------------------------------------------------------------
    カキコの下のボーダーを消す
    ----------------------------------------------------------------------------------- */
    .r-109y4c4 {
      height: 0 !important;
    }
    
    /* -----------------------------------------------------------------------------------
    TLの幅を600pxから700pxに、右サイドバーの幅を350pxから250pxに変更
    ----------------------------------------------------------------------------------- */
    .r-1ye8kvj {
      max-width: 700px !important;
    }
    .r-1hycxz {
      width: 250px !important;
    }
    .css-175oi2r.r-kemksi.r-1kqtdi0.r-th6na.r-1phboty.r-1dqxon3.r-1hycxz {
      width: 350px !important;
    }
    
    /* -----------------------------------------------------------------------------------
    ヘッダーのスクロールバーを消す
    ----------------------------------------------------------------------------------- */
    .css-175oi2r.r-1pi2tsx.r-1wtj0ep.r-1rnoaur.r-o96wvk.r-is05cd {
      overflow-y: scroll !important;
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    .css-175oi2r.r-1pi2tsx.r-1wtj0ep.r-1rnoaur.r-o96wvk.r-is05cd::-webkit-scrollbar {
      display: none !important;
    }
    
    /* -----------------------------------------------------------------------------------
    サイドバーの”Subscribe to Premium”を消す
    ----------------------------------------------------------------------------------- */
    .css-175oi2r.r-1habvwh.r-eqz5dr.r-uaa2di.r-1mmae3n.r-3pj75a.r-bnwqim {
      display: none;
    }
    
    /* -----------------------------------------------------------------------------------
    サイドバーの”Who to follow”を消す
    ----------------------------------------------------------------------------------- */
    .css-175oi2r.r-1bro5k0 {
      display: none;
    }
    
    /* -----------------------------------------------------------------------------------
    TL上のUserNameを消す
    ----------------------------------------------------------------------------------- */
    a
      > .css-146c3p1.r-dnmrzs.r-1udh08x.r-3s2u2q.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1qd0xha.r-a023e6.r-rjixqe.r-16dba41.r-18u37iz.r-1wvb978,
    .css-175oi2r:nth-child(2)
      > .css-175oi2r
      > .css-175oi2r:nth-child(2)
      > .css-175oi2r
      > .css-175oi2r:nth-child(1)
      > .css-175oi2r
      > .css-146c3p1:nth-child(1)
      > .css-1jxf684,
    .css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1qd0xha.r-a023e6.r-rjixqe.r-16dba41.r-1q142lx.r-n7gxbd {
      display: none;
    }
    
    /* -----------------------------------------------------------------------------------
    サイドバーのWhat’s happeningのステータスを見やすく
    ----------------------------------------------------------------------------------- */
    .css-175oi2r.r-1mmae3n.r-3pj75a.r-o7ynqc.r-6416eg.r-1ny4l3l.r-1loqt21
      > div
      > div
      > .css-175oi2r.r-1wbh5a2.r-1awozwy.r-18u37iz {
      display: flex;
      flex-flow: column;
    }
    .r-r2y082 {
      max-width: 100%;
    }
    
    /* -----------------------------------------------------------------------------------
    時計、日付のフォントカラーを変更
    ----------------------------------------------------------------------------------- */
    #date__container__text,
    #time__container__text {
      color: #e7e9ea;
    }  
  `);

  // ローカルストレージから設定を読み込む
  function loadConfig() {
    const savedConfig = localStorage.getItem("twitterKaizenConfig");
    if (savedConfig) {
      Object.assign(config, JSON.parse(savedConfig));
    }
  }

  // ローカルストレージに設定を保存
  function saveConfig() {
    localStorage.setItem("twitterKaizenConfig", JSON.stringify(config));
  }

  // -----------------------------------------------------------------------------------
  // ユーティリティ関数と定数
  // -----------------------------------------------------------------------------------
  const Utils = {
    debounce: (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },

    pad: (num) => num.toString().padStart(2, "0"),

    createElement: (tag, options = {}) => {
      const element = document.createElement(tag);
      if (options.id) element.id = options.id;
      options.classList?.forEach((cls) => element.classList.add(cls));
      Object.entries(options.attributes || {}).forEach(([attr, value]) =>
        element.setAttribute(attr, value)
      );
      if (options.innerHTML) element.innerHTML = options.innerHTML;
      if (options.textContent) element.textContent = options.textContent;
      return element;
    },

    observeDOM: (
      targetNode,
      callback,
      config = { childList: true, subtree: true }
    ) => {
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
      return observer;
    },
  };

  // 多言語定義
  const TRANSLATIONS = {
    en: {
      panel: {
        replaceIcons: "Reclaim Twitter (restore icon)",
        useAbsoluteTime: "Change TL time from relative to absolute time",
        showTimeAndDateSidebar: "Display time and date in sidebar",
        useDefaultVideoPlayer: "Revert video player to default",
        enhanceTweetEngagements: "Easy access to quoted tweets",
      },
      weeks: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    ja: {
      panel: {
        replaceIcons: "Twitterを取り戻す (アイコンを元に戻す)",
        useAbsoluteTime: "TLの時間を相対時間から絶対時間に変更",
        showTimeAndDateSidebar: "サイドバーに時間、日付を表示",
        useDefaultVideoPlayer: "動画プレイヤーをデフォルトに戻す",
        enhanceTweetEngagements: "引用ツイートへのアクセスを簡単に",
      },
      weeks: ["日", "月", "火", "水", "木", "金", "土"],
    },
    zh: {
      panel: {
        replaceIcons: "替换 Twitter 图标",
        useAbsoluteTime: "使用绝对时间",
        showTimeAndDateSidebar: "显示时间和日期侧边栏",
        useDefaultVideoPlayer: "使用默认视频播放器",
        enhanceTweetEngagements: "增强推文互动",
      },
      weeks: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    },
    ko: {
      panel: {
        replaceIcons: "Twitter 아이콘 교체",
        useAbsoluteTime: "절대 시간 사용",
        showTimeAndDateSidebar: "시간 및 날짜 사이드바 표시",
        useDefaultVideoPlayer: "기본 비디오 플레이어 사용",
        enhanceTweetEngagements: "트윗 참여 향상",
      },
      weeks: ["일", "월", "화", "수", "목", "금", "토"],
    },
    ru: {
      panel: {
        replaceIcons: "Заменить иконки Twitter",
        useAbsoluteTime: "Использовать абсолютное время",
        showTimeAndDateSidebar: "Показать боковую панель времени и даты",
        useDefaultVideoPlayer: "Использовать стандартный видеоплеер",
        enhanceTweetEngagements: "Улучшить взаимодействие с твитами",
      },
      weeks: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    },
    de: {
      panel: {
        replaceIcons: "Twitter-Icons ersetzen",
        useAbsoluteTime: "Absolute Zeit verwenden",
        showTimeAndDateSidebar: "Zeit- und Datums-Sidebar anzeigen",
        useDefaultVideoPlayer: "Standard-Video-Player verwenden",
        enhanceTweetEngagements: "Tweet-Interaktionen verbessern",
      },
      weeks: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    },
  };

  const LANG = navigator.language.split("-")[0];
  const CURRENT_LANG = TRANSLATIONS[LANG] || TRANSLATIONS.en;

  const PANEL_LANG = CURRENT_LANG.panel;
  const WEEKS_LANG = CURRENT_LANG.weeks;

  // -----------------------------------------------------------------------------------
  // 設定パネル
  // -----------------------------------------------------------------------------------
  const config = {
    replaceIcons: true,
    useAbsoluteTime: true,
    showTimeAndDateSidebar: true,
    useDefaultVideoPlayer: true,
    enhanceTweetEngagements: true,
  };

  const SettingsModule = {
    createSettingsUI: function () {
      const settingsDiv = Utils.createElement("div", {
        id: "twitter-kaizen-panel",
        classList: ["twitter-kaizen-panel"],
      });

      // パネルのインラインスタイルを追加
      Object.assign(settingsDiv.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: "9999",
        background: "#f9f9f9",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        color: "#333",
        fontFamily: "Arial, sans-serif",
        width: "300px",
        maxWidth: "100%",
        display: "none",
        transition: "transform 0.3s ease, opacity 0.3s ease",
      });

      const title = Utils.createElement("h3", {
        textContent: "Twitter Kaizen Settings",
      });
      title.style.fontSize = "18px";
      title.style.margin = "10px";
      title.style.color = "#333";
      settingsDiv.appendChild(title);

      const features = [
        { key: "replaceIcons", label: PANEL_LANG.replaceIcons },
        { key: "useAbsoluteTime", label: PANEL_LANG.useAbsoluteTime },
        {
          key: "showTimeAndDateSidebar",
          label: PANEL_LANG.showTimeAndDateSidebar,
        },
        {
          key: "useDefaultVideoPlayer",
          label: PANEL_LANG.useDefaultVideoPlayer,
        },
        {
          key: "enhanceTweetEngagements",
          label: PANEL_LANG.enhanceTweetEngagements,
        },
      ];

      features.forEach(({ key, label }) => {
        const checkbox = Utils.createElement("input", {
          attributes: { type: "checkbox", id: key },
        });
        checkbox.checked = config[key];
        checkbox.addEventListener("change", () => {
          config[key] = checkbox.checked;
          saveConfig();
          location.reload();
        });

        const labelElement = Utils.createElement("label", {
          attributes: { for: key },
          textContent: label,
        });
        labelElement.style.marginLeft = "8px";
        labelElement.style.fontSize = "14px";
        labelElement.style.color = "#555";

        settingsDiv.appendChild(checkbox);
        settingsDiv.appendChild(labelElement);
        settingsDiv.appendChild(Utils.createElement("br"));
      });

      document.body.appendChild(settingsDiv);
    },

    toggleSettingsPanel: function () {
      const panel = document.getElementById("twitter-kaizen-panel");
      if (panel) {
        if (panel.style.display === "none") {
          panel.style.display = "block";
          panel.style.transform = "scale(1)";
          panel.style.opacity = "1";
        } else {
          panel.style.transform = "scale(0.9)";
          panel.style.opacity = "0";
          setTimeout(() => {
            panel.style.display = "none";
          }, 300);
        }
      }
    },
  };

  // ショートカットキー
  function setupKeyboardShortcut() {
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.altKey && e.key === "o") {
        SettingsModule.toggleSettingsPanel();
      }
    });
  }

  // メニューコマンドの登録
  function setupMenuCommand() {
    GM_registerMenuCommand("Toggle Twitter Kaizen Settings", () => {
      SettingsModule.toggleSettingsPanel();
    });
  }

  // -----------------------------------------------------------------------------------
  // Twitterを取り戻す(アイコンを戻す)
  // -----------------------------------------------------------------------------------

  function replaceTwitterIcons() {
    if (!config.replaceIcons) return;

    GM_addStyle(`
      /* main */
      .r-64el8z[href="/home"] > div > svg > g > path,
      .r-1h3ijdo > .r-1pi2tsx > svg > g > path,
      .r-1blnp2b > g > path {
        d: path(
          "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
        ) !important;
      }
  
      /* premium */
      .r-eqz5dr[href="/i/premium_sign_up"] > div > div > svg > g > path,
      .r-1loqt21[href="/i/premium_sign_up"] > div > svg > g > path {
        d: path(
          "M 8.52 3.59 c 0.8 -1.1 2.04 -1.84 3.48 -1.84 s 2.68 0.74 3.49 1.84 c 1.34 -0.21 2.74 0.14 3.76 1.16 s 1.37 2.42 1.16 3.77 c 1.1 0.8 1.84 2.04 1.84 3.48 s -0.74 2.68 -1.84 3.48 c 0.21 1.34 -0.14 2.75 -1.16 3.77 s -2.42 1.37 -3.76 1.16 c -0.8 1.1 -2.05 1.84 -3.49 1.84 s -2.68 -0.74 -3.48 -1.84 c -1.34 0.21 -2.75 -0.14 -3.77 -1.16 c -1.01 -1.02 -1.37 -2.42 -1.16 -3.77 c -1.09 -0.8 -1.84 -2.04 -1.84 -3.48 s 0.75 -2.68 1.84 -3.48 c -0.21 -1.35 0.14 -2.75 1.16 -3.77 s 2.43 -1.37 3.77 -1.16 Z m 3.48 0.16 c -0.85 0 -1.66 0.53 -2.12 1.43 l -0.38 0.77 l -0.82 -0.27 c -0.96 -0.32 -1.91 -0.12 -2.51 0.49 c -0.6 0.6 -0.8 1.54 -0.49 2.51 l 0.27 0.81 l -0.77 0.39 c -0.9 0.46 -1.43 1.27 -1.43 2.12 s 0.53 1.66 1.43 2.12 l 0.77 0.39 l -0.27 0.81 c -0.31 0.97 -0.11 1.91 0.49 2.51 c 0.6 0.61 1.55 0.81 2.51 0.49 l 0.82 -0.27 l 0.38 0.77 c 0.46 0.9 1.27 1.43 2.12 1.43 s 1.66 -0.53 2.12 -1.43 l 0.39 -0.77 l 0.82 0.27 c 0.96 0.32 1.9 0.12 2.51 -0.49 c 0.6 -0.6 0.8 -1.55 0.48 -2.51 l -0.26 -0.81 l 0.76 -0.39 c 0.91 -0.46 1.43 -1.27 1.43 -2.12 s -0.52 -1.66 -1.43 -2.12 l -0.77 -0.39 l 0.27 -0.81 c 0.32 -0.97 0.12 -1.91 -0.48 -2.51 c -0.61 -0.61 -1.55 -0.81 -2.51 -0.49 l -0.82 0.27 l -0.39 -0.77 c -0.46 -0.9 -1.27 -1.43 -2.12 -1.43 Z m 4.74 5.68 l -6.2 6.77 l -3.74 -3.74 l 1.41 -1.42 l 2.26 2.26 l 4.8 -5.23 l 1.47 1.36 Z"
        ) !important;
      }
  
      /* home */
      .r-eqz5dr[href="/home"] > div > div > svg > g > path {
        d: path(
          "M12,1.696 L0.622,8.807l1.06,1.696L3,9.679V19.5C3,20.881 4.119,22 5.5,22h13c1.381,0 2.5,-1.119 2.5,-2.5V9.679l1.318,0.824 1.06,-1.696L12,1.696ZM12,16.5c-1.933,0 -3.5,-1.567 -3.5,-3.5s1.567,-3.5 3.5,-3.5 3.5,1.567 3.5,3.5 -1.567,3.5 -3.5,3.5Z"
        ) !important;
      }
    `);
  }

  // -----------------------------------------------------------------------------------
  // TLの時間を相対時間から絶対時間に変更(HH:MM:SS･mm/dd/yy, week)
  // -----------------------------------------------------------------------------------
  // タイムスタンプモジュール
  const TimestampModule = {
    toFormattedDateString: function (date) {
      const YEAR = date.getFullYear().toString().slice(-2);
      const TIME = `${Utils.pad(date.getHours())}:${Utils.pad(date.getMinutes())}:${Utils.pad(date.getSeconds())}`;
      const DATE = `${Utils.pad(date.getMonth() + 1)}/${Utils.pad(date.getDate())}/${YEAR}, ${WEEKS_LANG[date.getDay()]}`;
      return `${TIME}･${DATE}`;
    },
    // タイムスタンプの更新
    updateTimestamps: function () {
      if (!config.useAbsoluteTime) return;

      const timeSelectors =
        'main div[data-testid="primaryColumn"] section article a[href*="/status/"] time, div.css-175oi2r.r-18u37iz.r-1q142lx div.css-175oi2r.r-1d09ksm.r-18u37iz.r-1wbh5a2 time';

      document.querySelectorAll(timeSelectors).forEach((timeElement) => {
        const parent = timeElement.parentNode;
        const span = Utils.createElement("span", {
          textContent: this.toFormattedDateString(
            new Date(timeElement.getAttribute("datetime"))
          ),
        });
        span.style.pointerEvents = "none";
        parent.appendChild(span);
        parent.removeChild(timeElement);
      });
    },
  };

  // -----------------------------------------------------------------------------------
  // サイドバーに時間、日付を表示(HH:MM:SS, mm/dd/yy, week)
  // -----------------------------------------------------------------------------------
  const SidebarModule = {
    createInfoElement: function (type) {
      if (!config.showTimeAndDateSidebar) return;

      const nav = document.querySelector(
        'div[class="css-175oi2r r-vacyoi r-ttdzmv"]'
      );
      if (!nav || document.getElementById(type)) return;

      const iconHTML =
        type === "time"
          ? '<i class="fa-regular fa-clock" style="width: 26.25px; height: 26.25px;"></i>'
          : '<i class="fa-solid fa-calendar-days" style="width: 26.25px; height: 26.25px;"></i>';

      const textContentFunc = () => {
        const date = new Date();
        const YEAR = date.getFullYear().toString().slice(-2);
        const TIME = `${Utils.pad(date.getHours())}:${Utils.pad(date.getMinutes())}:${Utils.pad(date.getSeconds())}`;
        const DATE = `${Utils.pad(date.getMonth() + 1)}/${Utils.pad(date.getDate())}/${YEAR}, ${WEEKS_LANG[date.getDay()]}`;

        return type === "time" ? `${TIME}` : `${DATE}`;
      };

      const infoElement = Utils.createElement("div", {
        id: type,
        classList: [
          "css-175oi2r",
          "r-6koalj",
          "r-eqz5dr",
          "r-16y2uox",
          "r-1habvwh",
          "r-cnw61z",
          "r-13qz1uu",
          "r-1loqt21",
          "r-1ny4l3l",
        ],
      });

      const container = Utils.createElement("div", {
        id: `${type}__container`,
        classList: [
          "css-175oi2r",
          "r-sdzlij",
          "r-dnmrzs",
          "r-1awozwy",
          "r-18u37iz",
          "r-1777fci",
          "r-xyw6el",
          "r-o7ynqc",
          "r-6416eg",
        ],
      });

      const icon = Utils.createElement("div", {
        id: `${type}__container__icon`,
        classList: ["css-175oi2r"],
        innerHTML: iconHTML,
      });

      const text = Utils.createElement("div", {
        id: `${type}__container__text`,
        classList: [
          "css-146c3p1",
          "r-dnmrzs",
          "r-1udh08x",
          "r-3s2u2q",
          "r-bcqeeo",
          "r-1ttztb7",
          "r-qvutc0",
          "r-1qd0xha",
          "r-adyw6z",
          "r-135wba7",
          "r-16dba41",
          "r-dlybji",
          "r-nazi8o",
        ],
      });

      const textContent = Utils.createElement("span", {
        id: `${type}__text__content`,
        classList: ["1jxf684", "r-bcqeeo", "r-1ttztb7", "r-qvutc0", "r-poiln3"],
        textContent: textContentFunc(),
      });

      text.appendChild(textContent);
      container.appendChild(icon);
      container.appendChild(text);
      infoElement.appendChild(container);
      nav.appendChild(infoElement);

      if (type === "time") {
        setInterval(() => {
          textContent.textContent = textContentFunc();
        }, 1000);
      }
    },

    init: function () {
      this.createInfoElement("time");
      this.createInfoElement("date");

      const observer = new MutationObserver(() => {
        this.createInfoElement("time");
        this.createInfoElement("date");
      });

      observer.observe(document.body, { childList: true, subtree: true });
    },
  };

  // -----------------------------------------------------------------------------------
  // 動画プレイヤーをデフォルトに戻す
  // -----------------------------------------------------------------------------------
  const VideoModule = {
    setupDefaultVideoPlayer: function (container) {
      if (!config.useDefaultVideoPlayer) return;

      const video = container.querySelector("div:first-child > div > video");
      if (!video) return;

      video.controls = true;
      video.removeAttribute("disablepictureinpicture");
      video.muted = false;

      const onClick = (e) => {
        e.preventDefault();
        video
          .play()
          .then(() => {
            video.muted = false;
          })
          .catch((error) => console.error("Video playback error:", error));

        const onVolumeChange = (e) => {
          if (e.target.muted) {
            e.target.muted = false;
          }
          e.target.removeEventListener("volumechange", onVolumeChange);
        };

        e.target.addEventListener("volumechange", onVolumeChange);
        video.removeEventListener("click", onClick);
      };

      video.addEventListener("click", onClick);

      container.parentElement.appendChild(video);
      container.remove();
    },

    observeVideos: function () {
      const observer = new MutationObserver(() => {
        const videoContainer = document.body.querySelector(
          'div[data-testid="videoComponent"]:not(.enhanced-video)'
        );
        if (videoContainer) {
          videoContainer.classList.add("enhanced-video");
          setTimeout(() => this.setupDefaultVideoPlayer(videoContainer), 100);
        }
      });

      observer.observe(document.body, { subtree: true, childList: true });
    },
  };

  // -----------------------------------------------------------------------------------
  // Tweet Engagements をアクセスしやすく
  // -----------------------------------------------------------------------------------
  const TweetEngagementModule = {
    createQuoteButton: function () {
      const buttonWrapper = Utils.createElement("div", {
        classList: ["css-175oi2r", "r-18u37iz", "r-1h0z5md", "r-13awgt0"],
      });

      const link = Utils.createElement("a", {
        attributes: {
          href: `${window.location.pathname}/quotes`,
          "data-testid": "tweetEngagements",
        },
        classList: [
          "css-175oi2r",
          "r-1777fci",
          "r-bt1l66",
          "r-bztko3",
          "r-lrvibr",
          "r-1loqt21",
          "r-1ny4l3l",
        ],
      });

      link.addEventListener("click", (event) => {
        event.preventDefault();
        location.href = event.currentTarget.getAttribute("href");
      });

      const contentDiv = Utils.createElement("div", {
        attributes: { dir: "ltr" },
        classList: [
          "css-146c3p1",
          "r-bcqeeo",
          "r-1ttztb7",
          "r-qvutc0",
          "r-1qd0xha",
          "r-a023e6",
          "r-rjixqe",
          "r-16dba41",
          "r-1awozwy",
          "r-6koalj",
          "r-1h0z5md",
          "r-o7ynqc",
          "r-clp7b1",
          "r-3s2u2q",
        ],
      });
      contentDiv.style.textOverflow = "unset";
      contentDiv.style.color = "rgb(113, 118, 123)";

      const iconDiv = Utils.createElement("div", {
        classList: ["css-175oi2r", "r-xoduu5"],
        innerHTML: `
          <div class="css-175oi2r r-xoduu5 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-1niwhzg r-sdzlij r-xf4iuw r-o7ynqc r-6416eg r-1ny4l3l"></div>
          <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-50lct3 r-1srniue">
            <g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g>
          </svg>
        `,
      });

      const countDiv = Utils.createElement("div", {
        classList: ["css-175oi2r", "r-xoduu5", "r-1udh08x"],
        innerHTML: `
          <span data-testid="app-text-transition-container" style="transition-property: transform; transition-duration: 0.3s; transform: translate3d(0px, 0px, 0px);">
            <span class="css-1jxf684 r-1ttztb7 r-qvutc0 r-poiln3 r-n6v787 r-1cwl3u0 r-1k6nrdp r-n7gxbd" style="text-overflow: unset">
              <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset">Quotes</span>
            </span>
          </span>
        `,
      });

      contentDiv.appendChild(iconDiv);
      contentDiv.appendChild(countDiv);
      link.appendChild(contentDiv);
      buttonWrapper.appendChild(link);

      return buttonWrapper;
    },

    // 投稿ページかどうかを判定
    isTweetPage: function () {
      return (
        document.querySelector(
          "div.css-175oi2r.r-1kbdv8c.r-18u37iz.r-1oszu61.r-3qxfft.r-n7gxbd.r-2sztyj.r-1efd50x.r-5kkj8d.r-h3s6tt.r-1wtj0ep"
        ) !== null
      );
    },

    addQuoteElement: function () {
      // 投稿ページの場合ボタンを表示
      if (!this.isTweetPage()) {
        return;
      }

      const targetDiv = document.querySelector('div[role="group"][id^="id__"]');
      if (
        !targetDiv ||
        targetDiv.querySelector('[data-testid="tweetEngagements"]')
      ) {
        return;
      }

      const quoteButton = this.createQuoteButton();
      targetDiv.insertBefore(quoteButton, targetDiv.children[4]);
    },

    init: function () {
      const debouncedAddQuoteElement = Utils.debounce(
        () => this.addQuoteElement(),
        250
      );

      // URL変更の監視
      let lastUrl = location.href;
      const urlObserver = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          debouncedAddQuoteElement();
        }
      });

      urlObserver.observe(document, { subtree: true, childList: true });

      const retryInterval = setInterval(debouncedAddQuoteElement, 1000);

      window.addEventListener("popstate", debouncedAddQuoteElement);
      history.pushState = ((origPushState) => {
        return function (state, title, url) {
          origPushState.apply(this, arguments);
          debouncedAddQuoteElement();
        };
      })(history.pushState);

      history.replaceState = ((origReplaceState) => {
        return function (state, title, url) {
          origReplaceState.apply(this, arguments);
          debouncedAddQuoteElement();
        };
      })(history.replaceState);

      // DOMContentLoaded で初期化
      document.addEventListener("DOMContentLoaded", () => {
        debouncedAddQuoteElement();
        clearInterval(retryInterval);
      });

      debouncedAddQuoteElement();
    },
  };

  // -----------------------------------------------------------------------------------
  // メイン処理
  // -----------------------------------------------------------------------------------
  function main() {
    loadConfig();
    SettingsModule.createSettingsUI();
    setupKeyboardShortcut();
    setupMenuCommand();

    // タイムスタンプの更新を定期的に実行
    setInterval(() => TimestampModule.updateTimestamps(), 1000);

    // アイコン情報表示を初期化
    replaceTwitterIcons();

    // サイドバーの情報表示を初期化
    SidebarModule.init();

    // 動画プレイヤーの設定を監視
    VideoModule.observeVideos();

    // 引用ツイートボタンの追加を初期化
    TweetEngagementModule.init();
  }

  // ページ読み込み時にメイン処理を実行
  window.addEventListener("load", main);
})();

