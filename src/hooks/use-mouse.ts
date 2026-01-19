import { useEffect } from "react";
import { useMouseContext } from "./use-mouse-context.js";
import type { MouseHandler } from "../utils/mouse.js";

/**
 * Hook to subscribe to mouse events.
 *
 * @param handler - The function to call when a mouse event occurs.
 * @param options - Configuration options.
 * @param options.isActive - Whether the subscription is active. Defaults to `true`.
 *
 * @example
 * ```tsx
 * useMouse((event) => {
 *   if (event.name === 'left-press') {
 *     console.log('Clicked at', event.col, event.row);
 *   }
 * });
 * ```
 */
export function useMouse(handler: MouseHandler, { isActive = true } = {}) {
  const { subscribe, unsubscribe } = useMouseContext();

  useEffect(() => {
    if (!isActive) {
      return;
    }

    subscribe(handler);
    return () => unsubscribe(handler);
  }, [isActive, handler, subscribe, unsubscribe]);
}
