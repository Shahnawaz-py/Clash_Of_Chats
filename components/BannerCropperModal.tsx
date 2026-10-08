"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sfx } from '@/lib/sfx';

interface BannerCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImageUrl: string) => void;
}

export const BannerCropperModal: React.FC<BannerCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSave,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset cropper state when imageSrc or isOpen changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        setImageLoaded(true);
      };
    }
  }, [isOpen, imageSrc]);

  // Generate 1584x396 cropped image canvas data URL
  const generateCroppedBanner = useCallback((): string | null => {
    if (!imgRef.current || !containerRef.current || !imageLoaded) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1584;
    canvas.height = 396;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const container = containerRef.current.getBoundingClientRect();
    const containerW = container.width;
    const containerH = container.height; // 4:1 aspect ratio container

    const imgEl = imgRef.current;
    const naturalW = imgEl.naturalWidth || 1584;
    const naturalH = imgEl.naturalHeight || 396;

    // Calculate base cover scale inside container
    const scaleCover = Math.max(containerW / naturalW, containerH / naturalH);
    const baseW = naturalW * scaleCover;
    const baseH = naturalH * scaleCover;

    // Effective scaled size inside container
    const currentW = baseW * zoom;
    const currentH = baseH * zoom;

    // Center offset + user drag offset in container coordinates
    const containerCenterX = containerW / 2;
    const containerCenterY = containerH / 2;
    const imgLeftInContainer = containerCenterX - currentW / 2 + position.x;
    const imgTopInContainer = containerCenterY - currentH / 2 + position.y;

    // Map container crop rect [0, 0, containerW, containerH] to image source coordinates
    const srcX = (0 - imgLeftInContainer) * (naturalW / currentW);
    const srcY = (0 - imgTopInContainer) * (naturalH / currentH);
    const srcW = containerW * (naturalW / currentW);
    const srcH = containerH * (naturalH / currentH);

    // Draw high quality 1584x396 canvas export
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, 1584, 396);

    return canvas.toDataURL('image/png', 0.95);
  }, [zoom, position, imageLoaded]);

  // Update live thumbnail preview on zoom/position change
  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        const cropped = generateCroppedBanner();
        if (cropped) setPreviewUrl(cropped);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [zoom, position, imageLoaded, generateCroppedBanner]);

  if (!isOpen) return null;

  // Pointer / Mouse drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.5));
  };

  const handleReset = () => {
    sfx.playClick();
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    sfx.playClanReward();
    const cropped = generateCroppedBanner() || imageSrc;
    onSave(cropped);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#FFFDF9] rounded-3xl border-4 border-[#C89437] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#3C2314] px-6 py-4 border-b-4 border-[#C89437] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#53301B] border-2 border-[#C89437] flex items-center justify-center text-[#FBD46E]">
              <span className="material-symbols-outlined text-xl font-black">crop</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-black uppercase text-[#FBD46E] tracking-wider">
                CROP & POSITION WAR BANNER
              </h2>
              <p className="font-label-sm text-[11px] text-[#E2C5A5] uppercase font-bold tracking-widest">
                Fixed 4:1 Ratio (1584 × 396 px) • Drag & Zoom to Position
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { sfx.playClick(); onClose(); }}
            className="w-8 h-8 rounded-lg bg-[#53301B] hover:bg-[#683C22] border border-[#7A4B2E] text-[#FBD46E] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg font-bold">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 bg-[#FAF3E8] max-h-[75vh] overflow-y-auto">
          
          {/* Main 4:1 Interactive Crop Frame */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs text-[#5B3317] uppercase font-black flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#895333]">drag_pan</span>
                <span>Interactive Crop Viewport (4:1 Aspect Ratio)</span>
              </span>
              <span className="font-label-sm text-[10px] text-[#8A6348] font-bold">
                Drag to Pan • Mouse Wheel or Slider to Zoom
              </span>
            </div>

            <div
              ref={containerRef}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full aspect-[4/1] bg-[#1A1009] rounded-2xl overflow-hidden border-2 border-[#C89437] shadow-inner cursor-grab active:cursor-grabbing select-none"
            >
              {/* Image element being transformed */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Banner Cropping"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  objectFit: 'cover',
                }}
                className="w-full h-full object-cover transition-transform duration-75 pointer-events-none"
              />

              {/* Grid Guidelines (Rule of thirds) */}
              <div className="absolute inset-0 pointer-events-none border border-[#FBD46E]/30 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-[#FBD46E]/20"></div>
                <div className="border-r border-b border-[#FBD46E]/20"></div>
                <div className="border-b border-[#FBD46E]/20"></div>
                <div className="border-r border-b border-[#FBD46E]/20"></div>
                <div className="border-r border-b border-[#FBD46E]/20"></div>
                <div className="border-b border-[#FBD46E]/20"></div>
                <div className="border-r border-[#FBD46E]/20"></div>
                <div className="border-r border-[#FBD46E]/20"></div>
                <div></div>
              </div>

              {/* Overlay Badge */}
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[#FBD46E] font-label-sm text-[10px] uppercase font-bold border border-[#C89437]/50 pointer-events-none">
                4:1 Banner Frame
              </div>
            </div>
          </div>

          {/* Controls: Zoom & Reset */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E7D6C3] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <span className="material-symbols-outlined text-[#895333] text-lg">zoom_out</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                className="w-7 h-7 rounded-lg bg-[#FAF5ED] border border-[#CDB194] text-[#5C381E] font-bold flex items-center justify-center hover:bg-[#FFF2D7] cursor-pointer"
              >
                -
              </button>
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#C89437] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.5, z + 0.1))}
                className="w-7 h-7 rounded-lg bg-[#FAF5ED] border border-[#CDB194] text-[#5C381E] font-bold flex items-center justify-center hover:bg-[#FFF2D7] cursor-pointer"
              >
                +
              </button>
              <span className="material-symbols-outlined text-[#895333] text-lg">zoom_in</span>
              <span className="font-label-sm text-xs font-bold text-[#3E2415] w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Reset Position Button */}
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-[#FAF5ED] border border-[#CDB194] text-[#5C381E] font-label-md text-xs font-bold uppercase hover:bg-[#FFF2D7] transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Reset Crop</span>
            </button>
          </div>

          {/* Live Preview Thumbnail Box */}
          {previewUrl && (
            <div className="flex flex-col gap-1.5">
              <span className="font-label-sm text-[11px] text-[#895333] uppercase font-black">
                Final Cropped Banner Preview (1584 × 396 Output)
              </span>
              <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-[#1A1009] border border-[#C89437] shadow-sm">
                <img src={previewUrl} alt="Cropped Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF5ED] border-t-2 border-[#895333] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => { sfx.playClick(); onClose(); }}
            className="px-4 py-2 rounded-xl bg-[#E8DAC9] border border-[#CBAF90] text-[#553013] font-headline-sm text-xs font-black uppercase hover:bg-[#DCC8B0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-headline-sm text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#5C4200] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            <span>Save Cropped Banner</span>
          </button>
        </div>

      </div>
    </div>
  );
};
