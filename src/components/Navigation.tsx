import Link from 'next/link';
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          JAB<span className={styles.accent}>NOM</span>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">หน้าแรก</Link></li>
          <li><Link href="/category/celeb">ดารา</Link></li>
          <li><Link href="/category/model">นางแบบ</Link></li>
          <li><Link href="/category/netidol">เน็ตไอดอล</Link></li>
          <li><Link href="/category/onlyfans">โอนลี่แฟนส์</Link></li>
        </ul>
      </div>
    </nav>
  );
}
