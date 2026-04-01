'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './GalleryLightbox.module.css';

interface GalleryImage {
  src: string;
  alt: string;
}

export default function GalleryLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((e: MouseEvent, url: string, galleryEls: HTMLAnchorElement[]) => {
    e.preventDefault();
    const imgs = galleryEls.map(a => {
      // Try to get full size image from link href, fallback to img src
      const href = a.getAttribute('href');
      const img = a.querySelector('img');
      const isImageLink = href?.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i);
      return {
        src: isImageLink ? href! : img?.getAttribute('src') || '',
        alt: img?.getAttribute('alt') || ''
      };
    }).filter(img => img.src); // Filter out any empty sources

    const index = imgs.findIndex(img => img.src === url || img.src === (e.currentTarget as HTMLAnchorElement)?.getAttribute('href'));
    
    // If not found by href, try to find by click target's image src
    let finalIndex = index;
    if (finalIndex === -1) {
      const targetImgSrc = (e.currentTarget as HTMLAnchorElement).querySelector('img')?.getAttribute('src');
      finalIndex = imgs.findIndex(img => img.src === targetImgSrc);
    }
    
    setImages(imgs);
    setCurrentIndex(finalIndex !== -1 ? finalIndex : 0);
    setIsOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goToNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, goToNext, goToPrev]);

  // Attach Event Listeners to Gallery Images
  useEffect(() => {
    const galleries = document.querySelectorAll('.classic-editor-content .gallery');
    
    const clickHandlers: { el: HTMLAnchorElement, handler: (e: MouseEvent) => void }[] = [];

    galleries.forEach(gallery => {
      const links = Array.from(gallery.querySelectorAll('.gallery-icon a')) as HTMLAnchorElement[];
      
      links.forEach(link => {
        const handler = (e: MouseEvent) => {
          const href = link.getAttribute('href');
          const isImageHref = href?.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i);
          const imgSrc = link.querySelector('img')?.getAttribute('src');
          // Use link href if it's an image, otherwise use child img src
          const targetUrl = isImageHref ? href! : imgSrc;
          
          if (targetUrl) {
            openLightbox(e, targetUrl, links);
          }
        };
        link.addEventListener('click', handler);
        clickHandlers.push({ el: link, handler });
      });
    });

    return () => {
      clickHandlers.forEach(({el, handler}) => {
        el.removeEventListener('click', handler);
      });
    };
  }, [openLightbox]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className={styles.lightboxOverlay} onClick={closeLightbox}>
      <button className={styles.closeBtn} onClick={closeLightbox} aria-label="Close lightbox">
        ×
      </button>

      {images.length > 1 && (
        <button className={styles.navBtnPrev} onClick={goToPrev} aria-label="Previous image">
          ‹
        </button>
      )}

      <div className={styles.imageContainer} onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt || 'Gallery image'}
          className={styles.lightboxImage}
        />
        <div className={styles.counter}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <button className={styles.navBtnNext} onClick={goToNext} aria-label="Next image">
          ›
        </button>
      )}
    </div>
  );
}
