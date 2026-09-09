import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
        <div className="card">
          <p className="text-sm text-lighter text-center py-8">
            Settings panel — coming soon.
          </p>
        </div>
      </div>
    </>
  );
}
