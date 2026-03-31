import Navigation from '../../../../components/Navigation';
import Footer from '../../../../components/Footer';
import MasonryGrid from '../../../../components/MasonryGrid';
import { notFound } from 'next/navigation';

async function fetchArchivePosts(year: string, month: string) {
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpApiUrl) return null;

  try {
    const after = `${year}-${month}-01T00:00:00`;
    // Approximate end of month
    const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const before = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00`;

    const postsRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/posts?after=${after}&before=${before}&_embed&per_page=20`, { cache: 'no-store' });
    const postsData = await postsRes.json();
    
    if (!Array.isArray(postsData)) return null;

    const formattedPosts = postsData.map((wp: any) => {
      let imageUrl = '';
      if (wp._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
        imageUrl = encodeURI(wp._embedded['wp:featuredmedia'][0].source_url);
      }
      
      const termGroup = wp._embedded?.['wp:term'] || [];
      const catTerms = termGroup[0] || [];
      const allCats = catTerms.map((t: any) => t.name);

      return {
        id: wp.id,
        slug: wp.slug,
        title: wp.title.rendered,
        excerpt: wp.excerpt.rendered,
        category: allCats[0] || 'Archive',
        categories: allCats.length > 0 ? allCats : ['Archive'],
        date: new Date(wp.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }),
        imageUrl,
      };
    });

    // Formatting date string like 'March 2026'
    const name = new Date(`${year}-${month}-02`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { archiveName: name, posts: formattedPosts };
  } catch (error) {
    console.error("Failed to fetch archive posts:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { year: string, month: string } }) {
  return {
    title: `Archive: ${params.month}/${params.year} | JABNOM`,
    alternates: {
      canonical: `/archive/${params.year}/${params.month}`,
    }
  };
}

export default async function ArchivePage({ params }: { params: { year: string, month: string } }) {
  const data = await fetchArchivePosts(params.year, params.month);
  if (!data) return notFound();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ background: 'linear-gradient(to bottom, #111, var(--bg-color))', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--text-color)', marginBottom: '1rem' }}>
          คลังเก็บโพสต์: <span style={{ color: 'var(--accent-color)' }}>{data.archiveName}</span>
        </h1>
      </div>
      <section style={{ flexGrow: 1 }}>
        {data.posts.length > 0 ? (
          <MasonryGrid posts={data.posts} hideHeader={true} />
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>ยังไม่มีบทความในเดือนนี้</div>
        )}
      </section>
      <Footer />
    </main>
  );
}
