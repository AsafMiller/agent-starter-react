import { UnansweredList } from '@/components/unanswered/unanswered-list';

export default function UnansweredPage() {
  return (
    <main className="bg-background min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <UnansweredList />
      </div>
    </main>
  );
}
