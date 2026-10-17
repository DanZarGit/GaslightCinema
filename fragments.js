/* Click-to-reveal fragments for deck-stage.
   Mark elements with class "fragment" (optionally data-step="N" to group
   several elements into one reveal). Forward nav reveals the next step;
   back nav hides the last; once all steps are shown, nav moves to the
   next slide as usual. */
(function () {
  function init(deck) {
    function currentSlide() {
      const slides = deck.querySelectorAll(':scope > section');
      return slides[deck._index] || null;
    }
    function steps(slide) {
      const frags = [...slide.querySelectorAll('.fragment')];
      const map = new Map();
      frags.forEach((el, i) => {
        const s = el.hasAttribute('data-step') ? +el.getAttribute('data-step') : i + 1;
        if (!map.has(s)) map.set(s, []);
        map.get(s).push(el);
      });
      return [...map.keys()].sort((a, b) => a - b).map((k) => map.get(k));
    }
    function shownCount(slide) {
      return +(slide.getAttribute('data-frag-shown') || 0);
    }
    function apply(slide, n) {
      const st = steps(slide);
      st.forEach((group, i) => {
        group.forEach((el) => el.classList.toggle('frag-on', i < n));
      });
      slide.setAttribute('data-frag-shown', n);
    }

    const origAdvance = deck._advance.bind(deck);
    deck._advance = function (dir, reason) {
      const slide = currentSlide();
      if (slide) {
        const total = steps(slide).length;
        const shown = shownCount(slide);
        if (dir > 0 && shown < total) { apply(slide, shown + 1); return; }
        if (dir < 0 && shown > 0) { apply(slide, shown - 1); return; }
      }
      origAdvance(dir, reason);
    };

    // Reset fragments to hidden whenever a slide becomes active.
    deck.addEventListener('slidechange', () => {
      const slide = currentSlide();
      if (slide && slide.querySelector('.fragment')) apply(slide, 0);
    });

    // Initial state.
    const s = currentSlide();
    if (s && s.querySelector('.fragment')) apply(s, 0);
  }

  function wait() {
    const deck = document.querySelector('deck-stage');
    if (deck && deck._advance && deck._slides && deck._slides.length) {
      init(deck);
    } else {
      requestAnimationFrame(wait);
    }
  }
  wait();
})();
