/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {
  // 全站页面转场时长，单位为毫秒。数值越大，动作越慢。
  const transitionMs = {
    openLine: 300,     // 打开页面：两条线从中央展开
    fadeIn: 1500,       // 打开页面：文字和背景逐渐显现
    closeLine: 1000,    // 关闭页面：两条线向中央合拢
    fadeOut: 300,      // 关闭页面：文字和背景逐渐消失
    resizeLine: 350,   // 跨页交接：中央单线变为下一页的宽度
  };
  var $window = $(window),
    $body = $("body"),
    $wrapper = $("#wrapper"),
    $header = $("#header"),
    $footer = $("#footer"),
    $main = $("#main"),
    $main_articles = $main.children("article");

  // Breakpoints.
  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: ["361px", "480px"],
    xxsmall: [null, "360px"],
  });

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Fix: Flexbox min-height bug on IE.
  if (browser.name == "ie") {
    var flexboxFixTimeoutId;

    $window
      .on("resize.flexbox-fix", function () {
        clearTimeout(flexboxFixTimeoutId);

        flexboxFixTimeoutId = setTimeout(function () {
          if ($wrapper.prop("scrollHeight") > $window.height())
            $wrapper.css("height", "auto");
          else $wrapper.css("height", "100vh");
        }, 250);
      })
      .triggerHandler("resize.flexbox-fix");
  }

  // Nav.
  var $nav = $header.children("nav"),
    $nav_li = $nav.find("li");

  // Add "middle" alignment classes if we're dealing with an even number of items.
  if ($nav_li.length % 2 == 0) {
    $nav.addClass("use-middle");
    $nav_li.eq($nav_li.length / 2).addClass("is-middle");
  }

  // Main.
  var delay = 325,
    locked = false;

  // Methods.
  $main._show = function (id, initial) {
    var $article = $main_articles.filter("#" + id);

    // No such article? Bail.
    if ($article.length == 0) return;

    // Handle lock.

    // Already locked? Speed through "show" steps w/o delays.
    if (locked || (typeof initial != "undefined" && initial === true)) {
      // Mark as switching.
      $body.addClass("is-switching");

      // Mark as visible.
      $body.addClass("is-article-visible");

      // Deactivate all articles (just in case one's already active).
      $main_articles.removeClass("active");

      // Hide header, footer.
      $header.hide();
      $footer.hide();

      // Show main, article.
      $main.show();
      $article.show();

      // Activate article.
      $article.addClass("active");

      // Unlock.
      locked = false;

      // Unmark as switching.
      setTimeout(
        function () {
          $body.removeClass("is-switching");
        },
        initial ? 1000 : 0
      );

      return;
    }

    // Lock.
    locked = true;

    // Article already visible? Just swap articles.
    if ($body.hasClass("is-article-visible")) {
      // Deactivate current article.
      var $currentArticle = $main_articles.filter(".active");

      $currentArticle.removeClass("active");

      // Show article.
      setTimeout(function () {
        // Hide current article.
        $currentArticle.hide();

        // Show article.
        $article.show();

        // Activate article.
        setTimeout(function () {
          $article.addClass("active");

          // Window stuff.
          $window.scrollTop(0).triggerHandler("resize.flexbox-fix");

          // Unlock.
          setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }

    // Otherwise, handle as normal.
    else {
      // Mark as visible.
      $body.addClass("is-article-visible");

      // Show article.
      setTimeout(function () {
        // Hide header, footer.
        $header.hide();
        $footer.hide();

        // Show main, article.
        $main.show();
        $article.show();

        // Activate article.
        setTimeout(function () {
          $article.addClass("active");

          // Window stuff.
          $window.scrollTop(0).triggerHandler("resize.flexbox-fix");

          // Unlock.
          setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }
  };

  $main._hide = function (addState) {
    var $article = $main_articles.filter(".active");

    // Article not visible? Bail.
    if (!$body.hasClass("is-article-visible")) return;

    // Add state?
    if (typeof addState != "undefined" && addState === true)
      history.pushState(null, null, "#");

    // Handle lock.

    // Already locked? Speed through "hide" steps w/o delays.
    if (locked) {
      // Mark as switching.
      $body.addClass("is-switching");

      // Deactivate article.
      $article.removeClass("active");

      // Hide article, main.
      $article.hide();
      $main.hide();

      // Show footer, header.
      $footer.show();
      $header.show();

      // Unmark as visible.
      $body.removeClass("is-article-visible");

      // Unlock.
      locked = false;

      // Unmark as switching.
      $body.removeClass("is-switching");

      // Window stuff.
      $window.scrollTop(0).triggerHandler("resize.flexbox-fix");

      return;
    }

    // Lock.
    locked = true;

    // Deactivate article.
    $article.removeClass("active");

    // Hide article.
    setTimeout(function () {
      // Hide article, main.
      $article.hide();
      $main.hide();

      // Show footer, header.
      $footer.show();
      $header.show();

      // Unmark as visible.
      setTimeout(function () {
        $body.removeClass("is-article-visible");

        // Window stuff.
        $window.scrollTop(0).triggerHandler("resize.flexbox-fix");

        // Unlock.
        setTimeout(function () {
          locked = false;
        }, delay);
      }, 25);
    }, delay);
  };

  // Articles.
  $main_articles.each(function () {
    var $this = $(this);

    // Close.
    $('<div class="close">Close</div>')
      .appendTo($this)
      .on("click", function () {
        if (history.length > 1) {
          history.back(); // 返回上一页
        } else {
          location.hash = ""; // 如果没有历史记录，则清空 hash
        }
      });

    // Prevent clicks from inside article from bubbling.
    $this.on("click", function (event) {
      event.stopPropagation();
    });
  });

  // Events.
  $body.on("click", function (event) {
    // Article visible? Hide.
    if ($body.hasClass("is-article-visible")) $main._hide(true);
  });

  $window.on("keyup", function (event) {
    switch (event.keyCode) {
      case 27:
        // Article visible? Hide.
        if ($body.hasClass("is-article-visible")) $main._hide(true);

        break;

      default:
        break;
    }
  });

  $window.on("hashchange", function (event) {
    // Empty hash?
    if (location.hash == "" || location.hash == "#") {
      // Prevent default.
      event.preventDefault();
      event.stopPropagation();

      // Hide.
      $main._hide();
    }

    // Otherwise, check for a matching article.
    else if ($main_articles.filter(location.hash).length > 0) {
      // Prevent default.
      event.preventDefault();
      event.stopPropagation();

      // Show article.
      $main._show(location.hash.substr(1));
    }
  });

  // Scroll restoration.
  // This prevents the page from scrolling back to the top on a hashchange.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  else {
    var oldScrollPos = 0,
      scrollPos = 0,
      $htmlbody = $("html,body");

    $window
      .on("scroll", function () {
        oldScrollPos = scrollPos;
        scrollPos = $htmlbody.scrollTop();
      })
      .on("hashchange", function () {
        $window.scrollTop(oldScrollPos);
      });
  }

  // Initialize.

  // // Hide main, articles.
  // 	$main.hide();
  // 	$main_articles.hide();

  // 不再隐藏 main 和文章。
  $main_articles.show(); // 如果需要显示所有文章
  $main.show();

  // Initial article.
  if (location.hash != "" && location.hash != "#")
    $window.on("load", function () {
      $main._show(location.hash.substr(1), true);
    });

  // 文章末尾获取时间
  document.addEventListener("DOMContentLoaded", () => {
    const lastEditedElement = document.getElementById("last-edited");

    if (lastEditedElement) {
      // 获取当前日期和时间
      const now = new Date();
      const formattedDate = now
        .toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // 12小时制
        })
        .replace(",", ""); // 移除默认的逗号分隔符

      // 动态插入最后编辑日期
      lastEditedElement.innerHTML = `<p><strong>Last Edited:</strong> ${formattedDate}</p>`;

      // 将日期存储到浏览器的 Local Storage（可选）
      localStorage.setItem("lastEditedDate", formattedDate);
    }
  });
  function findPageLines() {
    const middle = document.querySelector(".page-frame > .page-middle");
    if (middle) return { element: middle, pair: true };

    const panel = document.querySelector("#header .content");
    if (panel) return { element: panel, pair: true };

    const title = document.querySelector("#main article .major");
    if (title) return { element: title, pair: false };

    return null;
  }

  function getLinePositions(pageLines) {
    const rect = pageLines.element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;

    return {
      x,
      width: rect.width,
      upper: pageLines.pair ? rect.top : rect.bottom,
      lower: rect.bottom,
    };
  }
    function createLineLayer(width) {
    const layer = document.createElement("div");
    layer.className = "page-transition";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `
      <div class="page-transition-shade"></div>
      <div class="page-transition-line"></div>
      <div class="page-transition-line"></div>
    `;

    document.body.append(layer);
    const lines = [...layer.querySelectorAll(".page-transition-line")];
    for (const line of lines) line.style.width = `${width}px`;

    document.documentElement.classList.add("line-transition-active");
    return {
      layer,
      lines,
      shade: layer.querySelector(".page-transition-shade"),
    };
  }

  function centerFrame(width) {
    return {
      left: "var(--line-center-x)",
      top: "var(--line-center-y)",
      width: `${width}px`,
    };
  }

  function pageFrame(position, y) {
    return {
      left: `${position.x}px`,
      top: `${y}px`,
      width: `${position.width}px`,
    };
  }

  function play(element, frames, duration) {
    return element.animate(frames, {
      duration,
      easing: "ease-in-out",
      fill: "forwards",
    }).finished;
  }

  function moveLines(view, position, opening) {
    const heights = [position.upper, position.lower];

    return Promise.all(view.lines.map((line, index) => {
      const center = centerFrame(position.width);
      const edge = pageFrame(position, heights[index]);
      const duration = opening ? transitionMs.openLine : transitionMs.closeLine;
      return play(line, opening ? [center, edge] : [edge, center], duration);
    }));
  }
    const pageLines = findPageLines();
  const motionAllowed = !window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const storageKey = "site-line-transition";

  if (pageLines && motionAllowed) {
    let busy = false;

    function clearLayer() {
      document.querySelector(".page-transition")?.remove();
      document.documentElement.classList.remove("line-transition-active");
      busy = false;
    }

    async function enterPage() {
      const initial = getLinePositions(pageLines);
      let previousWidth = initial.width;

      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey));
        sessionStorage.removeItem(storageKey);
        if (saved?.path === location.pathname && saved.width > 0) {
          previousWidth = saved.width;
        }
      } catch {
        // 存储不可用时，直接使用本页宽度。
      }

      const view = createLineLayer(previousWidth);
      busy = true;

      try {
        // 旧模板会在 load 后展开 Resume 面板或激活 Blog 文章。
        // 黑色转场层先盖住页面，再读取稳定后的目标位置。
        if (document.readyState !== "complete") {
          await new Promise(resolve =>
            window.addEventListener("load", resolve, { once: true })
          );
        }

        if (!document.querySelector(".page-frame, .home-menu")) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }

        const target = getLinePositions(pageLines);

        if (Math.abs(previousWidth - target.width) > 1) {
          await Promise.all(view.lines.map(line =>
            play(line, [centerFrame(previousWidth), centerFrame(target.width)], transitionMs.resizeLine)
          ));
        }

        await Promise.all([
          moveLines(view, target, true),
          play(view.shade, [{ opacity: 1 }, { opacity: 0 }], transitionMs.fadeIn),
        ]);
      } finally {
        clearLayer();
      }
    }

    enterPage();

    document.addEventListener("click", async event => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

      const url = new URL(link.href);
      if (url.origin !== location.origin || url.protocol !== location.protocol) return;
      if (url.pathname === location.pathname || !url.pathname.endsWith(".html")) return;

      event.preventDefault();
      if (busy) return;
      busy = true;

      const source = getLinePositions(pageLines);
      const view = createLineLayer(source.width);

      try {
        await Promise.all([
          moveLines(view, source, false),
          play(view.shade, [{ opacity: 0 }, { opacity: 1 }], transitionMs.fadeOut),
        ]);

        try {
          sessionStorage.setItem(storageKey, JSON.stringify({
            path: url.pathname,
            width: source.width,
          }));
        } catch {
          // 存储不可用时，仍然正常跳转。
        }
      } finally {
        window.location.assign(url.href);
      }
    });

    window.addEventListener("pageshow", event => {
      if (event.persisted) clearLayer();
    });
  }
})(jQuery);
