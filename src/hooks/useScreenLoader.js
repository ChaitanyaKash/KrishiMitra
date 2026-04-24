import React from 'react';

export function useScreenLoader(delay = 600) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), delay);

    return () => window.clearTimeout(timer);
  }, [delay]);

  return isReady;
}
