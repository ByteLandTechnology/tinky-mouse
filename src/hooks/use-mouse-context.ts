import { useContext } from "react";
import { MouseContext } from "../contexts/MouseContext.js";

/**
 * Hook to access the MouseContext.
 *
 * Must be used within a `MouseProvider`.
 *
 * @returns The mouse context value containing `subscribe` and `unsubscribe` methods.
 * @throws Error if used outside of a `MouseProvider`.
 */
export function useMouseContext() {
  const context = useContext(MouseContext);
  if (!context) {
    throw new Error("useMouseContext must be used within a MouseProvider");
  }
  return context;
}
