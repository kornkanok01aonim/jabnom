import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import MasonryGrid from '../../../components/MasonryGrid';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

async function fetchCategoryPosts(slug: string, page: number = 1) {
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpApiUrl) return null;

  try {
    // 1. Fetch Category ID from Slug using REST API
    const catRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/categories?slug=${slug}`, { cache: 'no-store' });
    const categories = await catRes.json();
    
    if (!categories || categories.length === 0) return null;
    
    const category = categories[0];
    
    // 2. Fetch Posts by Category ID using REST API
    const postsPerPage = 9;
    const offset = (page - 1) * postsPerPage;
    const postsRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/posts?categories=${category.id}&_embed&per_page=${postsPerPage}&offset=${offset}`, { cache: 'no-store' });
    
    let totalPages = 1;
    if (postsRes.ok) {
      const totalPagesHeader = postsRes.headers.get('x-wp-totalpages');
      if (totalPagesHeader) {
        totalPages = parseInt(totalPagesHeader, 10);
      } else {
        const totalHeader = postsRes.headers.get('x-wp-total');
        const totalPosts = totalHeader ? parseInt(totalHeader, 10) : 0;
        if (totalPosts > 0) {
          totalPages = Math.ceil(totalPosts / postsPerPage);
        }
      }
    }

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
      posts: formattedPosts,
      totalPages: totalPages
    };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await fetchCategoryPosts(decodedSlug, 1);
  
  if (!data) return { title: 'Category' };

  return {
    title: `หมวดหมู่: ${data.categoryName} | JABNOM`,
    description: data.description || `รวมบทความทั้งหมดในหมวดหมู่ ${data.categoryName}`,
    alternates: {
      canonical: `https://jabnom.com/category/${decodedSlug}`,
    }
  };
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }, searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await fetchCategoryPosts(decodedSlug, currentPage);
  
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

      <section style={{ flexGrow: 1, padding: '2rem 0', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {data.posts.length > 0 ? (
          <>
            <MasonryGrid posts={data.posts} hideHeader={true} />
            
            {data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                {currentPage > 1 ? (
                  <Link href={`/category/${params.slug}?page=${currentPage - 1}`} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-secondary)', color: 'var(--text-color)', textDecoration: 'none', borderRadius: '8px', border: '1px solid var(--accent-color)', transition: 'all 0.3s' }}>
                    หน้าก่อนหน้า
                  </Link>
                ) : (
                  <div style={{ padding: '0.75rem 1.5rem', visibility: 'hidden' }}>หน้าก่อนหน้า</div>
                )}
                
                <span style={{ color: 'var(--text-muted)' }}>
                  หน้า {currentPage} / {data.totalPages}
                </span>
                
                {currentPage < data.totalPages ? (
                  <Link href={`/category/${params.slug}?page=${currentPage + 1}`} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-secondary)', color: 'var(--text-color)', textDecoration: 'none', borderRadius: '8px', border: '1px solid var(--accent-color)', transition: 'all 0.3s' }}>
                    หน้าถัดไป
                  </Link>
                ) : (
                  <div style={{ padding: '0.75rem 1.5rem', visibility: 'hidden' }}>หน้าถัดไป</div>
                )}
              </div>
            )}
          </>
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
