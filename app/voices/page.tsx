import { VoicesList } from '@/components/voices/voices-list';

export default function VoicesPage() {
  return (
    <main className="bg-background min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <VoicesList />
      </div>
    </main>
  );
}
