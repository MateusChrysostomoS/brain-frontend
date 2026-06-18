"use client";

// PatientImages — "Imagens enviadas pelo paciente" section on the summary page.
//
// Data flow (no secret ever touches the client):
//   1. GET /summaries/{id}/media          -> the image ids for this consultation
//   2. GET /media/{mediaId}/url (per id)  -> a short-lived (~15min) signed R2 URL
// The signed URL is used transiently as an <img src>. When it expires the
// browser fires onError; we re-fetch a fresh URL and swap it in (capped, so a
// genuinely broken object degrades to a placeholder instead of looping).
//
// The section renders nothing while loading, on error, or when the list is
// empty (legacy consultations have summary.session_id = NULL -> no photos).

import { useCallback, useEffect, useRef, useState } from "react";
import { getMediaUrl, getSummaryMedia } from "@/lib/api";
import type { SummaryMediaItem } from "@/lib/types";
import { XIcon } from "./icons";

const MAX_URL_RETRIES = 2;

// Fetches (and, on demand, refreshes) the signed URL for a single image.
function useSignedUrl(mediaId: number) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const retries = useRef(0);

  const fetchUrl = useCallback(async () => {
    try {
      const res = await getMediaUrl(mediaId);
      setUrl(res.url);
      setFailed(false);
      return true;
    } catch {
      setFailed(true);
      return false;
    }
  }, [mediaId]);

  useEffect(() => {
    let cancelled = false;
    retries.current = 0;
    (async () => {
      try {
        const res = await getMediaUrl(mediaId);
        if (!cancelled) {
          setUrl(res.url);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  // Called from <img onError>: the URL most likely expired. Drop it (so the img
  // unmounts and onError can't re-fire mid-flight) and pull a fresh one.
  const refresh = useCallback(() => {
    if (retries.current >= MAX_URL_RETRIES) {
      setFailed(true);
      return;
    }
    retries.current += 1;
    setUrl(null);
    void fetchUrl();
  }, [fetchUrl]);

  // Called from <img onLoad>: the image actually rendered, so the budget is
  // spent on CONSECUTIVE failures only. Note: a *successful* getMediaUrl is NOT
  // proof the image loads (a broken/missing R2 object still returns a valid
  // signed URL), so the reset must hinge on onLoad — otherwise a broken object
  // would loop forever. With this, a URL that merely re-expires keeps
  // refreshing indefinitely, while a genuinely broken object still caps out.
  const markLoaded = useCallback(() => {
    retries.current = 0;
    setFailed(false);
  }, []);

  return { url, failed, refresh, markLoaded };
}

function MediaThumb({
  item,
  index,
  onOpen,
}: {
  item: SummaryMediaItem;
  index: number;
  onOpen: (index: number) => void;
}) {
  const { url, failed, refresh, markLoaded } = useSignedUrl(item.media_id);

  return (
    <button
      type="button"
      className="patient-image-thumb"
      onClick={() => onOpen(index)}
      aria-label={`Abrir imagem ${index + 1}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Imagem de exame ${index + 1}`}
          loading="lazy"
          onLoad={markLoaded}
          onError={refresh}
        />
      ) : (
        <span className="patient-image-ph">{failed ? "Indisponível" : "…"}</span>
      )}
    </button>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNav,
}: {
  items: SummaryMediaItem[];
  index: number;
  onClose: () => void;
  onNav: (delta: number) => void;
}) {
  const { url, failed, refresh, markLoaded } = useSignedUrl(items[index].media_id);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNav(-1);
      else if (e.key === "ArrowRight") onNav(1);
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onNav]);

  const multiple = items.length > 1;

  return (
    <div
      className="patient-image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de imagem"
      onClick={onClose}
    >
      <button
        type="button"
        className="patient-image-close"
        onClick={onClose}
        aria-label="Fechar"
      >
        <XIcon size={20} />
      </button>

      {multiple && (
        <button
          type="button"
          className="patient-image-nav prev"
          onClick={(e) => {
            e.stopPropagation();
            onNav(-1);
          }}
          aria-label="Imagem anterior"
        >
          ‹
        </button>
      )}

      <div className="patient-image-stage" onClick={(e) => e.stopPropagation()}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Imagem de exame ampliada"
            onLoad={markLoaded}
            onError={refresh}
          />
        ) : (
          <div className="patient-image-ph lg">
            {failed ? "Imagem indisponível" : "Carregando…"}
          </div>
        )}
      </div>

      {multiple && (
        <button
          type="button"
          className="patient-image-nav next"
          onClick={(e) => {
            e.stopPropagation();
            onNav(1);
          }}
          aria-label="Próxima imagem"
        >
          ›
        </button>
      )}

      {multiple && (
        <div className="patient-image-counter">
          {index + 1} / {items.length}
        </div>
      )}
    </div>
  );
}

export default function PatientImages({ summaryId }: { summaryId: number }) {
  const [items, setItems] = useState<SummaryMediaItem[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setOpen(null);
    (async () => {
      try {
        const res = await getSummaryMedia(summaryId);
        if (!cancelled) setItems(res.items ?? []);
      } catch {
        // Photos are supplementary — never let a media failure break the page.
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [summaryId]);

  const nav = useCallback(
    (delta: number) => {
      setOpen((cur) => {
        if (cur === null || !items || items.length === 0) return cur;
        const n = items.length;
        return (cur + delta + n) % n;
      });
    },
    [items],
  );

  // Loading, error, or no photos -> render nothing (no empty section).
  if (!items || items.length === 0) return null;

  const count = items.length;

  return (
    <section className="sec patient-images-sec">
      <div className="sec-head">
        <span className="sec-title">Imagens enviadas pelo paciente</span>
        <span className="sec-num">
          {count} {count === 1 ? "imagem" : "imagens"}
        </span>
      </div>
      <div className="patient-images">
        {items.map((item, i) => (
          <MediaThumb key={item.media_id} item={item} index={i} onOpen={setOpen} />
        ))}
      </div>

      {open !== null && (
        <Lightbox
          items={items}
          index={open}
          onClose={() => setOpen(null)}
          onNav={nav}
        />
      )}
    </section>
  );
}
