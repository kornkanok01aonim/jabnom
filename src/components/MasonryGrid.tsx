import styles from './MasonryGrid.module.css';
import NewsCard from './NewsCard';

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  category?: string;
  categories?: string[];
}

export default function MasonryGrid({ posts, hideHeader = false }: { posts: Post[], hideHeader?: boolean }) {
  return (
    <section className={styles.section} id="news-grid">
      {!hideHeader && (
        <div className={styles.header}>
          <h2 className={styles.heading}>Latest<span className={styles.accent}> Drop</span></h2>
          <p className={styles.subheading}>The pulse of the city, curated for you.</p>
        </div>
      )}
      <div className={styles.masonry}>
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className={styles.masonryItem}
            style={{ animationDelay: `${(index % 6) * 0.15 + 0.2}s` }}
          >
            <NewsCard 
              {...post} 
              size={index % 5 === 0 ? 'large' : 'small'} 
            />
          </div>
        ))}
      </div>
    </section>
  );
}
