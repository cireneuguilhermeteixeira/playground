import { useEffect, useRef, useState } from "react";

type ObserverSection = {
  id: string;
  title: string;
  text: string;
};

type FeedItem = {
  id: number;
  label: string;
};

const observerSections: ObserverSection[] = [
  {
    id: "intersection-intro",
    title: "Intersection Observer",
    text: "Scroll through the page and watch the visibility panel update when sections cross the viewport threshold.",
  },
  {
    id: "intersection-threshold",
    title: "Viewport threshold tracking",
    text: "This section becomes active when roughly half of it is inside the viewport, which is controlled by the observer threshold.",
  },
  {
    id: "mutation-intro",
    title: "Mutation Observer",
    text: "The DOM feed below is observed for child list changes. Adding or removing cards creates mutation records in real time.",
  },
  {
    id: "combined-patterns",
    title: "Combine both APIs",
    text: "Intersection Observer answers where content is visible, while Mutation Observer answers when the DOM structure changes.",
  },
];

const initialFeedItems: FeedItem[] = [
  { id: 1, label: "Initial node" },
  { id: 2, label: "Observed list item" },
];

export default function App() {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const [mutationLog, setMutationLog] = useState<string[]>([
    "MutationObserver ready: waiting for DOM changes.",
  ]);
  const sectionElementsRef = useRef<Record<string, HTMLElement | null>>({});
  const feedRef = useRef<HTMLDivElement | null>(null);
  const nextFeedIdRef = useRef(initialFeedItems.length + 1);

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

          return observerSections
            .map((section) => section.id)
            .filter((sectionId) => nextIds.has(sectionId));
        });
      },
      {
        threshold: 0.5,
      },
    );

    for (const section of observerSections) {
      const element = sectionElementsRef.current[section.id];

      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const feedElement = feedRef.current;

    if (!feedElement) {
      return;
    }

    const observer = new MutationObserver((mutationRecords) => {
      const nextLogs = mutationRecords.flatMap((record) => {
        if (record.type !== "childList") {
          return [];
        }

        const addedNodes = Array.from(record.addedNodes).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        const removedNodes = Array.from(record.removedNodes).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );

        const logs: string[] = [];

        if (addedNodes.length > 0) {
          logs.push(`Added ${addedNodes.length} node(s) to the observed feed.`);
        }

        if (removedNodes.length > 0) {
          logs.push(`Removed ${removedNodes.length} node(s) from the observed feed.`);
        }

        return logs;
      });

      if (nextLogs.length === 0) {
        return;
      }

      setMutationLog((currentLogs) => [...nextLogs, ...currentLogs].slice(0, 8));
    });

    observer.observe(feedElement, {
      childList: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleAddFeedItem() {
    const nextId = nextFeedIdRef.current;

    nextFeedIdRef.current += 1;

    setFeedItems((currentItems) => [
      ...currentItems,
      { id: nextId, label: `Dynamic node ${nextId}` },
    ]);
  }

  function handleRemoveFeedItem() {
    setFeedItems((currentItems) => currentItems.slice(0, -1));
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Browser-native APIs</p>
        <h1>Intersection and Mutation Observer POC</h1>
        <p>
          A small React example showing both visibility tracking with
          <code>IntersectionObserver</code> and DOM change tracking with
          <code>MutationObserver</code>.
        </p>
      </section>

      <section className="dashboard" aria-label="Observer status panels">
        <aside className="status-panel" aria-label="Visible sections">
          <h2>Visible sections</h2>
          <ul>
            {observerSections.map((section) => {
              const isVisible = visibleIds.includes(section.id);

              return (
                <li
                  className={isVisible ? "status-item status-item-active" : "status-item"}
                  key={section.id}
                >
                  <span>{section.title}</span>
                  <strong>{isVisible ? "Visible" : "Waiting"}</strong>
                </li>
              );
            })}
          </ul>
        </aside>

        <aside className="status-panel" aria-label="Mutation records">
          <h2>Mutation records</h2>
          <ul>
            {mutationLog.map((entry, index) => (
              <li className="status-item status-item-muted" key={`${entry}-${index}`}>
                <span>{entry}</span>
                <strong>Log</strong>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="content">
        {observerSections.map((section) => {
          const isVisible = visibleIds.includes(section.id);
          const isMutationSection = section.id === "mutation-intro";

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

              {isMutationSection && (
                <div className="mutation-demo">
                  <div className="mutation-actions">
                    <button onClick={handleAddFeedItem} type="button">
                      Add node
                    </button>
                    <button
                      disabled={feedItems.length === 0}
                      onClick={handleRemoveFeedItem}
                      type="button"
                    >
                      Remove node
                    </button>
                  </div>

                  <div className="mutation-feed" ref={feedRef}>
                    {feedItems.map((item) => (
                      <div className="mutation-node" key={item.id}>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
