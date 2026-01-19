import { useStdin } from "tinky";
import type React from "react";
import { createContext, useCallback, useEffect, useRef } from "react";
import { ESC } from "../utils/sequences.js";

import {
  isIncompleteMouseSequence,
  parseMouseEvent,
  type MouseEvent,
  type MouseEventName,
  type MouseHandler,
} from "../utils/mouse.js";

export type { MouseEvent, MouseEventName, MouseHandler };

const MAX_MOUSE_BUFFER_SIZE = 4096;

// ANSI escape sequences for mouse event control
const ENABLE_MOUSE_SEQUENCES = [
  "\x1b[?1000h", // Enable basic mouse mode (button press/release)
  "\x1b[?1002h", // Enable button event tracking (motion while button down)
  "\x1b[?1003h", // Enable any event tracking (all motion) - optional
  "\x1b[?1006h", // Enable SGR extended mode (better coordinate reporting)
];

const DISABLE_MOUSE_SEQUENCES = [
  "\x1b[?1006l", // Disable SGR extended mode
  "\x1b[?1003l", // Disable any event tracking
  "\x1b[?1002l", // Disable button event tracking
  "\x1b[?1000l", // Disable basic mouse mode
];

/**
 * Enable mouse event reporting in the terminal.
 */
export function enableMouseEvents(): void {
  for (const seq of ENABLE_MOUSE_SEQUENCES) {
    process.stdout.write(seq);
  }
}

/**
 * Disable mouse event reporting in the terminal.
 */
export function disableMouseEvents(): void {
  for (const seq of DISABLE_MOUSE_SEQUENCES) {
    process.stdout.write(seq);
  }
}

/**
 * Context value for mouse event handling.
 */
export interface MouseContextValue {
  /**
   * Subscribes a handler to mouse events.
   * @param handler - The handler function.
   */
  subscribe: (handler: MouseHandler) => void;
  /**
   * Unsubscribes a handler from mouse events.
   * @param handler - The handler function to remove.
   */
  unsubscribe: (handler: MouseHandler) => void;
}

/**
 * Context for managing mouse events.
 */
/**
 * Context for managing mouse events.
 */
export const MouseContext = createContext<MouseContextValue | undefined>(
  undefined,
);

/**
 * Props for the MouseProvider component.
 */
export interface MouseProviderProps {
  /** The child components that will have access to the mouse context. */
  children: React.ReactNode;
  /** Whether to enable mouse event reporting. */
  mouseEventsEnabled?: boolean;
}

/**
 * Provider component that sets up mouse event listening and distribution.
 *
 * It enables mouse reporting on mount (if enabled) and disables it on unmount.
 * It uses the `tinky` `useStdin` hook to read from the input stream.
 *
 * @example
 * ```tsx
 * <MouseProvider mouseEventsEnabled={true}>
 *   <App />
 * </MouseProvider>
 * ```
 *
 * @param props - The component props.
 */
export function MouseProvider(props: MouseProviderProps) {
  const { children, mouseEventsEnabled } = props;
  const { stdin } = useStdin();
  const subscribers = useRef<Set<MouseHandler>>(new Set()).current;

  const subscribe = useCallback(
    (handler: MouseHandler) => {
      subscribers.add(handler);
    },
    [subscribers],
  );

  const unsubscribe = useCallback(
    (handler: MouseHandler) => {
      subscribers.delete(handler);
    },
    [subscribers],
  );

  useEffect(() => {
    if (!mouseEventsEnabled) {
      return;
    }

    // Enable mouse event reporting in terminal
    enableMouseEvents();

    let mouseBuffer = "";

    const broadcast = (event: MouseEvent) => {
      for (const handler of subscribers) {
        handler(event);
      }
    };

    const handleData = (data: Buffer | string) => {
      mouseBuffer += typeof data === "string" ? data : data.toString("utf-8");

      // Safety cap to prevent infinite buffer growth on garbage
      if (mouseBuffer.length > MAX_MOUSE_BUFFER_SIZE) {
        mouseBuffer = mouseBuffer.slice(-MAX_MOUSE_BUFFER_SIZE);
      }

      while (mouseBuffer.length > 0) {
        const parsed = parseMouseEvent(mouseBuffer);

        if (parsed) {
          broadcast(parsed.event);
          mouseBuffer = mouseBuffer.slice(parsed.length);
          continue;
        }

        if (isIncompleteMouseSequence(mouseBuffer)) {
          break; // Wait for more data
        }

        // Not a valid sequence at start, and not waiting for more data.
        // Discard garbage until next possible sequence start.
        const nextEsc = mouseBuffer.indexOf(ESC, 1);
        if (nextEsc !== -1) {
          mouseBuffer = mouseBuffer.slice(nextEsc);
          // Loop continues to try parsing at new location
        } else {
          mouseBuffer = "";
          break;
        }
      }
    };

    if (!stdin) return;

    const stdinStream = stdin as NodeJS.ReadStream;
    stdinStream.on("data", handleData);

    return () => {
      stdinStream.removeListener("data", handleData);
      // Disable mouse event reporting when unmounting
      disableMouseEvents();
    };
  }, [stdin, mouseEventsEnabled, subscribers]);

  return (
    <MouseContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </MouseContext.Provider>
  );
}
