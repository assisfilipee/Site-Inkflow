(() => {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCaption = document.getElementById("lightboxCaption");

  if (!lb || !lbImg || !lbCaption) return;

  let items = [];
  let index = 0;
  let lastFocused = null;

  const openLb = (newItems, startIndex) => {
    items = newItems;
    index = startIndex;

    lastFocused = document.activeElement;

    render();
    lb.style.display = "block";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLb = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lb.style.display = "none";
    document.body.style.overflow = "";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  const render = () => {
    const it = items[index];
    if (!it) return;

    lbImg.src = it.src;
    lbImg.alt = it.alt || "";
    lbCaption.textContent = it.alt || "";

    if (items.length > 1) {
      const nextIt = items[(index + 1) % items.length];
      const prevIt = items[(index - 1 + items.length) % items.length];
      [nextIt, prevIt].forEach((x) => {
        if (!x?.src) return;
        const img = new Image();
        img.src = x.src;
      });
    }
  };

  const prev = () => {
    if (!items.length) return;
    index = (index - 1 + items.length) % items.length;
    render();
  };

  const next = () => {
    if (!items.length) return;
    index = (index + 1) % items.length;
    render();
  };

  const isValidImg = (img) => {
    if (!img) return false;
    if (img.closest(".nav__logo")) return false;
    return !!(img.currentSrc || img.src);
  };

  const getStylesItems = () => {
    const imgs = Array.from(document.querySelectorAll(".stylesGrid .styleCard img")).filter(isValidImg);
    return imgs.map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.getAttribute("alt") || "",
      instagram: null,
    }));
  };

  const getGalleryItems = (galleryRoot) => {
    const buttons = Array.from(galleryRoot.querySelectorAll(".gallery__item"));
    return buttons
      .map((btn) => {
        const img = btn.querySelector("img");
        if (!img || !isValidImg(img)) return null;

        const full = btn.dataset.full && btn.dataset.full.trim() ? btn.dataset.full.trim() : null;
        const instagram = btn.dataset.instagram && btn.dataset.instagram.trim() ? btn.dataset.instagram.trim() : null;

        return {
          src: full || img.currentSrc || img.src,
          alt: img.getAttribute("alt") || "",
          instagram,
        };
      })
      .filter(Boolean);
  };

  document.addEventListener("click", (e) => {
    const styleImg = e.target.closest(".stylesGrid .styleCard img");
    const galleryImg = e.target.closest(".gallery__item img");

    if (!styleImg && !galleryImg) return;

    e.preventDefault();

    if (styleImg) {
      const list = getStylesItems();
      const startSrc = styleImg.currentSrc || styleImg.src;
      const start = list.findIndex((it) => it.src === startSrc);
      openLb(list, Math.max(0, start));
      return;
    }

    if (galleryImg) {
      const btn = galleryImg.closest(".gallery__item");
      const groupRoot = btn?.closest(".gallery");
      if (!groupRoot) return;

      const list = getGalleryItems(groupRoot);

      const full = btn?.dataset.full && btn.dataset.full.trim() ? btn.dataset.full.trim() : null;
      const startSrc = full || galleryImg.currentSrc || galleryImg.src;

      const start = list.findIndex((it) => it.src === startSrc);
      openLb(list, Math.max(0, start));
    }
  });

  lb.addEventListener("click", (e) => {
    const t = e.target;

    if (t.matches("[data-lb-close]")) closeLb();
    if (t.matches("[data-lb-prev]")) prev();
    if (t.matches("[data-lb-next]")) next();
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;

    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  let touchStartX = 0;
  lb.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  lb.addEventListener(
    "touchend",
    (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - touchStartX;

      if (Math.abs(diff) < 40) return;
      if (diff > 0) prev();
      else next();
    },
    { passive: true }
  );
})();

(() => {
  const slider = document.querySelector(".t-slider");
  if (!slider) return;

  const track = slider.querySelector(".t-slider__track");
  const prevBtn = slider.querySelector(".t-slider__btn--prev");
  const nextBtn = slider.querySelector(".t-slider__btn--next");
  const slides = Array.from(slider.querySelectorAll(".t-slide"));

  if (!track || !prevBtn || !nextBtn || slides.length === 0) return;

  let index = 0;
  let timer = null;

  const clampIndex = () => {
    const max = slides.length - 1;
    if (index > max) index = 0;
    if (index < 0) index = max;
  };

  // ===== AJUSTE CERTO: track gigante + move por “passo” (%) =====
  const setSizes = () => {
    track.style.width = `${slides.length * 100}%`;

    slides.forEach((s) => {
      s.style.flex = "0 0 100%";
      s.style.width = "100%";
    });
  };

  const update = () => {
    clampIndex();

    const step = 100 / slides.length; // <<<<<< aqui é o segredo
    track.style.transform = `translateX(-${index * step}%)`;
  };
  // ============================================================

  const next = () => {
    index++;
    update();
  };

  const prev = () => {
    index--;
    update();
  };

  const stopAuto = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const startAuto = () => {
    const autoplay = slider.dataset.autoplay === "true";
    const interval = Number(slider.dataset.interval || 6000);

    if (!autoplay) return;

    stopAuto();
    timer = window.setInterval(() => {
      next();
    }, interval);
  };

  prevBtn.addEventListener("click", () => {
    stopAuto();
    prev();
    startAuto();
  });

  nextBtn.addEventListener("click", () => {
    stopAuto();
    next();
    startAuto();
  });

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);

  window.addEventListener("resize", () => {
    setSizes();
    update();
  });

  setSizes();
  update();
  startAuto();
})();
