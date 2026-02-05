import { FaqList } from '@/components/faq/faq-list';

export default function FaqPage() {
  return (
    <main className="bg-background min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold">FAQ Management</h1>
          <p className="text-muted-foreground mt-1">The Meridian Casino & Resort</p>
        </div>
        <FaqList />
      </div>
    </main>
  );
}
