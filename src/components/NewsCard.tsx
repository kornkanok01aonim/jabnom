import Link from 'next/link';
import Image from 'next/image';
import styles from './NewsCard.module.css';

interface NewsCardProps {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  category?: string;
  categories?: string[];
  size?: 'small' | 'large';
}

export default function NewsCard({ title, excerpt, imageUrl, date, category, categories, slug, size = 'small' }: NewsCardProps) {
  const displayCategories = categories && categories.length > 0 ? categories : (category ? [category] : ['Uncategorized']);

  return (
    <Link href={`/${slug}`} className={`${styles.card} ${styles[size]}`}>
      {imageUrl ? (
        <div className={styles.imageWrapper}>
          <Image 
            src={imageUrl} 
            alt={title} 
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className={styles.overlay}></div>
          <div className={styles.tagsContainer} style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', zIndex: 10 }}>
            {displayCategories.map((c, i) => (
              <span key={i} className={styles.category} style={{ margin: 0 }}>{c}</span>
            ))}
          </div>
        </div>
      ) : null}
      <div className={styles.content}>
        <div className={styles.meta}>
          {!imageUrl && <span className={styles.textCategory}>{displayCategories.join(', ')} &nbsp;&bull;&nbsp; </span>}
          <span>{date}</span>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.excerpt} dangerouslySetInnerHTML={{ __html: excerpt }} />
        <span className={styles.readMore}>
          อ่านเพิ่ม <span className={styles.arrow}>&rarr;</span>
        </span>
      </div>
    </Link>
  );
}
