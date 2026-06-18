import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import type { House } from '../utils/constants';
import { getHouseImageAlt } from '../utils/helpers';

type HousePhotoProps = {
  house: House;
};

type PreviewPosition = {
  left: number;
  top: number;
};

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 280;
const PREVIEW_GAP = 12;

function getPreviewPosition(anchor: DOMRect): PreviewPosition {
  const canFitLeft = anchor.left >= PREVIEW_WIDTH + PREVIEW_GAP;
  const left = canFitLeft
    ? anchor.left - PREVIEW_WIDTH - PREVIEW_GAP
    : Math.min(anchor.right + PREVIEW_GAP, window.innerWidth - PREVIEW_WIDTH - PREVIEW_GAP);

  const centeredTop = anchor.top + anchor.height / 2 - PREVIEW_HEIGHT / 2;
  const top = Math.max(
    PREVIEW_GAP,
    Math.min(centeredTop, window.innerHeight - PREVIEW_HEIGHT - PREVIEW_GAP),
  );

  return {
    left: Math.max(PREVIEW_GAP, left),
    top: Math.max(PREVIEW_GAP, top),
  };
}

function HousePhotoPreview({
  anchorRef,
  house,
  open,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  house: House;
  open: boolean;
}) {
  const [position, setPosition] = useState<PreviewPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) {
      return;
    }

    setPosition(getPreviewPosition(anchor));
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) {
        return;
      }

      setPosition(getPreviewPosition(anchor));
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorRef, open]);

  if (!open || !position || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] w-[20rem] rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.24)]"
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <div className="overflow-hidden border rounded-2xl border-slate-100 bg-slate-50">
        <img alt="" className="object-cover w-full h-48" src={house.photoURL} />
      </div>
      <div className="mt-3 space-y-1 text-left">
        <p className="text-sm font-semibold text-slate-950">House #{house.id}</p>
        <p className="text-xs text-slate-500">{house.homeowner}</p>
      </div>
    </div>,
    document.body,
  );
}

export function HousePhoto({ house }: HousePhotoProps) {
  const [failed, setFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const hoverTargetRef = useRef<HTMLAnchorElement>(null);

  if (!house.photoURL || failed) {
    return (
      <div className="flex items-center justify-center w-32 h-20 px-3 text-xs font-medium text-center border border-dashed rounded-2xl border-slate-300 bg-slate-50 text-slate-500">
        <span>No image for house #{house.id}</span>
      </div>
    );
  }

  return (
    <div className="flex justify-end w-full">
      <a
        ref={hoverTargetRef}
        aria-label={`Open original photo for house ${house.id} in a new tab`}
        className="group block w-fit"
        href={house.photoURL}
        rel="noreferrer"
        target="_blank"
        title="Open original image"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsOpen(false);
          }
        }}
        onFocus={() => setIsOpen(true)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <img
          alt={getHouseImageAlt(house)}
          className="h-20 w-32 rounded-2xl border border-slate-200 bg-slate-100 object-cover shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.02] group-hover:shadow-md"
          loading="lazy"
          onError={() => setFailed(true)}
          src={house.photoURL}
        />
      </a>

      <HousePhotoPreview anchorRef={hoverTargetRef} house={house} open={isOpen} />
    </div>
  );
}
