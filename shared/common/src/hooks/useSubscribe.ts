import { useEffect } from 'modules/react';

import type { Observable } from 'modules/rxjs';

export function useSubscribe<T>(observable: Observable<T>, callback: (value: T) => void, deps: ISafeAny[]) {
  useEffect(() => {
    const subs = observable.subscribe(callback);
    return () => subs.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
