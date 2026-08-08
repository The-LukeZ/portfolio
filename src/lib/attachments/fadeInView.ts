let observer: IntersectionObserver | undefined;

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      }
    },
    { threshold: 0.1 },
  );
  return observer;
}

/** Attachment: observes an element for scroll-into-view fade/scale animations (`.fade-in` / `.scale-up` in app.css). */
export function fadeInView(node: HTMLElement) {
  getObserver().observe(node);

  return () => {
    observer?.unobserve(node);
  };
}

/** Observes every currently-matching element for static (non-recreated) sections like Hero/About. */
export function observeAll(selector: string) {
  const els = document.querySelectorAll<HTMLElement>(selector);
  const obs = getObserver();
  els.forEach((el) => obs.observe(el));
  return () => els.forEach((el) => obs.unobserve(el));
}
