import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

const Ctx = createContext<(m: string) => void>(() => {});
export const useAnnounce = () => useContext(Ctx);

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const announce = useCallback((m: string) => {
    setMsg('');
    setTimeout(() => setMsg(m), 20);
  }, []);
  return (
    <Ctx.Provider value={announce}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{msg}</div>
    </Ctx.Provider>
  );
}
