import { memo } from "react";

const LoadingSpinner = memo(() => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
