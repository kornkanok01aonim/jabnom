import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          JAB<span className={styles.accent}>NOM</span>
        </Link>
        <p className={styles.copyright}>
          &copy; 2026 JABNOM. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
