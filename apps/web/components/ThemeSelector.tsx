"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@pinguin/ui";
import {
  FREE_THEMES,
  SUPPORTER_THEMES,
  type ThemeConfig,
} from "@pinguin/shared/themes";

interface ThemeSelectorProps {
  isSupporter?: boolean;
}

export default function ThemeSelector({
  isSupporter = false,
}: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { current, setTheme, theme } = useTheme({ isSupporter });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function choose(next: ThemeConfig) {
    if (next.tier === "supporter" && !isSupporter) {
      setOpen(false);
      router.push("/soutien");
      return;
    }
    if (setTheme(next.id)) setOpen(false);
  }

  const renderCard = (entry: ThemeConfig) => {
    const active = entry.id === current;
    const locked = entry.tier === "supporter" && !isSupporter;
    return (
      <button
        key={entry.id}
        type="button"
        className={`theme-card${active ? " theme-card--active" : ""}${
          locked ? " theme-card--locked" : ""
        }`}
        onClick={() => choose(entry)}
        aria-pressed={active}
        title={locked ? "supporters only" : `use ${entry.label}`}
      >
        <span className="theme-card__swatch" aria-hidden="true">
          <span style={{ background: entry.colors.background }} />
          <span style={{ background: entry.colors.surfaceAlt }} />
          <span style={{ background: entry.colors.accent }} />
          <span style={{ background: entry.colors.text }} />
        </span>
        <span className="theme-card__row">
          <span className="theme-card__label">{entry.label}</span>
          <span className="theme-card__tier">
            {entry.tier === "free" ? "free" : locked ? "supporter" : "unlocked"}
          </span>
        </span>
        <span className="theme-card__desc">{entry.description}</span>
      </button>
    );
  };

  return (
    <>
      <button
        type="button"
        className="btn btn--icon theme-trigger"
        onClick={() => setOpen(true)}
        aria-label={`change theme, current ${theme.label}`}
        aria-haspopup="dialog"
        title={`theme · ${theme.label}`}
      >
        <span className="theme-trigger__swatch" aria-hidden="true">
          <span style={{ background: theme.colors.background }} />
          <span style={{ background: theme.colors.accent }} />
          <span style={{ background: theme.colors.text }} />
        </span>
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="modal-panel theme-modal"
            role="dialog"
            aria-modal="true"
            aria-label="dashboard theme"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="theme-modal__head">
              <div>
                <h2 className="theme-modal__title">theme</h2>
                <p className="caption theme-modal__hint">
                  saved on this device · {FREE_THEMES.length} free palettes,{" "}
                  {SUPPORTER_THEMES.length} for supporters
                </p>
              </div>
              <button
                type="button"
                className="btn btn--icon"
                onClick={() => setOpen(false)}
                aria-label="close theme picker"
                autoFocus
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <section className="theme-group" aria-labelledby="theme-free">
              <div className="theme-group__head">
                <span className="label label--nav" id="theme-free">
                  free
                </span>
                <span className="caption theme-group__note">everyone</span>
              </div>
              <div className="theme-grid">{FREE_THEMES.map(renderCard)}</div>
            </section>

            <section className="theme-group" aria-labelledby="theme-supporter">
              <div className="theme-group__head">
                <span className="label label--nav" id="theme-supporter">
                  supporter
                </span>
                <span className="caption theme-group__note">
                  {isSupporter
                    ? "unlocked · thank you"
                    : "unlock with a donation"}
                </span>
              </div>
              <div className="theme-grid">
                {SUPPORTER_THEMES.map(renderCard)}
              </div>
            </section>

            <div className="theme-modal__foot">
              <span className="caption">
                {isSupporter
                  ? "supporter · every palette is unlocked"
                  : "supporter themes support hosting and development"}
              </span>
              <Link
                href="/soutien"
                className="link-arrow caption"
                onClick={() => setOpen(false)}
              >
                {isSupporter ? "support us" : "become a supporter"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
