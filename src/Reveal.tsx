import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  /** Which way the element travels as it appears. */
  from?: "up" | "right" | "scale";
  /** Seconds to hold before easing in, for staggered rows. */
  delay?: number;
  as?: "div" | "figure";
  /** Consumed by React for lists; declared only because the project has no React type definitions. */
  key?: string | number;
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Eases its content in the first time it scrolls into view. The styles live in
 * index.css under `.reveal`; this only flips the `is-visible` class once, so it
 * replaces a whole animation library for the handful of fade-ins on the page.
 */
export default function Reveal({ from = "up", delay = 0, as: Tag = "div", id, className = "", children }: Props) {
  const ref = useRef<HTMLDivElement & HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}s` } : undefined;
  const classes = `reveal reveal-${from}${visible ? " is-visible" : ""} ${className}`.trim();

  return (
    <Tag ref={ref} id={id} className={classes} style={style}>
      {children}
    </Tag>
  );
}
