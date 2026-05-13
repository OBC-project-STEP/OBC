import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ArticleCard from "./ArticleCard";
import "./ArticlesCarousel.css";

const GAP_PX = 48;
const MQ_MOBILE = "(max-width: 767px)";

function useCarouselMetrics(viewportRef, articleCount) {
  const [metrics, setMetrics] = useState({
    visible: 3,
    step: 0,
    slideW: 0,
  });

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el || articleCount === 0) return undefined;

    const mq = window.matchMedia(MQ_MOBILE);

    const measure = () => {
      const requested = mq.matches ? 1 : 3;
      const visible = Math.max(1, Math.min(requested, articleCount));
      const vw = el.offsetWidth;
      const gaps = Math.max(0, visible - 1) * GAP_PX;
      const slideW = Math.max(0, (vw - gaps) / visible);
      const step = slideW + GAP_PX;
      setMetrics({ visible, step, slideW });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [articleCount, viewportRef]);

  return metrics;
}

export default function ArticlesCarousel({ articles }) {
  const n = articles.length;
  const viewportRef = useRef(null);
  const [startIndex, setStartIndex] = useState(0);
  const metrics = useCarouselMetrics(viewportRef, n);

  const maxStart = useMemo(
    () => Math.max(0, n - metrics.visible),
    [n, metrics.visible]
  );

  useEffect(() => {
    setStartIndex((i) => Math.min(i, maxStart));
  }, [maxStart]);

  const go = useCallback(
    (delta) => {
      setStartIndex((i) => Math.max(0, Math.min(maxStart, i + delta)));
    },
    [maxStart]
  );

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!n) return null;

  const offsetPx = metrics.step > 0 ? startIndex * metrics.step : 0;
  const dotCount = maxStart + 1;
  const prevDisabled = startIndex <= 0;
  const nextDisabled = startIndex >= maxStart;

  return (
    <div className="articles-carousel">
      <button
        type="button"
        className="articles-carousel-nav articles-carousel-nav--prev"
        onClick={() => go(-1)}
        disabled={prevDisabled}
        aria-label="Попередні статті"
      >
        ‹
      </button>

      <div ref={viewportRef} className="articles-carousel-viewport">
        <div
          className="articles-carousel-track"
          style={{
            gap: `${GAP_PX}px`,
            transform:
              metrics.step > 0
                ? `translateX(-${offsetPx}px)`
                : undefined,
          }}
        >
          {articles.map((article) => (
            <div
              key={article.id}
              className="articles-carousel-slide"
              style={
                metrics.slideW > 0
                  ? { width: `${metrics.slideW}px`, flexShrink: 0 }
                  : { flex: "1 1 0", minWidth: 0 }
              }
            >
              <ArticleCard data={article} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="articles-carousel-nav articles-carousel-nav--next"
        onClick={() => go(1)}
        disabled={nextDisabled}
        aria-label="Наступні статті"
      >
        ›
      </button>

      {dotCount > 1 ? (
        <div className="articles-carousel-dots" role="tablist" aria-label="Позиції каруселі">
          {Array.from({ length: dotCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === startIndex}
              aria-label={`Група ${i + 1} з ${dotCount}`}
              className={`articles-carousel-dot${i === startIndex ? " is-active" : ""}`}
              onClick={() => setStartIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
