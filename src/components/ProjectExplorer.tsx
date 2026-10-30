import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  CATEGORY_LABELS,
  PROJECT_CATEGORIES,
  STATUS_LABELS,
  type ProjectCategory,
} from "../data/site";
import { projectMark } from "../lib/utils";

export type ExplorerProject = {
  id: string;
  title: string;
  summary: string;
  outcome?: string;
  category: Exclude<ProjectCategory, "all">;
  status: keyof typeof STATUS_LABELS;
  year: string;
  stack: string[];
  tags: string[];
  image?: string;
  imageAlt?: string;
  accent: string;
  private: boolean;
  order: number;
};

type Props = {
  projects: ExplorerProject[];
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

export default function ProjectExplorer({ projects }: Props) {
  const [category, setCategory] = useState<(typeof PROJECT_CATEGORIES)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [projects],
  );

  const counts = useMemo(() => {
    return PROJECT_CATEGORIES.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] =
        item.id === "all"
          ? sortedProjects.length
          : sortedProjects.filter((project) => project.category === item.id).length;
      return acc;
    }, {});
  }, [sortedProjects]);

  const filtered = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    return sortedProjects.filter((project) => {
      const matchesCategory = category === "all" || project.category === category;
      const haystack = [
        project.title,
        project.summary,
        project.outcome ?? "",
        project.year,
        CATEGORY_LABELS[project.category],
        ...project.stack,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, deferredQuery, sortedProjects]);

  const reset = () => {
    setCategory("all");
    setQuery("");
  };

  return (
    <div>
      <div className="explorer-toolbar">
        <div className="explorer-search">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by project, stack, or problem…"
            aria-label="Search projects by name, stack, or description"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>/</kbd>
        </div>

        <div className="filter-row" role="group" aria-label="Filter projects by category">
          {PROJECT_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="filter-chip"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
              <span>{counts[item.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <p className="explorer-count" aria-live="polite">
          Showing {filtered.length} of {sortedProjects.length} projects
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="explorer-empty">
          <div>
            <strong>No matching projects</strong>
            <p>Try a broader search or reset the filters.</p>
            <button className="btn btn--secondary btn--small" type="button" onClick={reset} style={{ marginTop: "1rem" }}>
              Reset filters
            </button>
          </div>
        </div>
      ) : (
        <div className="project-grid project-grid--three">
          {filtered.map((project) => {
            const statusLabel = STATUS_LABELS[project.status];
            const isMobile = project.category === "mobile";
            return (
              <a
                key={project.id}
                href={`/projects/${project.id}/`}
                className="project-card"
                style={{ "--card-accent": project.accent } as CSSProperties}
              >
                <div className={`project-media${isMobile ? " project-media--mobile" : ""}`}>
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.imageAlt ?? `${project.title} project preview`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="project-fallback" style={{ "--card-accent": project.accent } as CSSProperties} aria-hidden="true">
                      <span className="project-fallback__mark">{projectMark(project.title)}</span>
                      <span className="project-fallback__label">
                        {CATEGORY_LABELS[project.category]} / {project.title}
                      </span>
                    </div>
                  )}
                  <div className="project-media__top">
                    <span className="project-badge">{CATEGORY_LABELS[project.category]}</span>
                  </div>
                </div>

                <div className="project-body">
                  <div className="project-kicker">
                    <span>{project.year}</span>
                    <span>{statusLabel}</span>
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-summary">{project.summary}</p>
                  {project.outcome && <p className="project-outcome">{project.outcome}</p>}
                  <div className="project-footer">
                    <div className="chip-row">
                      {project.stack.slice(0, 3).map((item) => (
                        <span className="chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                    <span className="project-arrow" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
