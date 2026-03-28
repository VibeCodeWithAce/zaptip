export default function TipPage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Tip Page</h1>
      <p className="text-gray-500">Coming soon...</p>
    </main>
  );
}
