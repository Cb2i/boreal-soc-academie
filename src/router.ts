import { useEffect, useState } from 'react';

export interface Route {
  name: string;
  params: string[];
  query: URLSearchParams;
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/';
  const [pathPart, qs = ''] = raw.split('?');
  const segs = pathPart.split('/').filter(Boolean).map((s) => decodeURIComponent(s));
  return { name: segs[0] ?? 'accueil', params: segs.slice(1), query: new URLSearchParams(qs) };
}

export function href(name: string, ...params: string[]): string {
  const p = [name, ...params].filter((s) => s !== 'accueil' || params.length > 0).map(encodeURIComponent).join('/');
  return `#/${name === 'accueil' && params.length === 0 ? '' : p}`;
}

export function navigate(to: string): void {
  if (window.location.hash === to) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
