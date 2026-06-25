/*
 * Dispara animações dos elementos com a classe `.animate-on-scroll`
 * quando entram no viewport (uma única vez por elemento).
 */
(function () {
  const once = true;
  if (!window.__inViewIO) {
    window.__inViewIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          if (once) window.__inViewIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  }
  window.initInViewAnimations = function (selector = ".animate-on-scroll") {
    document.querySelectorAll(selector).forEach((el) => {
      window.__inViewIO.observe(el);
    });
  };
  document.addEventListener("DOMContentLoaded", () => initInViewAnimations());
})();
