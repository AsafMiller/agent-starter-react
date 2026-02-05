import { UnansweredList } from '@/components/unanswered/unanswered-list';

export default function UnansweredPage() {
  return (
    <main className="bg-background min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold">Unanswered Questions</h1>
          <p className="text-muted-foreground mt-1">
            Questions that guests asked but couldn&apos;t find answers for
          </p>
        </div>
        <UnansweredList />
      </div>
    </main>
  );
}
