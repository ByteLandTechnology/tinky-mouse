import { describe, it, expect } from "bun:test";
import {
  getMouseEventName,
  parseSGRMouseEvent,
  parseX11MouseEvent,
  parseMouseEvent,
  isIncompleteMouseSequence,
} from "../src/utils/mouse.js";

describe("getMouseEventName", () => {
  describe("button press events", () => {
    it("should return left-press for button 0", () => {
      expect(getMouseEventName(0, false)).toBe("left-press");
    });

    it("should return middle-press for button 1", () => {
      expect(getMouseEventName(1, false)).toBe("middle-press");
    });

    it("should return right-press for button 2", () => {
      expect(getMouseEventName(2, false)).toBe("right-press");
    });
  });

  describe("button release events", () => {
    it("should return left-release for button 0 release", () => {
      expect(getMouseEventName(0, true)).toBe("left-release");
    });

    it("should return middle-release for button 1 release", () => {
      expect(getMouseEventName(1, true)).toBe("middle-release");
    });

    it("should return right-release for button 2 release", () => {
      expect(getMouseEventName(2, true)).toBe("right-release");
    });
  });

  describe("scroll events", () => {
    it("should return scroll-up for scroll up button code", () => {
      expect(getMouseEventName(64, false)).toBe("scroll-up");
    });

    it("should return scroll-down for scroll down button code", () => {
      expect(getMouseEventName(65, false)).toBe("scroll-down");
    });

    it("should return scroll-left for button code 66", () => {
      expect(getMouseEventName(66, false)).toBe("scroll-left");
    });

    it("should return scroll-right for button code 67", () => {
      expect(getMouseEventName(67, false)).toBe("scroll-right");
    });
  });

  describe("move events", () => {
    it("should return move for move event (button code with bit 5 set)", () => {
      expect(getMouseEventName(32, false)).toBe("move");
    });

    it("should return move for left button move", () => {
      expect(getMouseEventName(32, false)).toBe("move");
    });

    it("should return move for right button move", () => {
      expect(getMouseEventName(34, false)).toBe("move");
    });
  });

  describe("modifier combinations", () => {
    it("should return left-press with shift modifier", () => {
      expect(getMouseEventName(4, false)).toBe("left-press");
    });

    it("should return left-press with meta modifier", () => {
      expect(getMouseEventName(8, false)).toBe("left-press");
    });

    it("should return left-press with ctrl modifier", () => {
      expect(getMouseEventName(16, false)).toBe("left-press");
    });
  });

  describe("edge cases", () => {
    it("should return null for button code 3 (no button)", () => {
      expect(getMouseEventName(3, false)).toBeNull();
    });
  });
});

describe("parseSGRMouseEvent", () => {
  describe("basic parsing", () => {
    it("should parse left button press", () => {
      const result = parseSGRMouseEvent("\x1b[<0;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("left-press");
      expect(result?.event.col).toBe(10);
      expect(result?.event.row).toBe(20);
      expect(result?.event.button).toBe("left");
      expect(result?.length).toBe(11);
    });

    it("should parse left button release", () => {
      const result = parseSGRMouseEvent("\x1b[<0;10;20m");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("left-release");
    });

    it("should parse right button press", () => {
      const result = parseSGRMouseEvent("\x1b[<2;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("right-press");
      expect(result?.event.button).toBe("right");
    });

    it("should parse middle button press", () => {
      const result = parseSGRMouseEvent("\x1b[<1;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("middle-press");
      expect(result?.event.button).toBe("middle");
    });
  });

  describe("scroll events", () => {
    it("should parse scroll up", () => {
      const result = parseSGRMouseEvent("\x1b[<64;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("scroll-up");
    });

    it("should parse scroll down", () => {
      const result = parseSGRMouseEvent("\x1b[<65;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("scroll-down");
    });

    it("should parse scroll left", () => {
      const result = parseSGRMouseEvent("\x1b[<66;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("scroll-left");
    });

    it("should parse scroll right", () => {
      const result = parseSGRMouseEvent("\x1b[<67;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("scroll-right");
    });
  });

  describe("move events", () => {
    it("should parse mouse move (button down)", () => {
      const result = parseSGRMouseEvent("\x1b[<32;50;60M");
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("move");
      expect(result?.event.col).toBe(50);
      expect(result?.event.row).toBe(60);
    });
  });

  describe("modifier detection", () => {
    it("should detect shift modifier", () => {
      const result = parseSGRMouseEvent("\x1b[<4;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.shift).toBe(true);
      expect(result?.event.meta).toBe(false);
      expect(result?.event.ctrl).toBe(false);
    });

    it("should detect meta modifier", () => {
      const result = parseSGRMouseEvent("\x1b[<8;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.meta).toBe(true);
      expect(result?.event.shift).toBe(false);
      expect(result?.event.ctrl).toBe(false);
    });

    it("should detect ctrl modifier", () => {
      const result = parseSGRMouseEvent("\x1b[<16;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.ctrl).toBe(true);
      expect(result?.event.shift).toBe(false);
      expect(result?.event.meta).toBe(false);
    });

    it("should detect multiple modifiers", () => {
      // shift(4) + ctrl(16) = 20
      const result = parseSGRMouseEvent("\x1b[<20;10;20M");
      expect(result).not.toBeNull();
      expect(result?.event.shift).toBe(true);
      expect(result?.event.ctrl).toBe(true);
    });
  });

  describe("large coordinates", () => {
    it("should parse large column value", () => {
      const result = parseSGRMouseEvent("\x1b[<0;999;20M");
      expect(result).not.toBeNull();
      expect(result?.event.col).toBe(999);
    });

    it("should parse large row value", () => {
      const result = parseSGRMouseEvent("\x1b[<0;10;999M");
      expect(result).not.toBeNull();
      expect(result?.event.row).toBe(999);
    });
  });

  describe("invalid inputs", () => {
    it("should return null for incomplete sequence", () => {
      expect(parseSGRMouseEvent("\x1b[<0;10;20")).toBeNull();
    });

    it("should return null for non-SGR sequence", () => {
      expect(parseSGRMouseEvent("\x1b[A")).toBeNull();
    });

    it("should return null for X11 sequence", () => {
      expect(parseSGRMouseEvent("\x1b[MABC")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(parseSGRMouseEvent("")).toBeNull();
    });
  });
});

describe("parseX11MouseEvent", () => {
  // Helper to create X11 sequence (values are offset by 32)
  const createX11Sequence = (button: number, col: number, row: number) => {
    return (
      "\x1b[M" +
      String.fromCharCode(button + 32) +
      String.fromCharCode(col + 32) +
      String.fromCharCode(row + 32)
    );
  };

  describe("basic parsing", () => {
    it("should parse left button press", () => {
      const result = parseX11MouseEvent(createX11Sequence(0, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("left-press");
      expect(result?.event.col).toBe(10);
      expect(result?.event.row).toBe(20);
      expect(result?.event.button).toBe("left");
      expect(result?.length).toBe(6);
    });

    it("should parse right button press", () => {
      const result = parseX11MouseEvent(createX11Sequence(2, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("right-press");
      expect(result?.event.button).toBe("right");
    });

    it("should parse middle button press", () => {
      const result = parseX11MouseEvent(createX11Sequence(1, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("middle-press");
      expect(result?.event.button).toBe("middle");
    });

    it("should parse button release (reports as left-release)", () => {
      const result = parseX11MouseEvent(createX11Sequence(3, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("left-release");
    });
  });

  describe("scroll events", () => {
    it("should parse scroll up", () => {
      const result = parseX11MouseEvent(createX11Sequence(64, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("scroll-up");
    });

    it("should parse scroll down", () => {
      const result = parseX11MouseEvent(createX11Sequence(65, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("scroll-down");
    });
  });

  describe("move events", () => {
    it("should parse mouse move", () => {
      const result = parseX11MouseEvent(createX11Sequence(32, 50, 60));
      expect(result).not.toBeNull();
      expect(result?.event.name).toBe("move");
    });
  });

  describe("modifier detection", () => {
    it("should detect shift modifier", () => {
      const result = parseX11MouseEvent(createX11Sequence(4, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.shift).toBe(true);
    });

    it("should detect meta modifier", () => {
      const result = parseX11MouseEvent(createX11Sequence(8, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.meta).toBe(true);
    });

    it("should detect ctrl modifier", () => {
      const result = parseX11MouseEvent(createX11Sequence(16, 10, 20));
      expect(result).not.toBeNull();
      expect(result?.event.ctrl).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should return null for incomplete sequence", () => {
      expect(parseX11MouseEvent("\x1b[MA")).toBeNull();
    });

    it("should return null for SGR sequence", () => {
      expect(parseX11MouseEvent("\x1b[<0;10;20M")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(parseX11MouseEvent("")).toBeNull();
    });
  });
});

describe("parseMouseEvent", () => {
  it("should parse SGR mouse event", () => {
    const result = parseMouseEvent("\x1b[<0;10;20M");
    expect(result).not.toBeNull();
    expect(result?.event.name).toBe("left-press");
    expect(result?.event.col).toBe(10);
    expect(result?.event.row).toBe(20);
  });

  it("should parse X11 mouse event", () => {
    const sequence =
      "\x1b[M" +
      String.fromCharCode(32) +
      String.fromCharCode(42) +
      String.fromCharCode(52);
    const result = parseMouseEvent(sequence);
    expect(result).not.toBeNull();
    expect(result?.event.name).toBe("left-press");
    expect(result?.event.col).toBe(10);
    expect(result?.event.row).toBe(20);
  });

  it("should prefer SGR over X11 when both could match", () => {
    // SGR sequence
    const result = parseMouseEvent("\x1b[<0;10;20M");
    expect(result).not.toBeNull();
    expect(result?.length).toBe(11); // SGR length
  });

  it("should return null for non-mouse sequence", () => {
    expect(parseMouseEvent("\x1b[A")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseMouseEvent("")).toBeNull();
  });
});

describe("isIncompleteMouseSequence", () => {
  describe("complete sequences", () => {
    it("should return false for complete SGR sequence", () => {
      expect(isIncompleteMouseSequence("\x1b[<0;10;20M")).toBe(false);
    });

    it("should return false for complete X11 sequence", () => {
      const sequence =
        "\x1b[M" +
        String.fromCharCode(32) +
        String.fromCharCode(42) +
        String.fromCharCode(52);
      expect(isIncompleteMouseSequence(sequence)).toBe(false);
    });
  });

  describe("incomplete SGR sequences", () => {
    it("should return true for ESC only", () => {
      expect(isIncompleteMouseSequence("\x1b")).toBe(true);
    });

    it("should return true for ESC[", () => {
      expect(isIncompleteMouseSequence("\x1b[")).toBe(true);
    });

    it("should return true for ESC[<", () => {
      expect(isIncompleteMouseSequence("\x1b[<")).toBe(true);
    });

    it("should return true for ESC[<0", () => {
      expect(isIncompleteMouseSequence("\x1b[<0")).toBe(true);
    });

    it("should return true for ESC[<0;10", () => {
      expect(isIncompleteMouseSequence("\x1b[<0;10")).toBe(true);
    });

    it("should return true for ESC[<0;10;20", () => {
      expect(isIncompleteMouseSequence("\x1b[<0;10;20")).toBe(true);
    });
  });

  describe("incomplete X11 sequences", () => {
    it("should return true for ESC[M", () => {
      expect(isIncompleteMouseSequence("\x1b[M")).toBe(true);
    });

    it("should return true for ESC[M with 1 byte", () => {
      expect(isIncompleteMouseSequence("\x1b[MA")).toBe(true);
    });

    it("should return true for ESC[M with 2 bytes", () => {
      expect(isIncompleteMouseSequence("\x1b[MAB")).toBe(true);
    });
  });

  describe("non-mouse sequences", () => {
    it("should return false for arrow key sequence", () => {
      expect(isIncompleteMouseSequence("\x1b[A")).toBe(false);
    });

    it("should return false for plain text", () => {
      expect(isIncompleteMouseSequence("hello")).toBe(false);
    });

    it("should return true for empty string (could be start of any sequence)", () => {
      // Empty string returns true because couldBeMouseSequence("") returns true
      // An empty buffer could potentially be the start of a mouse sequence
      expect(isIncompleteMouseSequence("")).toBe(true);
    });
  });

  describe("garbage data", () => {
    it("should return false for very long garbage SGR-like sequence", () => {
      // After 50 chars without 'm' or 'M', it should give up
      const longGarbage = "\x1b[<" + "1".repeat(60);
      expect(isIncompleteMouseSequence(longGarbage)).toBe(false);
    });
  });
});
