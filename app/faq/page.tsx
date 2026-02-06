import { FaqList } from '@/components/faq/faq-list';

export default function FaqPage() {
  return (
    <main className="bg-background min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <FaqList />
      </div>
    </main>
  );
}
