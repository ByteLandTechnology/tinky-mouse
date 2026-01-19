**tinky-mouse**

---

# tinky-mouse 🐭

> Mouse event handling for `tinky` applications.

`tinky-mouse` provides a robust system for handling mouse events in terminal applications built with `tinky`. It explicitly supports SGR (1006) and X11 mouse tracking protocols, offering a React-friendly API.

## Features

- **Protocol Support**: Handles both SGR (1006) and legacy X11 mouse tracking.
- **Rich Events**: Detects clicks (left, right, middle), releases, scrolls (up, down, left, right), and movement.
- **React Hooks**: Easy-to-use `useMouse` hook for components.
- **Context-based**: Efficient event distribution via `MouseContext`.

## Installation

```bash
npm install tinky-mouse
```

## Usage

Wrap your application in `MouseProvider` and use the `useMouse` hook in your components.

### 1. Setup the Provider

```tsx
import React from "react";
import { render } from "tinky";
import { MouseProvider } from "tinky-mouse";
import App from "./App";

render(
  <MouseProvider mouseEventsEnabled={true}>
    <App />
  </MouseProvider>,
);
```

### 2. Listen for Events

```tsx
import React, { useState } from "react";
import { Text } from "tinky";
import { useMouse } from "tinky-mouse";

function ClickCounter() {
  const [count, setCount] = useState(0);

  useMouse((event) => {
    if (event.name === "left-press") {
      setCount((c) => c + 1);
    }
  });

  return <Text>Clicks: {count}</Text>;
}
```

## API Reference

### `MouseProvider`

The top-level component that enables mouse tracking.

| Prop                 | Type        | Description                                         |
| -------------------- | ----------- | --------------------------------------------------- |
| `children`           | `ReactNode` | Child components.                                   |
| `mouseEventsEnabled` | `boolean`   | Whether to enable mouse tracking. Default: `false`. |

### `useMouse(handler, options)`

Hook to subscribe to mouse events.

| Argument  | Type                          | Description                                     |
| --------- | ----------------------------- | ----------------------------------------------- |
| `handler` | `(event: MouseEvent) => void` | Callback function for mouse events.             |
| `options` | `{ isActive?: boolean }`      | Optional config. `isActive` defaults to `true`. |

### `MouseEvent` Object

```ts
interface MouseEvent {
  name: MouseEventName; // 'left-press', 'scroll-up', 'move', etc.
  col: number; // Column (x)
  row: number; // Row (y)
  shift: boolean; // Shift key held
  meta: boolean; // Meta/Alt key held
  ctrl: boolean; // Ctrl key held
  button: "left" | "middle" | "right" | "none";
}
```

## License

Apache-2.0
