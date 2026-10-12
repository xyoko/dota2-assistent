// @ts-nocheck
'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { SoundEngine } from '../../services/soundFx';
import './DomeGallery.css';

const DEFAULT_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art'
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture'
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork'
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art'
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern'
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface'
  },
  { src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large', alt: 'Social media image' }
];

const DEFAULTS = {
  maxVerticalRotationDeg: 40,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }));
  }
  if (pool.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
    );
  }

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, alt: '' };
    }
    return { src: image.src || '', alt: image.alt || '', hero: image.hero };
  });

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
    hero: usedImages[i].hero
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#120F17',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = 280,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '480px',
  openedImageHeight = '480px',
  imageBorderRadius = '20px',
  openedImageBorderRadius = '24px',
  grayscale = false,
  tileInset = '20px',
  onSelectHero,
  onOpenHeroDetails
}) {
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const dragRafRef = useRef(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;
      let basis;
      switch (fitBasis) {
        case 'min':
          basis = minDim;
          break;
        case 'max':
          basis = maxDim;
          break;
        case 'width':
          basis = w;
          break;
        case 'height':
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge');
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();

        const hasCustomSize = openedImageWidth && openedImageHeight;
        if (hasCustomSize) {
          const tempDiv = document.createElement('div');
          tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; visibility: hidden;`;
          document.body.appendChild(tempDiv);
          const tempRect = tempDiv.getBoundingClientRect();
          document.body.removeChild(tempDiv);

          const centeredLeft = frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
          const centeredTop = frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

          enlargedOverlay.style.left = `${centeredLeft}px`;
          enlargedOverlay.style.top = `${centeredTop}px`;
        } else {
          enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
          enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
          enlargedOverlay.style.width = `${frameR.width}px`;
          enlargedOverlay.style.height = `${frameR.height}px`;
        }
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx, vy) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        const evt = event;
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        const evt = event;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;
        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }
        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          if (!dragRafRef.current) {
            dragRafRef.current = requestAnimationFrame(() => {
              applyTransform(rotationRef.current.x, rotationRef.current.y);
              dragRafRef.current = null;
            });
          }
        }
        if (last) {
          draggingRef.current = false;
          if (dragRafRef.current) {
            cancelAnimationFrame(dragRafRef.current);
            dragRafRef.current = null;
          }
          applyTransform(rotationRef.current.x, rotationRef.current.y);
          let [vMagX, vMagY] = velocity;
          const [dirX, dirY] = direction;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;
          if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement;
            vx = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2);
            vy = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2);
          }
          if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
        }
      }
    },
    { target: mainRef, eventOptions: { passive: true } }
  );

  const close = useCallback(() => {
    if (performance.now() - openStartedAtRef.current < 150) return;
    const overlay = viewerRef.current?.querySelector('.enlarge');
    if (!overlay) return;

    rootRef.current?.removeAttribute('data-enlarging');
    const pos = originalTilePositionRef.current;

    if (!pos) {
      overlay.remove();
      openingRef.current = false;
      return;
    }

    // Animate smoothly back to tile origin using GPU transforms
    overlay.style.transition = `transform ${enlargeTransitionMs}ms ease-out, opacity ${enlargeTransitionMs}ms ease-out`;
    overlay.style.transform = `translate(${pos.deltaX}px, ${pos.deltaY}px) scale(${pos.scaleX}, ${pos.scaleY})`;
    overlay.style.opacity = '0';

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      overlay.remove();
      if (pos.parent) {
        pos.parent.removeAttribute('data-focused');
        pos.parent.style.setProperty('--rot-y-delta', '0deg');
        pos.parent.style.setProperty('--rot-x-delta', '0deg');
      }
      if (pos.el) {
        pos.el.style.visibility = '';
      }
      originalTilePositionRef.current = null;
      focusedElRef.current = null;
      openingRef.current = false;
    };

    overlay.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, enlargeTransitionMs + 50);
  }, [enlargeTransitionMs]);

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    scrim.addEventListener('click', close);
    const onKey = e => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      scrim.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const openItemFromElement = useCallback(
    (el, item) => {
      if (openingRef.current) return;
      openingRef.current = true;
      openStartedAtRef.current = performance.now();

      const hero = item?.hero;
      if (hero && onSelectHero) {
        SoundEngine.playPick();
        onSelectHero(hero);
      }

      const parent = el.parentElement;
      focusedElRef.current = el;

      // 1. Measure initial screen positions without layout thrashing
      const tileRect = el.getBoundingClientRect();
      const mainRect = mainRef.current?.getBoundingClientRect();
      if (!mainRect || tileRect.width <= 0 || tileRect.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        return;
      }

      // 2. Rotate parent item to face forward smoothly
      const offsetX = item ? item.x : getDataNumber(parent, 'offsetX', 0);
      const offsetY = item ? item.y : getDataNumber(parent, 'offsetY', 0);
      const sizeX = item ? item.sizeX : getDataNumber(parent, 'sizeX', 2);
      const sizeY = item ? item.sizeY : getDataNumber(parent, 'sizeY', 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);
      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;

      parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
      parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
      parent.setAttribute('data-focused', 'true');

      // 3. Compute target centered dimensions (responsive, max 500px)
      const targetSize = Math.min(500, Math.round(Math.min(mainRect.width, mainRect.height) * 0.8));
      const targetLeft = Math.round((mainRect.width - targetSize) / 2);
      const targetTop = Math.round((mainRect.height - targetSize) / 2);

      // Compute initial offset and scale relative to target center
      const startLeft = tileRect.left - mainRect.left;
      const startTop = tileRect.top - mainRect.top;
      const scaleX = tileRect.width / targetSize;
      const scaleY = tileRect.height / targetSize;
      const deltaX = startLeft - targetLeft;
      const deltaY = startTop - targetTop;

      originalTilePositionRef.current = {
        el,
        parent,
        deltaX,
        deltaY,
        scaleX,
        scaleY
      };

      // Hide clicked tile while enlarged overlay is shown
      el.style.visibility = 'hidden';

      // 4. Create single-layer GPU accelerated overlay
      const overlay = document.createElement('div');
      overlay.className = 'enlarge';
      overlay.style.cssText = `
        position: absolute;
        left: ${targetLeft}px;
        top: ${targetTop}px;
        width: ${targetSize}px;
        height: ${targetSize}px;
        z-index: 30;
        will-change: transform, opacity;
        transform-origin: 0 0;
        transform: translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY});
        opacity: 0.8;
        transition: transform ${enlargeTransitionMs}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${enlargeTransitionMs}ms ease;
      `;

      const rawSrc = item?.src || parent.dataset.src || el.querySelector('img')?.src || '';
      const img = document.createElement('img');
      img.src = rawSrc;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block;';
      overlay.appendChild(img);

      if (hero && hero.name) {
        const info = document.createElement('div');
        info.className = 'enlarge-hero-info';
        info.style.cssText = 'position:absolute;bottom:0;left:0;right:0;padding:16px 20px;background:linear-gradient(to top, rgba(10,13,20,0.95) 15%, rgba(10,13,20,0.65) 60%, transparent);display:flex;align-items:center;justify-content:space-between;pointer-events:auto;border-bottom-left-radius:inherit;border-bottom-right-radius:inherit;';
        
        const detailsBtnHtml = onOpenHeroDetails ? `
          <button class="hero-detail-quick-btn" style="background:#dc2626;color:#ffffff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;box-shadow:0 0 12px rgba(220,38,38,0.4);letter-spacing:0.02em;">
            Open Arsenal ↗
          </button>
        ` : `
          <div style="font-size:10px;font-weight:700;color:#f87171;background:rgba(220,38,38,0.2);border:1px solid rgba(220,38,38,0.4);padding:4px 10px;border-radius:8px;letter-spacing:0.05em;">
            ACTIVE AVATAR
          </div>
        `;

        info.innerHTML = `
          <div>
            <div style="font-family:'Cinzel',serif;font-weight:900;font-size:20px;color:#ffffff;letter-spacing:0.05em;text-shadow:0 2px 10px rgba(0,0,0,0.9);">${hero.name}</div>
            <div style="font-size:11px;color:#94a3b8;font-weight:600;letter-spacing:0.08em;margin-top:2px;">
              <span style="color:${hero.primaryAttr === 'str' ? '#ef4444' : hero.primaryAttr === 'agi' ? '#22c55e' : hero.primaryAttr === 'int' ? '#06b6d4' : '#e879f9'};text-transform:uppercase;font-weight:bold;">${hero.primaryAttr?.toUpperCase() || ''}</span>
              ${hero.attackType ? ` • ${hero.attackType.toUpperCase()}` : ''}
              ${hero.roles?.[0] ? ` • ${hero.roles[0].toUpperCase()}` : ''}
            </div>
          </div>
          ${detailsBtnHtml}
        `;

        if (onOpenHeroDetails) {
          const btn = info.querySelector('.hero-detail-quick-btn');
          if (btn) {
            btn.onclick = (ev) => {
              ev.stopPropagation();
              onOpenHeroDetails(hero);
            };
          }
        }
        overlay.appendChild(info);
      }

      viewerRef.current?.appendChild(overlay);

      // 5. Next animation frame: animate cleanly to center
      requestAnimationFrame(() => {
        overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
        overlay.style.opacity = '1';
        rootRef.current?.setAttribute('data-enlarging', 'true');
      });
    },
    [enlargeTransitionMs, onSelectHero, onOpenHeroDetails, segments]
  );

  const onTileClick = useCallback(
    (e, item) => {
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget, item);
    },
    [openItemFromElement]
  );

  const onTilePointerUp = useCallback(
    (e, item) => {
      if (e.pointerType !== 'touch') return;
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget, item);
    },
    [openItemFromElement]
  );

  useEffect(() => {
    return () => {
      stopInertia();
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, [stopInertia]);

  return (
    <div
      ref={rootRef}
      className="sphere-root"
      style={{
        ['--segments-x']: segments,
        ['--segments-y']: segments,
        ['--overlay-blur-color']: overlayBlurColor,
        ['--tile-radius']: imageBorderRadius,
        ['--enlarge-radius']: openedImageBorderRadius,
        ['--tile-inset']: tileInset,
        ['--image-filter']: grayscale ? 'grayscale(1)' : 'none'
      }}
    >
      <main ref={mainRef} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div
                key={`${it.x},${it.y},${i}`}
                className="item"
                data-src={it.src}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={{
                  ['--offset-x']: it.x,
                  ['--offset-y']: it.y,
                  ['--item-size-x']: it.sizeX,
                  ['--item-size-y']: it.sizeY
                }}
              >
                <div
                  className="item__image"
                  role="button"
                  tabIndex={0}
                  aria-label={it.hero?.name || it.alt || 'Open hero'}
                  onClick={(e) => onTileClick(e, it)}
                  onPointerUp={(e) => onTilePointerUp(e, it)}
                >
                  <img src={it.src} draggable={false} alt={it.alt} loading="lazy" decoding="async" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overlay" />
        <div className="edge-fade edge-fade--top" />
        <div className="edge-fade edge-fade--bottom" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  );
}
