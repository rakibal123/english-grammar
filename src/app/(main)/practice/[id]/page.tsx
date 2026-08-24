import QuizClient from './QuizClient';

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <QuizClient testSetId={id} />
    </>
  );
}
