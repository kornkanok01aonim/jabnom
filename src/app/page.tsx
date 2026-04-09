import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import MasonryGrid, { Post } from '../components/MasonryGrid';
import Footer from '../components/Footer';
import Link from 'next/link';

// Fetch from WordPress REST API for posts, and GraphQL for tags/archives
async function fetchHomepageData(page: number): Promise<{ posts: Post[], tags: any[], archives: any[], totalPages: number }> {
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  let posts: Post[] = [];
  let tags: any[] = [];
  let archives: any[] = [];
  let totalPages = 1;
  
  const postsPerPage = 9;

  if (wpApiUrl) {
    try {
      // 1. Fetch Posts via REST API for Pagination
      const offset = (page - 1) * postsPerPage;
      
      const postsRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/posts?_embed&per_page=${postsPerPage}&offset=${offset}`, { cache: 'no-store' });
      
      if (postsRes.ok) {
        const totalPagesHeader = postsRes.headers.get('x-wp-totalpages');
        if (totalPagesHeader) {
          totalPages = parseInt(totalPagesHeader, 10);
        } else {
          // fallback
          const totalHeader = postsRes.headers.get('x-wp-total');
          const totalPosts = totalHeader ? parseInt(totalHeader, 10) : 0;
          if (totalPosts > 0) {
            totalPages = Math.ceil(totalPosts / postsPerPage);
          }
        }
        
        const postsData = await postsRes.json();
        posts = postsData.map((wp: any) => {
          let imageUrl = '';
          if (wp._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            imageUrl = encodeURI(wp._embedded['wp:featuredmedia'][0].source_url);
          } else if (wp.jetpack_featured_media_url) {
            imageUrl = encodeURI(wp.jetpack_featured_media_url);
          } else if (wp.yoast_head_json?.og_image?.[0]?.url) {
            imageUrl = encodeURI(wp.yoast_head_json.og_image[0].url);
          }
          
          const termGroup = wp._embedded?.['wp:term'] || [];
          const catTerms = termGroup[0] || [];
          const allCats = catTerms.map((t: any) => t.name);

          return {
            id: wp.id,
            slug: wp.slug,
            title: wp.title?.rendered || wp.title || '',
            excerpt: wp.excerpt?.rendered || wp.excerpt || '',
            category: allCats[0] || 'Uncategorized',
            categories: allCats.length > 0 ? allCats : ['Uncategorized'],
            date: new Date(wp.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }),
            imageUrl,
          };
        });
      }

      // 2. Fetch Tags and Archives via GraphQL
      const gqlRes = await fetch(`${wpApiUrl}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetTagsAndArchives {
              tags(first: 30) {
                nodes { name slug }
              }
              archiveDates: posts(first: 100) {
                nodes { date }
              }
            }
          `
        }),
        cache: 'no-store'
      });
      
      if (gqlRes.ok) {
        const json = await gqlRes.json();
        
        tags = json.data?.tags?.nodes || [];
        const rawDates = json.data?.archiveDates?.nodes || [];
        const archiveMap = new Map();
        rawDates.forEach((n: any) => {
          const d = new Date(n.date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const slug = `${year}/${month}`;
          const name = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          if (!archiveMap.has(slug)) {
            archiveMap.set(slug, name);
          }
        });
        
        archives = Array.from(archiveMap.entries()).map(([slug, name]) => ({ slug, name }));
      }
      
      return { posts, tags, archives, totalPages };
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  return { posts: [], tags: [], archives: [], totalPages: 1 };
}

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const { posts, tags, archives, totalPages } = await fetchHomepageData(currentPage);

  const isFirstPage = currentPage === 1;
  const heroPosts = isFirstPage ? posts.slice(0, 3) : [];
  const gridPosts = posts;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      {isFirstPage && heroPosts.length > 0 && (
        <Hero posts={heroPosts} />
      )}
      <section className="container" style={{ padding: '4rem 2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 70%' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--accent-color)' }}>Latest Post</h2>
          <MasonryGrid posts={gridPosts} hideHeader={true} />
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
              {currentPage > 1 ? (
                <Link href={`/?page=${currentPage - 1}`} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-secondary)', color: 'var(--text-color)', textDecoration: 'none', borderRadius: '8px', border: '1px solid var(--accent-color)', transition: 'all 0.3s' }}>
                  หน้าก่อนหน้า
                </Link>
              ) : (
                <div style={{ padding: '0.75rem 1.5rem', visibility: 'hidden' }}>หน้าก่อนหน้า</div>
              )}
              
              <span style={{ color: 'var(--text-muted)' }}>
                หน้า {currentPage} / {totalPages}
              </span>
              
              {currentPage < totalPages ? (
                <Link href={`/?page=${currentPage + 1}`} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-secondary)', color: 'var(--text-color)', textDecoration: 'none', borderRadius: '8px', border: '1px solid var(--accent-color)', transition: 'all 0.3s' }}>
                  หน้าถัดไป
                </Link>
              ) : (
                <div style={{ padding: '0.75rem 1.5rem', visibility: 'hidden' }}>หน้าถัดไป</div>
              )}
            </div>
          )}
        </div>
        
        <aside style={{ flex: '1 1 25%', minWidth: '300px' }}>
          {archives.length > 0 && (
            <div className="sidebar-widget" style={{ marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-light)' }}>Archives</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {archives.map(arch => (
                  <li key={arch.slug} style={{ marginBottom: '0.75rem' }}>
                    <Link href={`/archive/${arch.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} className="archive-link">
                      {arch.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="sidebar-widget" style={{ marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-light)' }}>Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {tags.map((tag: any) => (
                  <Link key={tag.slug} href={`/tag/${tag.slug}`} style={{ background: 'var(--bg-dark)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-light)', textDecoration: 'none', border: '1px solid var(--accent-color)', transition: 'all 0.3s ease' }} className="tag-link">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      <Footer />
    </main>
  );
}
