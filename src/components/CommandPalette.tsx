import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export type PaletteProject = {
  title: string;
  summary: string;
  category: string;
  href: string;
};

type Props = {
  projects: PaletteProject[];
};

type PaletteItem = {
  title: string;
  description: string;
  href: string;
  group: string;
  kind: "page" | "project" | "external";
  external?: boolean;
};

const PAGES: PaletteItem[] = [
  { title: "Home", description: "Introduction and selected work", href: "/", group: "Pages", kind: "page" },
  { title: "Work", description: "Every documented project", href: "/projects/", group: "Pages", kind: "page" },
  { title: "Services", description: "Offers, process, and engagement models", href: "/services/", group: "Pages", kind: "page" },
  { title: "About", description: "Background, approach, and principles", href: "/about/", group: "Pages", kind: "page" },
  { title: "Experience", description: "Roles, responsibilities, and timeline", href: "/experience/", group: "Pages", kind: "page" },
  { title: "Résumé", description: "Web résumé and request options", href: "/resume/", group: "Pages", kind: "page" },
  { title: "Contact", description: "Start a conversation", href: "/contact/", group: "Pages", kind: "page" },
  {
    title: "GitHub",
    description: "Open-source work and repositories",
    href: "https://github.com/DarpanAdhikari",
    group: "Elsewhere",
    kind: "external",
    external: true,
  },
  {
    title: "LinkedIn",
    description: "Professional profile",
    href: "https://www.linkedin.com/in/darpan-adhikari-81b866280/",
    group: "Elsewhere",
    kind: "external",
    external: true,
  },
  {
    title: "Send an email",
    description: "darpand263@gmail.com",
    href: "mailto:darpand263@gmail.com",
    group: "Elsewhere",
    kind: "external",
  },
];

function Svg({ kind }: { kind: PaletteItem["kind"] }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {kind === "project" && <path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 6l-4 12" />}
      {kind === "page" && <path d="M6 3h8l4 4v14H6V3ZM14 3v5h5M9 13h6M9 17h6" />}
      {kind === "external" && <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export default function CommandPalette({ projects }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const projectItems = useMemo<PaletteItem[]>(
    () =>
      projects.map((project) => ({
        title: project.title,
        description: `${project.category} · ${project.summary}`,
        href: project.href,
        group: "Projects",
        kind: "project",
      })),
    [projects],
  );

  const results = useMemo(() => {
    const all = [...PAGES, ...projectItems];
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      const pageItems = PAGES.filter((item) => item.group === "Pages");
      return [...pageItems, ...projectItems.slice(0, 6)];
    }

    return all
      .filter((item) =>
        `${item.title} ${item.description} ${item.group}`.toLowerCase().includes(normalized),
      )
      .slice(0, 12);
  }, [projectItems, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpen);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    setQuery("");
    setSelected(0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const selectedElement = dialogRef.current?.querySelector<HTMLElement>(`[data-palette-index="${selected}"]`);
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selected, open]);

  const close = () => setOpen(false);

  const go = (item: PaletteItem) => {
    setOpen(false);
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(item.href);
    }
  };

  const onDialogKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((value) => (value + 1) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((value) => (value - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "Enter" && results[selected]) {
      event.preventDefault();
      go(results[selected]);
      return;
    }

    if (event.key === "Tab" && dialogRef.current) {
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>('input, button, a[href]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="cp-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="cp-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        onKeyDown={onDialogKeyDown}
      >
        <div className="cp-search">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, pages, or links…"
            aria-label="Search projects, pages, or links"
            autoComplete="off"
            spellCheck={false}
          />
          <button className="cp-close" type="button" onClick={close} aria-label="Close search">
            ESC
          </button>
        </div>

        <div className="cp-body">
          {results.length === 0 ? (
            <p className="cp-empty">No results for “{query}”. Try a technology, project, or page name.</p>
          ) : (
            results.map((item, index) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <div key={`${item.group}-${item.href}-${index}`}>
                  {showGroup && <p className="cp-group-label">{item.group}</p>}
                  <button
                    type="button"
                    className="cp-item"
                    data-palette-index={index}
                    aria-selected={index === selected}
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => go(item)}
                  >
                    <span className="cp-item__icon">
                      <Svg kind={item.kind} />
                    </span>
                    <span className="cp-item__copy">
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="cp-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>↵</kbd> to open · <kbd>esc</kbd> to close
          </span>
          <span>Quick search</span>
        </div>
      </div>
    </div>
  );
}
