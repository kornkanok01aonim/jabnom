import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import MasonryGrid from '../../../components/MasonryGrid';
import { notFound } from 'next/navigation';

async function fetchTagPosts(slug: string) {
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpApiUrl) return null;

  try {
    const tagRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/tags?slug=${slug}`, { cache: 'no-store' });
    const tags = await tagRes.json();
    
    if (!tags || tags.length === 0) return null;
    const tag = tags[0];
    
    const postsRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/posts?tags=${tag.id}&_embed&per_page=12`, { cache: 'no-store' });
    const postsData = await postsRes.json();
    
    const formattedPosts = postsData.map((wp: any) => {
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
        title: wp.title.rendered,
        excerpt: wp.excerpt.rendered,
        category: allCats[0] || tag.name,
        categories: allCats.length > 0 ? allCats : [tag.name],
        date: new Date(wp.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }),
        imageUrl,
      };
    });

    return { tagName: tag.name, description: tag.description, posts: formattedPosts };
  } catch (error) {
    console.error("Failed to fetch tag:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await fetchTagPosts(decodedSlug);
  
  if (!data) return { title: 'Tag' };

  return {
    title: `เรื่องที่แฮชแท็ก: ${data.tagName} | JABNOM`,
    description: data.description || `รวมบทความทั้งหมดที่ติดแฮชแท็ก ${data.tagName}`,
    alternates: {
      canonical: `https://jabnom.com/tag/${decodedSlug}`,
    }
  };
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await fetchTagPosts(decodedSlug);
  
  if (!data) return notFound();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ background: 'linear-gradient(to bottom, #111, var(--bg-color))', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--text-color)', marginBottom: '1rem' }}>
          แท็ก: <span style={{ color: 'var(--accent-color)' }}>#{data.tagName}</span>
        </h1>
      </div>
      <section style={{ flexGrow: 1 }}>
        {data.posts.length > 0 ? (
          <MasonryGrid posts={data.posts} hideHeader={true} />
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>ยังไม่มีบทความในแท็กนี้</div>
        )}
      </section>
      <Footer />
    </main>
  );
}
