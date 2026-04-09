import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import MasonryGrid from '../../../components/MasonryGrid';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

async function fetchCategoryPosts(slug: string) {
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpApiUrl) return null;

  try {
    // 1. Fetch Category ID from Slug using REST API
    const catRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/categories?slug=${slug}`, { cache: 'no-store' });
    const categories = await catRes.json();
    
    if (!categories || categories.length === 0) return null;
    
    const category = categories[0];
    
    // 2. Fetch Posts by Category ID using REST API
    const postsRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/posts?categories=${category.id}&_embed&per_page=12`, { cache: 'no-store' });
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
        category: allCats[0] || category.name,
        categories: allCats.length > 0 ? allCats : [category.name],
        date: new Date(wp.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }),
        imageUrl,
      };
    });

    return {
      categoryName: category.name,
      description: category.description,
      posts: formattedPosts
    };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await fetchCategoryPosts(decodedSlug);
  
  if (!data) return { title: 'Category' };

  return {
    title: `หมวดหมู่: ${data.categoryName} | JABNOM`,
    description: data.description || `รวมบทความทั้งหมดในหมวดหมู่ ${data.categoryName}`,
    alternates: {
      canonical: `https://jabnom.com/category/${decodedSlug}`,
    }
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await fetchCategoryPosts(decodedSlug);
  
  if (!data) return notFound();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      
      <div style={{ background: 'linear-gradient(to bottom, #111, var(--bg-color))', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--text-color)', marginBottom: '1rem' }}>
          หมวดหมู่: <span style={{ color: 'var(--accent-color)' }}>{data.categoryName}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          รวมบทความทั้งหมดในหมวดหมู่นี้
        </p>
      </div>

      <section style={{ flexGrow: 1 }}>
        {data.posts.length > 0 ? (
          <MasonryGrid posts={data.posts} hideHeader={true} />
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            ยังไม่มีบทความในหมวดหมู่นี้
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
