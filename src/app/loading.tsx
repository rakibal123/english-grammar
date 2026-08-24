export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-md"></div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading content...</p>
      </div>
    </div>
  );
}
