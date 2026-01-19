# tinky-mouse 🐭

> 适用于 `tinky` 应用程序的鼠标事件处理。

`tinky-mouse` 为使用 `tinky` 构建的终端应用程序提供了一套强大的鼠标事件处理系统。它显式支持 SGR (1006) 和 X11 鼠标追踪协议，并提供了 React 友好的 API。

## 功能特性

- **协议支持**：同时处理 SGR (1006) 和传统的 X11 鼠标追踪。
- **丰富的事件**：检测点击（左键、右键、中键）、释放、滚动（上、下、左、右）以及移动。
- **React Hooks**：易于使用的 `useMouse` hook，方便在组件中使用。
- **基于 Context**：通过 `MouseContext` 进行高效的事件分发。

## 安装

```bash
npm install tinky-mouse
```

## 使用方法

使用 `MouseProvider` 包裹你的应用程序，并在组件中使用 `useMouse` hook。

### 1. 设置 Provider

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

### 2. 监听事件

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

## API 参考

### `MouseProvider`

启用鼠标追踪的顶层组件。

| 属性                 | 类型        | 描述                                |
| -------------------- | ----------- | ----------------------------------- |
| `children`           | `ReactNode` | 子组件。                            |
| `mouseEventsEnabled` | `boolean`   | 是否启用鼠标追踪。默认值：`false`。 |

### `useMouse(handler, options)`

用于订阅鼠标事件的 Hook。

| 参数      | 类型                          | 描述                                 |
| --------- | ----------------------------- | ------------------------------------ |
| `handler` | `(event: MouseEvent) => void` | 鼠标事件的回调函数。                 |
| `options` | `{ isActive?: boolean }`      | 可选配置。`isActive` 默认为 `true`。 |

### `MouseEvent` 对象

```ts
interface MouseEvent {
  name: MouseEventName; // 'left-press', 'scroll-up', 'move' 等
  col: number; // 列 (x)
  row: number; // 行 (y)
  shift: boolean; // 是否按住 Shift 键
  meta: boolean; // 是否按住 Meta/Alt 键
  ctrl: boolean; // 是否按住 Ctrl 键
  button: "left" | "middle" | "right" | "none";
}
```

## 许可证

Apache-2.0
