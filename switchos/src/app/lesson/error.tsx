'use client';

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🖥️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Error</h2>
        <p className="text-sm text-gray-500 mb-6">
          Something went wrong with the simulation. This usually fixes itself with a refresh.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Restart Lesson
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
