/* eslint-disable no-control-regex */
/** ESC character (ASCII 27). */
export const ESC = "\u001B";
/** Prefix for SGR (1006) mouse sequences. */
export const SGR_EVENT_PREFIX = `${ESC}[<`;
/** Prefix for X11 mouse sequences. */
export const X11_EVENT_PREFIX = `${ESC}[M`;

/** Regex to match a complete SGR mouse event sequence. */
export const SGR_MOUSE_REGEX = /^\x1b\[<(\d+);(\d+);(\d+)([mM])/; // SGR mouse events
// X11 is ESC [ M followed by 3 bytes.
/** Regex to match a complete X11 mouse event sequence. */
export const X11_MOUSE_REGEX = /^\x1b\[M([\s\S]{3})/;

/**
 * Checks if the buffer starts with or is a prefix of an SGR mouse sequence.
 *
 * @param buffer - The input string buffer.
 * @returns `true` if it could be an SGR sequence, `false` otherwise.
 *
 * @example
 * ```ts
 * couldBeSGRMouseSequence("\x1b[<"); // true
 * couldBeSGRMouseSequence("\x1b[<0;0;0M"); // true
 * couldBeSGRMouseSequence("hello"); // false
 * ```
 */
export function couldBeSGRMouseSequence(buffer: string): boolean {
  if (buffer.length === 0) return true;
  // Check if buffer is a prefix of a mouse sequence starter
  if (SGR_EVENT_PREFIX.startsWith(buffer)) return true;
  // Check if buffer is a mouse sequence prefix
  if (buffer.startsWith(SGR_EVENT_PREFIX)) return true;

  return false;
}

/**
 * Checks if the buffer starts with or is a prefix of any known mouse sequence (SGR or X11).
 *
 * @param buffer - The input string buffer.
 * @returns `true` if it could be a mouse sequence, `false` otherwise.
 *
 * @example
 * ```ts
 * couldBeMouseSequence("\x1b[M"); // true
 * couldBeMouseSequence("\x1b[<"); // true
 * ```
 */
export function couldBeMouseSequence(buffer: string): boolean {
  if (buffer.length === 0) return true;

  // Check SGR prefix
  if (
    SGR_EVENT_PREFIX.startsWith(buffer) ||
    buffer.startsWith(SGR_EVENT_PREFIX)
  )
    return true;
  // Check X11 prefix
  if (
    X11_EVENT_PREFIX.startsWith(buffer) ||
    buffer.startsWith(X11_EVENT_PREFIX)
  )
    return true;

  return false;
}

/**
 * Checks if the buffer *starts* with a complete mouse sequence.
 * Returns the length of the sequence if matched, or 0 if not.
 *
 * @param buffer - The input string buffer.
 * @returns The length of the sequence in bytes/characters, or 0 if no complete sequence is found at the start.
 *
 * @example
 * ```ts
 * getMouseSequenceLength("\x1b[<0;10;10M"); // Returns length of the sequence
 * getMouseSequenceLength("\x1b[M   "); // Returns length of X11 sequence
 * getMouseSequenceLength("not mouse"); // 0
 * ```
 */
export function getMouseSequenceLength(buffer: string): number {
  const sgrMatch = buffer.match(SGR_MOUSE_REGEX);
  if (sgrMatch) return sgrMatch[0].length;

  const x11Match = buffer.match(X11_MOUSE_REGEX);
  if (x11Match) return x11Match[0].length;

  return 0;
}
