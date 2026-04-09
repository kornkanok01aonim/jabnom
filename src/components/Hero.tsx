'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export interface HeroPost {
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  slug?: string;
  category?: string;
  categories?: string[];
}

interface HeroProps {
  posts: HeroPost[];
}

export default function Hero({ posts }: HeroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!posts || posts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % posts.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [posts]);

  if (!posts || posts.length === 0) return null;

  return (
    <section className={styles.hero}>
      {posts.map((post, idx) => {
        const isActive = idx === current;
        if (!isActive) return null; // Simple approach to avoid stacking issues unless CSS opacity is tuned perfectly

        const displayCategories = post.categories && post.categories.length > 0 ? post.categories : (post.category ? [post.category] : ['Exclusive Feature']);
        return (
          <div key={idx} className={`${styles.slide} ${isActive ? styles.active : ''}`}>
            <div className={styles.overlay}></div>
            {post.imageUrl ? (
              <div className={styles.imageContainer}>
                <Image 
                  src={post.imageUrl} 
                  alt={post.title || "JABNOM Cover"}
                  fill
                  className={styles.backgroundImage}
                  priority={idx === 0}
                />
              </div>
            ) : null}
            
            <div className={styles.content}>
              <div className={styles.tagsContainer} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.2rem' }}>
                {displayCategories.map((c, i) => (
                  <div key={i} className={styles.tag} style={{ marginBottom: 0 }}>{c}</div>
                ))}
              </div>

              {post.title ? (
                 <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: post.title }} />
              ) : (
                 <h1 className={styles.title}>
                   <span>The</span> <span>Underground</span>
                   <br />
                   <span className={styles.accent}>Resurgence</span>
                 </h1>
              )}

              {post.excerpt ? (
                 <div className={styles.excerpt} dangerouslySetInnerHTML={{ __html: post.excerpt }} />
              ) : (
                 <p className={styles.excerpt}>
                   Discover the secret spots and exclusive events defining the new era of urban nightlife and modern elegance.
                 </p>
              )}

              {post.slug ? (
                 <Link href={`/${post.slug}`} className={styles.readMoreBtn}>
                   อ่านเพิ่ม
                 </Link>
              ) : (
                 <a href="#" className={styles.readMoreBtn}>
                   อ่านเพิ่ม
                 </a>
              )}
            </div>
          </div>
        );
      })}
      
      {posts.length > 1 && (
        <div className={styles.indicators}>
          {posts.map((_, idx) => (
            <button key={idx} aria-label={`Go to slide ${idx + 1}`} className={`${styles.dot} ${idx === current ? styles.activeDot : ''}`} onClick={() => setCurrent(idx)} />
          ))}
        </div>
      )}
    </section>
  );
}
