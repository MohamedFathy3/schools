// ErrorFallback.tsx
import React from 'react';

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <p>{error.message}</p>
    </div>
  );
};

export default ErrorFallback;
