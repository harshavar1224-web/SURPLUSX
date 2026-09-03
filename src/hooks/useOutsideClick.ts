import { useEffect, RefObject } from 'react';

export function useOutsideClick(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  isOpen: boolean
) {
  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
      // Handle Escape key
      if ('key' in event && event.key === 'Escape') {
        handler();
        return;
      }

      // Handle outside click/touch
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('keydown', listener);
    };
  }, [isOpen, ref, handler]);
}
