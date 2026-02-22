import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://teacher-shelter.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 카테고리 페이지
  const categories = [
    'free',
    'anonymous',
    'humor',
    'info',
    'knowhow',
    'legal-qna',
    'job-posting',
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/posts?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // TODO: 동적으로 게시글 목록 가져오기 (API 연동 시)
  // const postsResponse = await fetch(`${API_URL}/posts?limit=1000`);
  // const posts = await postsResponse.json();
  // const postPages = posts.data.map((post) => ({
  //   url: `${BASE_URL}/posts/${post.id}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }));

  return [...staticPages, ...categoryPages];
}
