import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Client Portal Lite`;
    return () => { document.title = 'Client Portal Lite'; };
  }, [title]);
}
