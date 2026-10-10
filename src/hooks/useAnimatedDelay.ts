import { useRef, type RefObject } from "react";

interface UseAnimatedDelayResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  trigger: (callback: () => void) => void;
}

export function useAnimatedDelay<T extends HTMLElement = HTMLButtonElement>(
  className: string,
  delay: number,
): UseAnimatedDelayResult<T> {
  const ref = useRef<T>(null);

  const trigger = (callback: () => void) => {
    ref.current?.classList.add(className);
    setTimeout(() => {
      callback();
      ref.current?.classList.remove(className);
    }, delay);
  };

  return { ref, trigger };
}
