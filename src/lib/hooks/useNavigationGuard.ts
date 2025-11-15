import { useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

const defaultMessage = 'Are you sure you want to leave? You will remain logged in, but unsaved work may be lost.';

export function useNavigationGuard(enabled: boolean, message: string = defaultMessage) {
  const navigator = useContext(UNSAFE_NavigationContext).navigator as any;

  useEffect(() => {
    if (!enabled || !navigator.block) {
      return undefined;
    }

    const unblock = navigator.block((tx: any) => {
      if (window.confirm(message)) {
        unblock();
        tx.retry();
      }
    });

    return unblock;
  }, [enabled, navigator, message]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, message]);
}
