/* =====================================================================
   Fast Track International — main.js  (jQuery 3.7 · Bootstrap 5.3)
   ===================================================================== */
(function ($) {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $(function () {
    var $win = $(window);
    var $nav = $(".site-nav");
    var $toTop = $("#toTop");

    $("html").removeClass("no-js");

    /* ---------- Active menu item (from <body data-page>) ---------- */
    var page = $("body").data("page");
    if (page) {
      $('[data-nav="' + page + '"]').addClass("active").attr("aria-current", "page");
      if (page === "ielts" || page === "pte") $('[data-nav="courses"]').addClass("active");
    }

    /* ---------- Footer year ---------- */
    $(".js-year").text(new Date().getFullYear());

    /* ---------- Entrance animations ---------- */
    var $reveals = $(".reveal, .reveal-img");
    if (REDUCED) { $reveals.addClass("in"); $reveals = $(); }
    function reveal() {
      if (!$reveals.length) return;
      var line = $win.scrollTop() + $win.height() * 0.88;
      $reveals = $reveals.filter(function () {
        var $el = $(this);
        if ($el.offset().top < line) {
          setTimeout(function () { $el.addClass("in"); }, parseInt($el.data("delay"), 10) || 0);
          return false;
        }
        return true;
      });
    }

    /* ---------- Scroll (rAF-throttled) ---------- */
    var ticking = false;
    function onScroll() {
      var y = $win.scrollTop();
      $nav.toggleClass("scrolled", y > 8);
      $toTop.toggleClass("show", y > 700);
      reveal();
      ticking = false;
    }
    $win.on("scroll resize", function () {
      if (!ticking) { ticking = true; (window.requestAnimationFrame || setTimeout)(onScroll); }
    });
    onScroll();

    $toTop.on("click", function () {
      $("html, body").stop().animate({ scrollTop: 0 }, REDUCED ? 0 : 600);
    });

    /* ---------- In-page anchors ---------- */
    $('a[href^="#"]').not("[data-bs-toggle], .js-switch-pane, .skip-link").on("click", function (e) {
      var id = $(this).attr("href");
      if (id.length < 2 || !$(id).length) return;
      e.preventDefault();
      $("html, body").stop().animate({ scrollTop: $(id).offset().top - ($nav.outerHeight() || 70) }, REDUCED ? 0 : 600);
    });

    /* ---------- External links open in a new tab ---------- */
    $('a[href^="http"]').filter(function () {
      return this.hostname && this.hostname !== location.hostname;
    }).attr({ target: "_blank", rel: "noopener noreferrer" });

    /* ---------- Close mobile menu after choosing a link ---------- */
    $(".site-nav .nav-link:not(.dropdown-toggle), .nav-dd a, .nav-portal").on("click", function () {
      var el = document.getElementById("siteMenu");
      if (el && el.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(el).hide();
    });

    /* ---------- Video modal ---------- */
    // var $vm = $("#videoModal");
    // if ($vm.length) {
    //   var $frame = $vm.find("iframe");
    //   $vm.on("show.bs.modal", function (e) {
    //     var id = $(e.relatedTarget).data("video") || $frame.data("video");
    //     $frame.attr("src", "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1");
    //   }).on("hidden.bs.modal", function () { $frame.attr("src", ""); });
    // }

    /* ---------------- Latest news — 3D parallax image ring ---------------- */
    if ($(".news-ring").length && typeof Swiper !== "undefined") {
      initNewsRing();
    }

    function initNewsRing() {
      var STEP = 30;      // degrees between neighbouring cards
      var MAX_VISIBLE = 3.4; // cards beyond this progress are hidden

      function radius(sw) {
        // Ring radius so neighbouring cards sit just apart on the circle
        var w = $(sw.slides[0]).outerWidth() || 330;
        var k = window.innerWidth < 576 ? 0.42 : 0.6;
        return (w * k) / Math.sin((STEP / 2) * Math.PI / 180);
      }

      function layout(sw) {
        var R = radius(sw);
        $.each(sw.slides, function (i, slide) {
          var p = slide.progress;                 // 0 = centre, ±1 = neighbours
          var clamped = Math.max(-MAX_VISIBLE, Math.min(MAX_VISIBLE, p));
          var angle = -clamped * STEP;            // degrees around the ring
          var rad = angle * Math.PI / 180;
          var x = R * Math.sin(rad);
          var z = R * (Math.cos(rad) - 1);
          // cancel Swiper's linear offset (virtualTranslate) and place on ring
          var tx = -slide.swiperSlideOffset + (sw.width - slide.swiperSlideSize) / 2 + x;
          var abs = Math.abs(p);
          var $s = $(slide);

          $s.css({
            transform: "translate3d(" + tx + "px,0," + z + "px) rotateY(" + angle + "deg)",
            opacity: abs > MAX_VISIBLE ? 0 : Math.max(0, 1 - abs * 0.28),
            zIndex: 100 - Math.round(abs * 10),
            pointerEvents: abs > 1.5 ? "none" : "auto"
          });
          // inner image parallax — drifts opposite to ring motion
          $s.find(".ring-thumb img").css({
            transform: "translate3d(" + (clamped * 9) + "%,0,0)",
            filter: abs < 0.5 ? "none" : "saturate(" + Math.max(0.35, 1 - abs * 0.3) + ") brightness(" + Math.max(0.85, 1 - abs * 0.06) + ")"
          });
        });
      }

      var ring = new Swiper(".news-ring", {
        slidesPerView: "auto",
        centeredSlides: true,
        loop: true,
        loopAdditionalSlides: 3,
        speed: 900,
        grabCursor: true,
        watchSlidesProgress: true,
        virtualTranslate: true,
        slideToClickedSlide: true,
        keyboard: { enabled: true },
        mousewheel: { forceToAxis: true },
        autoplay: { delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true },
        on: {
          setTranslate: function (sw) { layout(sw); },
          setTransition: function (sw, d) {
            $(sw.slides).css("transition-duration", d + "ms")
              .find(".ring-thumb img").css("transition-duration", d + "ms");
          },
          resize: function (sw) { layout(sw); }
        }
      });
      layout(ring);
      
      // Arrow buttons — driven by jQuery (Swiper's built-in prev fails with loop + custom 3D effect)
      var busy = false;
      function go(step) {
        if (busy) return;                       // ignore clicks while the ring is still turning
        busy = true;
        ring.autoplay && ring.autoplay.stop();
        var n = ring.slides.length;
        var target = (ring.realIndex + step + n) % n;   // wraps 0 → last and last → 0
        ring.slideToLoop(target, ring.params.speed);
        setTimeout(function () {
          busy = false;
          ring.autoplay && ring.autoplay.start();
        }, ring.params.speed);
      }
      $(".ring-prev").on("click", function (e) { e.preventDefault(); go(-1); });
      $(".ring-next").on("click", function (e) { e.preventDefault(); go(1); });
    }

    /* ---------- Offer countdown ---------- */
    var $cd = $(".js-countdown");
    if ($cd.length) {
      var end = new Date($cd.data("end")).getTime();
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      var timer;
      var tick = function () {
        var d = Math.max(0, end - Date.now());
        $cd.find("[data-cd=d]").text(pad(Math.floor(d / 864e5)));
        $cd.find("[data-cd=h]").text(pad(Math.floor((d % 864e5) / 36e5)));
        $cd.find("[data-cd=m]").text(pad(Math.floor((d % 36e5) / 6e4)));
        $cd.find("[data-cd=s]").text(pad(Math.floor((d % 6e4) / 1e3)));
        if (d === 0) { clearInterval(timer); $cd.closest("[data-offer]").addClass("is-ended"); }
      };
      tick();
      timer = setInterval(tick, 1000);
    }

    /* ---------- "Read more" on touch: grow the line on first tap ---------- */
    $(document).on("touchstart", ".read-more", function () {
      $(".read-more").not(this).removeClass("is-open");
      $(this).addClass("is-open");
    });

    /* ---------- Form validation (front-end only) ---------- */
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE = /^\+?[0-9\s-]{10,16}$/;
    function check($f) {
      var v = $.trim($f.val() || "");
      var ok = true;
      if ($f.is(":checkbox")) ok = !$f.prop("required") || $f.is(":checked");
      else if ($f.prop("required") && !v) ok = false;
      if (ok && v && $f.attr("type") === "email") ok = EMAIL.test(v);
      if (ok && v && $f.attr("type") === "tel") ok = PHONE.test(v);
      if (ok && $f.data("minlength")) ok = v.length >= +$f.data("minlength");
      if (ok && $f.data("match")) ok = v === $($f.data("match")).val();
      $f.toggleClass("is-invalid", !ok).attr("aria-invalid", ok ? null : "true");
      return ok;
    }
    $(".js-validate").attr("novalidate", "novalidate").each(function () {
      var $form = $(this);
      $form.on("input change", "input, select, textarea", function () {
        if ($(this).hasClass("is-invalid")) check($(this));
      });
      $form.on("submit", function (e) {
        e.preventDefault();
        var valid = true;
        $form.find("input, select, textarea").each(function () { if (!check($(this))) valid = false; });
        var $msg = $form.find(".form-msg");
        if (!valid) {
          $msg.removeClass("ok").addClass("err").text("Please check the highlighted fields.");
          $form.find(".is-invalid").first().trigger("focus");
          return;
        }
        // TODO: connect this form to your backend or email service.
        var $btn = $form.find("[type=submit]");
        var html = $btn.html();
        $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Sending');
        setTimeout(function () {
          $btn.prop("disabled", false).html(html);
          $msg.removeClass("err").addClass("ok").text($form.data("success") || "Thank you — we'll be in touch.");
          $form[0].reset();
          $form.find(".pw-meter").attr("data-score", 0);
        }, 800);
      });
    });

    /* ---------- Student portal tabs ---------- */
    var $tabs = $(".auth-tabs");
    if ($tabs.length) {
      var show = function (name) {
        $tabs.find("button").removeClass("active").attr({ "aria-selected": "false", tabindex: -1 })
          .filter('[data-pane="' + name + '"]').addClass("active").attr({ "aria-selected": "true", tabindex: 0 });
        $(".auth-pane").removeClass("active").attr("hidden", true).filter("#pane-" + name).addClass("active").removeAttr("hidden");
        $(".form-msg").text("");
      };
      $tabs.on("click", "button", function () { show($(this).data("pane")); });
      $tabs.on("keydown", "button", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          var $b = $(this).siblings("button").first();
          show($b.data("pane")); $b.trigger("focus");
        }
      });
      $(".js-switch-pane").on("click", function (e) { e.preventDefault(); show($(this).data("pane")); });
      if (location.hash === "#register") show("register");
    }

    $(document).on("click", ".pw-toggle", function () {
      var $i = $(this).siblings("input");
      var reveal = $i.attr("type") === "password";
      $i.attr("type", reveal ? "text" : "password");
      $(this).attr("aria-label", reveal ? "Hide password" : "Show password").find("i").toggleClass("bi-eye bi-eye-slash");
    });

    $(document).on("input", ".js-pw-strength", function () {
      var v = $(this).val(), s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      $(this).closest(".col-md-6, .col-12, .mb-3").find(".pw-meter").attr("data-score", v ? Math.max(1, s) : 0);
    });
  });
})(jQuery);
