import { describe, it, expect } from "bun:test";
import {
  ESC,
  SGR_EVENT_PREFIX,
  X11_EVENT_PREFIX,
  SGR_MOUSE_REGEX,
  X11_MOUSE_REGEX,
  couldBeSGRMouseSequence,
  couldBeMouseSequence,
  getMouseSequenceLength,
} from "../src/utils/sequences.js";

describe("sequences.ts constants", () => {
  it("ESC should be the escape character", () => {
    expect(ESC).toBe("\u001B");
    expect(ESC).toBe("\x1b");
  });

  it("SGR_EVENT_PREFIX should be correct", () => {
    expect(SGR_EVENT_PREFIX).toBe("\x1b[<");
  });

  it("X11_EVENT_PREFIX should be correct", () => {
    expect(X11_EVENT_PREFIX).toBe("\x1b[M");
  });
});

describe("SGR_MOUSE_REGEX", () => {
  it("should match SGR mouse press event", () => {
    const input = "\x1b[<0;10;20M";
    const match = input.match(SGR_MOUSE_REGEX);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe("0"); // button code
    expect(match?.[2]).toBe("10"); // column
    expect(match?.[3]).toBe("20"); // row
    expect(match?.[4]).toBe("M"); // press
  });

  it("should match SGR mouse release event", () => {
    const input = "\x1b[<0;10;20m";
    const match = input.match(SGR_MOUSE_REGEX);
    expect(match).not.toBeNull();
    expect(match?.[4]).toBe("m"); // release
  });

  it("should match multi-digit coordinates", () => {
    const input = "\x1b[<35;100;200M";
    const match = input.match(SGR_MOUSE_REGEX);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe("35");
    expect(match?.[2]).toBe("100");
    expect(match?.[3]).toBe("200");
  });

  it("should not match incomplete sequence", () => {
    const input = "\x1b[<0;10;20";
    const match = input.match(SGR_MOUSE_REGEX);
    expect(match).toBeNull();
  });

  it("should not match non-mouse sequence", () => {
    const input = "\x1b[A";
    const match = input.match(SGR_MOUSE_REGEX);
    expect(match).toBeNull();
  });
});

describe("X11_MOUSE_REGEX", () => {
  it("should match X11 mouse event", () => {
    const input = '\x1b[M !"'; // button 0, col 1, row 2 (after -32 offset)
    const match = input.match(X11_MOUSE_REGEX);
    expect(match).not.toBeNull();
    expect(match?.[1].length).toBe(3);
  });

  it("should match X11 mouse with various characters", () => {
    const input = "\x1b[MABC";
    const match = input.match(X11_MOUSE_REGEX);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe("ABC");
  });

  it("should not match incomplete X11 sequence", () => {
    const input = "\x1b[MA";
    const match = input.match(X11_MOUSE_REGEX);
    expect(match).toBeNull();
  });
});

describe("couldBeSGRMouseSequence", () => {
  it("should return true for empty buffer", () => {
    expect(couldBeSGRMouseSequence("")).toBe(true);
  });

  it("should return true for ESC", () => {
    expect(couldBeSGRMouseSequence("\x1b")).toBe(true);
  });

  it("should return true for ESC[", () => {
    expect(couldBeSGRMouseSequence("\x1b[")).toBe(true);
  });

  it("should return true for ESC[<", () => {
    expect(couldBeSGRMouseSequence("\x1b[<")).toBe(true);
  });

  it("should return true for full SGR sequence prefix", () => {
    expect(couldBeSGRMouseSequence("\x1b[<0;10;20M")).toBe(true);
  });

  it("should return true for partial SGR sequence", () => {
    expect(couldBeSGRMouseSequence("\x1b[<0;10")).toBe(true);
  });

  it("should return false for non-SGR sequence", () => {
    expect(couldBeSGRMouseSequence("\x1b[A")).toBe(false);
  });

  it("should return false for plain text", () => {
    expect(couldBeSGRMouseSequence("hello")).toBe(false);
  });
});

describe("couldBeMouseSequence", () => {
  it("should return true for empty buffer", () => {
    expect(couldBeMouseSequence("")).toBe(true);
  });

  it("should return true for ESC", () => {
    expect(couldBeMouseSequence("\x1b")).toBe(true);
  });

  it("should return true for ESC[", () => {
    expect(couldBeMouseSequence("\x1b[")).toBe(true);
  });

  it("should return true for SGR prefix", () => {
    expect(couldBeMouseSequence("\x1b[<")).toBe(true);
  });

  it("should return true for X11 prefix", () => {
    expect(couldBeMouseSequence("\x1b[M")).toBe(true);
  });

  it("should return true for complete SGR sequence", () => {
    expect(couldBeMouseSequence("\x1b[<0;10;20M")).toBe(true);
  });

  it("should return true for complete X11 sequence", () => {
    expect(couldBeMouseSequence("\x1b[MABC")).toBe(true);
  });

  it("should return false for arrow key sequence", () => {
    expect(couldBeMouseSequence("\x1b[A")).toBe(false);
  });

  it("should return false for non-escape sequence", () => {
    expect(couldBeMouseSequence("abc")).toBe(false);
  });
});

describe("getMouseSequenceLength", () => {
  it("should return length for SGR mouse sequence", () => {
    const input = "\x1b[<0;10;20M";
    expect(getMouseSequenceLength(input)).toBe(input.length);
  });

  it("should return length for SGR release sequence", () => {
    const input = "\x1b[<0;10;20m";
    expect(getMouseSequenceLength(input)).toBe(input.length);
  });

  it("should return length for multi-digit SGR sequence", () => {
    const input = "\x1b[<35;100;200M";
    expect(getMouseSequenceLength(input)).toBe(input.length);
  });

  it("should return length for X11 mouse sequence", () => {
    const input = "\x1b[MABC";
    expect(getMouseSequenceLength(input)).toBe(6);
  });

  it("should return 0 for incomplete SGR sequence", () => {
    expect(getMouseSequenceLength("\x1b[<0;10")).toBe(0);
  });

  it("should return 0 for incomplete X11 sequence", () => {
    expect(getMouseSequenceLength("\x1b[MA")).toBe(0);
  });

  it("should return 0 for non-mouse sequence", () => {
    expect(getMouseSequenceLength("\x1b[A")).toBe(0);
  });

  it("should return 0 for empty buffer", () => {
    expect(getMouseSequenceLength("")).toBe(0);
  });

  it("should return length only for sequence at start", () => {
    const input = "text\x1b[<0;10;20M";
    expect(getMouseSequenceLength(input)).toBe(0);
  });

  it("should handle SGR sequence followed by more data", () => {
    const input = "\x1b[<0;10;20Mextra";
    expect(getMouseSequenceLength(input)).toBe(11); // just the mouse sequence
  });
});
