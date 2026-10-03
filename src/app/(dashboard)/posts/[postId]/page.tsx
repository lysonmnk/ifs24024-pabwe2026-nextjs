import DetailPage from "@/features/posts/pages/DetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <DetailPage postId={postId} />;
}
