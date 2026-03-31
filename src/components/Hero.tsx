import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

interface HeroProps {
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  slug?: string;
  category?: string;
  categories?: string[];
}

export default function Hero({ title, excerpt, imageUrl, slug, category, categories }: HeroProps) {
  const displayCategories = categories && categories.length > 0 ? categories : (category ? [category] : ['Exclusive Feature']);

  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>
      {imageUrl ? (
        <div className={styles.imageContainer}>
          <Image 
            src={imageUrl} 
            alt={title || "JABNOM Cover"}
            fill
            className={styles.backgroundImage}
            priority
          />
        </div>
      ) : null}
      
      <div className={styles.content}>
        <div className={styles.tagsContainer} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.2rem' }}>
          {displayCategories.map((c, i) => (
            <div key={i} className={styles.tag} style={{ marginBottom: 0 }}>{c}</div>
          ))}
        </div>

        {title ? (
           <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: title }} />
        ) : (
           <h1 className={styles.title}>
             <span>The</span> <span>Underground</span>
             <br />
             <span className={styles.accent}>Resurgence</span>
           </h1>
        )}

        {excerpt ? (
           <div className={styles.excerpt} dangerouslySetInnerHTML={{ __html: excerpt }} />
        ) : (
           <p className={styles.excerpt}>
             Discover the secret spots and exclusive events defining the new era of urban nightlife and modern elegance.
           </p>
        )}

        {slug ? (
           <Link href={`/${slug}`} className={styles.readMoreBtn}>
             อ่านเพิ่ม
           </Link>
        ) : (
           <a href="#" className={styles.readMoreBtn}>
             อ่านเพิ่ม
           </a>
        )}
      </div>
    </section>
  );
}
