import { useEffect, useRef, useState } from "react";

const sections = [
  {
    id: "intro",
    title: "Scroll down",
    text: "This block is intentionally simple. As each section enters the viewport, the observer updates local React state.",
  },
  {
    id: "threshold",
    title: "Observe visibility",
    text: "The component watches multiple targets and marks them as visible when at least half of the section intersects the viewport.",
  },
  {
    id: "state",
    title: "React state update",
    text: "The Intersection Observer callback adds the section id to a list, which the UI uses to highlight observed cards.",
  },
  {
    id: "done",
    title: "Minimal POC",
    text: "This is a starter example intended to stay small and easy to extend later with lazy loading, analytics, or scroll-driven effects.",
  },
];

export default function App() {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const sectionElementsRef = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((currentIds) => {
          const nextIds = new Set(currentIds);

          for (const entry of entries) {
            const sectionId = entry.target.getAttribute("data-section-id");

            if (!sectionId) {
              continue;
            }

            if (entry.isIntersecting) {
              nextIds.add(sectionId);
            } else {
              nextIds.delete(sectionId);
            }
          }

          return sections
            .map((section) => section.id)
            .filter((sectionId) => nextIds.has(sectionId));
        });
      },
      {
        threshold: 0.5,
      },
    );

    for (const section of sections) {
      const element = sectionElementsRef.current[section.id];

      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Browser-native API</p>
        <h1>Intersection Observer POC</h1>
        <p>
          A minimal React example showing how to react when sections cross the viewport.
        </p>
      </section>

      <aside className="status-panel" aria-label="Visible sections">
        <h2>Visible sections</h2>
        <ul>
          {sections.map((section) => {
            const isVisible = visibleIds.includes(section.id);

            return (
              <li className={isVisible ? "status-item status-item-active" : "status-item"} key={section.id}>
                <span>{section.title}</span>
                <strong>{isVisible ? "Visible" : "Waiting"}</strong>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="content">
        {sections.map((section) => {
          const isVisible = visibleIds.includes(section.id);

          return (
            <article
              className={isVisible ? "observer-card observer-card-active" : "observer-card"}
              data-section-id={section.id}
              key={section.id}
              ref={(element) => {
                sectionElementsRef.current[section.id] = element;
              }}
            >
              <p className="card-step">{section.id}</p>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
