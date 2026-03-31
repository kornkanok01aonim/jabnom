import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import MasonryGrid, { Post } from '../components/MasonryGrid';
import Footer from '../components/Footer';
import Link from 'next/link';

// Fetch from WordPress GraphQL or fallback to mock
async function fetchHomepageData(): Promise<{ posts: Post[], tags: any[], archives: any[] }> {
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  
  if (wpApiUrl) {
    try {
      const res = await fetch(`${wpApiUrl}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetHomepageData {
              posts(first: 12) {
                nodes {
                  databaseId
                  slug
                  title
                  excerpt
                  date
                  categories { nodes { name } }
                  featuredImage { node { sourceUrl } }
                }
              }
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
      
      if (res.ok) {
        const json = await res.json();
        const nodes = json.data?.posts?.nodes || [];
        console.log('✅ WPGraphQL Connection Successful! Posts fetched:', nodes.length);
        
        if (nodes.length > 0) {
          const posts = nodes.map((wp: any) => {
            const imgStr = wp.featuredImage?.node?.sourceUrl || '';
            const safeImageUrl = imgStr ? encodeURI(imgStr) : '';
            const catNodes = wp.categories?.nodes || [];
            const allCats = catNodes.map((c: any) => c.name);
            
            return {
              id: wp.databaseId,
              slug: wp.slug,
              title: wp.title,
              excerpt: wp.excerpt || '',
              category: allCats[0] || 'Uncategorized',
              categories: allCats.length > 0 ? allCats : ['Uncategorized'],
              date: new Date(wp.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }),
              imageUrl: safeImageUrl,
            };
          });

          const tags = json.data?.tags?.nodes || [];
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
          
          const archives = Array.from(archiveMap.entries()).map(([slug, name]) => ({ slug, name }));

          return { posts, tags, archives };
        }
      }
    } catch (error) {
      console.error("Failed to fetch from WPGraphQL:", error);
    }
  }

  // Fallback to Mock Data
  const mockPosts = [
    {
      id: 1,
      slug: 'neon-nights',
      title: 'Neon Nights: The Return of the Warehouse Rave',
      excerpt: '<p>How underground organizers are reclaiming abandoned industrial spaces for the purist techno heads.</p>',
      category: 'Events',
      date: 'OCT 12, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1574154188737-14e3b79ce4d1?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      slug: 'exclusive-talk-dj-vertex',
      title: 'Exclusive Talk: DJ Vertex on Sonic Landscapes',
      excerpt: '<p>The visionary artist discusses the creative process behind the critically acclaimed album "Neon Zenith".</p>',
      category: 'Music',
      date: 'OCT 10, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      slug: 'midnight-fashion-elevated',
      title: 'Midnight Fashion: Streetwear Elevated',
      excerpt: '<p>Exploring the intersection of high fashion and club culture in autumn aesthetics.</p>',
      category: 'Lifestyle',
      date: 'OCT 08, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 4,
      slug: 'underground-vinyl-shops',
      title: 'The Best Underground Vinyl Shops in the City',
      excerpt: '<p>Dig deep into crates at these hidden gems favored by the city\'s top selectors.</p>',
      category: 'Guide',
      date: 'OCT 05, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 5,
      slug: 'mixology-101-dark-matter',
      title: 'Mixology 101: The Dark Matter Cocktail',
      excerpt: '<p>Step-by-step guide to crafting the signature drink of the velvet underground.</p>',
      category: 'Lifestyle',
      date: 'OCT 02, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1470337458703-415120a41f67?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 6,
      slug: 'sound-system-culture',
      title: 'Sound System Culture: History and Future',
      excerpt: '<p>Tracing the roots from Kingston to London, and what defines a massive rig today.</p>',
      category: 'Music',
      date: 'SEP 28, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 7,
      slug: 'festival-rundown-winter',
      title: 'Festival Rundown: Winter Highlights',
      excerpt: '<p>The definitive list of events you absolutely cannot miss as the weather turns cold.</p>',
      category: 'Events',
      date: 'SEP 25, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
    }
  ];

  return { posts: mockPosts, tags: [], archives: [] };
}

export default async function Home() {
  const { posts, tags, archives } = await fetchHomepageData();

  const heroPost = posts.length > 0 ? posts[0] : undefined;
  const gridPosts = posts.length > 0 ? posts.slice(0, 9) : [];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <Hero 
        title={heroPost?.title}
        excerpt={heroPost?.excerpt}
        imageUrl={heroPost?.imageUrl}
        slug={heroPost?.slug}
        category={heroPost?.category}
        categories={heroPost?.categories}
      />
      <section className="container" style={{ padding: '4rem 2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 70%' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--accent-color)' }}>Latest Post</h2>
          <MasonryGrid posts={gridPosts} />
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
