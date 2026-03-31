import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jabnom.com';
  const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  
  if (!wpApiUrl) return [];

  try {
    const res = await fetch(`${wpApiUrl}/wp-json/wp/v2/posts?per_page=100`, { next: { revalidate: 3600 } });
    const posts = await res.json();
    
    // Map blogposts
    const postUrls = Array.isArray(posts) ? posts.map((post: any) => ({
      url: `${baseUrl}/${post.slug}`,
      lastModified: new Date(post.modified).toISOString(),
      changeFrequency: 'daily' as any,
      priority: 0.8,
    })) : [];
    
    // Map categories
    const catRes = await fetch(`${wpApiUrl}/wp-json/wp/v2/categories?per_page=100`, { next: { revalidate: 3600 } });
    const categories = await catRes.json();
    const categoryUrls = Array.isArray(categories) ? categories.map((cat: any) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as any,
      priority: 0.6,
    })) : [];

    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'always',
        priority: 1,
      },
      ...categoryUrls,
      ...postUrls,
    ]
  } catch (error) {
    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'always',
        priority: 1,
      }
    ]
  }
}
