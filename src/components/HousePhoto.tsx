import { createPortal } from 'react-dom';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

import type { House } from '../utils/constants';
import { getHouseImageAlt } from '../utils/helpers';

type HousePhotoProps = {
  house: House;
};

type PreviewPlacement = {
  top: number;
  left: number;
  placement: 'top' | 'bottom';
  align: 'left' | 'center' | 'right';
};

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 280;
const PREVIEW_GAP = 12;

function getPreviewPlacement(anchor: DOMRect): PreviewPlacement {
  const canFitBelow = window.innerHeight - anchor.bottom >= PREVIEW_HEIGHT + PREVIEW_GAP;
  const canFitAbove = anchor.top >= PREVIEW_HEIGHT + PREVIEW_GAP;

  const placement: PreviewPlacement['placement'] =
    canFitBelow || !canFitAbove ? 'bottom' : 'top';

  let top =
    placement === 'bottom'
      ? anchor.bottom + PREVIEW_GAP
      : anchor.top - PREVIEW_HEIGHT - PREVIEW_GAP;

  top = Math.max(PREVIEW_GAP, Math.min(top, window.innerHeight - PREVIEW_HEIGHT - PREVIEW_GAP));

  const centeredLeft = anchor.left + anchor.width / 2 - PREVIEW_WIDTH / 2;
  const leftSpace = anchor.left;
  const rightSpace = window.innerWidth - anchor.right;

  let align: PreviewPlacement['align'] = 'center';
  let left = centeredLeft;

  if (rightSpace < PREVIEW_WIDTH + PREVIEW_GAP && leftSpace >= PREVIEW_WIDTH + PREVIEW_GAP) {
    align = 'left';
    left = anchor.left - PREVIEW_WIDTH - PREVIEW_GAP;
  } else if (leftSpace < PREVIEW_WIDTH + PREVIEW_GAP && rightSpace >= PREVIEW_WIDTH + PREVIEW_GAP) {
    align = 'right';
    left = anchor.right + PREVIEW_GAP;
  }

  left = Math.max(PREVIEW_GAP, Math.min(left, window.innerWidth - PREVIEW_WIDTH - PREVIEW_GAP));

  return { top, left, placement, align };
}

function HousePhotoPreview({
  anchorRef,
  house,
  open,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
  house: House;
  open: boolean;
}) {
  const [placement, setPlacement] = useState<PreviewPlacement | null>(null);

  const updatePlacement = useCallback(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) {
      return;
    }

    setPlacement(getPreviewPlacement(anchor));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updatePlacement();
  }, [open, updatePlacement]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleUpdate = () => updatePlacement();

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [open, updatePlacement]);

  if (!open || !placement || typeof document === 'undefined') {
    return null;
  }

  const arrowClass =
    placement.placement === 'bottom'
      ? '-top-2 border-b-0 border-r-0'
      : '-bottom-2 border-t-0 border-l-0';

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] w-[20rem] rounded-3xl border border-slate-200 bg-white p-3 opacity-100 shadow-[0_24px_60px_rgba(15,23,42,0.24)]"
      style={{
        left: placement.left,
        top: placement.top,
      }}
    >
      <div
        className={`absolute left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border border-slate-200 bg-white ${arrowClass}`}
        style={{
          top: placement.placement === 'bottom' ? -8 : undefined,
          bottom: placement.placement === 'top' ? -8 : undefined,
        }}
      />
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
        <img alt="" className="h-48 w-full object-cover" src={house.photoURL} />
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (!house.photoURL || failed) {
    return (
      <div className="flex h-20 w-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 text-center text-xs font-medium text-slate-500">
        <span>No image for house #{house.id}</span>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="group relative inline-flex"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
      onFocus={() => setIsOpen(true)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <a
        aria-label={`Open original photo for house ${house.id} in a new tab`}
        className="block"
        href={house.photoURL}
        rel="noreferrer"
        target="_blank"
        title="Open original image"
      >
        <img
          alt={getHouseImageAlt(house)}
          className="h-20 w-32 rounded-2xl border border-slate-200 bg-slate-100 object-cover shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.02] group-hover:shadow-md"
          loading="lazy"
          onError={() => setFailed(true)}
          src={house.photoURL}
        />
      </a>

      <HousePhotoPreview anchorRef={wrapperRef} house={house} open={isOpen} />
    </div>
  );
}
