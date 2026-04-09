import type { Metadata } from 'next';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GalleryLightbox from '../../components/GalleryLightbox';
import TiktokEmbedLoader from '../../components/TiktokEmbedLoader';
async function fetchPostBySlug(slug: string) {
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpApiUrl) return null;

  const res = await fetch(`${wpApiUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed`, { cache: 'no-store' });
  if (res.ok) {
    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
  }
  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await fetchPostBySlug(decodedSlug);
  if (!post) return {};

  const yoast = post.yoast_head_json;
  const renderedTitle = post.title?.rendered || '';
  const cleanTitle = renderedTitle.replace(/<\/?[^>]+(>|$)/g, "");

  if (!yoast) {
    return {
      title: cleanTitle,
    };
  }

  return {
    title: yoast.title,
    description: yoast.description || yoast.og_description,
    openGraph: {
      title: yoast.og_title || yoast.title,
      description: yoast.og_description || yoast.description,
      url: (yoast.og_url ? yoast.og_url.replace('admin.jabnom.com', 'jabnom.com') : `/${decodedSlug}`).replace(/\/$/, ''),
      siteName: yoast.og_site_name,
      images: yoast.og_image ? yoast.og_image.map((img: any) => ({ url: img.url })) : [],
      locale: yoast.og_locale,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
    twitter: {
      card: yoast.twitter_card,
    },
    alternates: {
      canonical: (yoast.canonical ? yoast.canonical.replace('admin.jabnom.com', 'jabnom.com') : `/${decodedSlug}`).replace(/\/$/, ''),
    }
  };
}

function processTiktokEmbeds(html: string) {
  // Regex to match TikTok URLs that are on their own line (wrapped in <p> tags)
  // Supports desktop links (with video ID) and mobile short links (vt.tiktok.com)
  const tiktokRegex = /<p>(?:\s*<a[^>]*>)?\s*(https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)|https?:\/\/vt\.tiktok\.com\/[\w-]+\/?)\s*(?:<\/a>\s*)?<\/p>/gi;
  
  return html.replace(tiktokRegex, (match, url, videoId) => {
    const cleanUrl = url.split('?')[0];
    if (videoId) {
      return `<blockquote class="tiktok-embed" cite="${cleanUrl}" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px;margin: 2rem auto;"><section></section></blockquote>`;
    } else {
      return `<blockquote class="tiktok-embed" cite="${cleanUrl}" style="max-width: 605px;min-width: 325px;margin: 2rem auto;"><section></section></blockquote>`;
    }
  });
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await fetchPostBySlug(decodedSlug);
  if (!post) return notFound();

  let imageUrl = '';
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    const rawUrl = post._embedded['wp:featuredmedia'][0].source_url;
    imageUrl = encodeURI(rawUrl);
  }

  const termGroup = post._embedded?.['wp:term'] || [];
  const catTerms = termGroup[0] || [];
  const tagTerms = termGroup[1] || [];

  const processedContent = processTiktokEmbeds(post.content.rendered);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <article lang="th" style={{ flexGrow: 1, padding: '8rem 2rem 4rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={post.title.rendered} 
            style={{ width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '2rem' }} 
          />
        )}
        
        {catTerms.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
            {catTerms.map((cat: any, i: number) => (
              <Link key={i} href={`/category/${cat.slug}`} style={{
                background: 'var(--accent-color)', 
                color: '#ffffff', 
                padding: '0.25rem 0.8rem', 
                borderRadius: '20px', 
                fontSize: '0.7rem', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                boxShadow: '0 0 15px var(--accent-color), 0 0 25px var(--accent-glow)',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s ease'
              }}>
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <h1 
          className="post-title"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem', color: 'var(--accent-color)' }} 
          dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
        />
        <div style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.95rem' }}>
           {new Date(post.date).toLocaleDateString('th-TH', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div 
          className="classic-editor-content"
          style={{ fontSize: '1.15rem', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: processedContent }} 
        />

        {tagTerms.length > 0 && (
          <div style={{ 
            marginTop: '3rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: '1.8'
          }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>Tags:</span>{' '}
            {tagTerms.map((tag: any, index: number) => (
              <span key={tag.slug}>
                <Link prefetch={false} href={`/tag/${tag.slug}`} className="post-tag-link">
                  {tag.name}
                </Link>
                {index < tagTerms.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </article>
      <TiktokEmbedLoader />
      <GalleryLightbox />
      <Footer />
    </main>
  );
}
