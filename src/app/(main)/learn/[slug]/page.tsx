import TopicDetailClient from './TopicDetailClient';

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <TopicDetailClient slug={slug} />
    </>
  );
}
