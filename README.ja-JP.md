# tinky-mouse 🐭

> `tinky` アプリケーションのためのマウスイベント処理。

`tinky-mouse` は、`tinky` で構築されたターミナルアプリケーションにおけるマウスイベント処理のための堅牢なシステムを提供します。SGR (1006) および X11 マウス追跡プロトコルを明示的にサポートし、React フレンドリーな API を提供します。

## 機能

- **プロトコルサポート**: SGR (1006) とレガシーな X11 マウス追跡の両方を処理します。
- **リッチなイベント**: クリック（左、右、中）、リリース、スクロール（上、下、左、右）、および移動を検出します。
- **React フック**: コンポーネントで使いやすい `useMouse` フック。
- **コンテキストベース**: `MouseContext` を介した効率的なイベント配信。

## インストール

```bash
npm install tinky-mouse
```

## 使い方

アプリケーションを `MouseProvider` でラップし、コンポーネント内で `useMouse` フックを使用します。

### 1. プロバイダーのセットアップ

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

### 2. イベントのリスニング

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

## API リファレンス

### `MouseProvider`

マウス追跡を有効にするトップレベルのコンポーネントです。

| プロパティ           | 型          | 説明                                                  |
| -------------------- | ----------- | ----------------------------------------------------- |
| `children`           | `ReactNode` | 子コンポーネント。                                    |
| `mouseEventsEnabled` | `boolean`   | マウス追跡を有効にするかどうか。デフォルト: `false`。 |

### `useMouse(handler, options)`

マウスイベントをサブスクライブするためのフックです。

| 引数      | 型                            | 説明                                               |
| --------- | ----------------------------- | -------------------------------------------------- |
| `handler` | `(event: MouseEvent) => void` | マウスイベントのコールバック関数。                 |
| `options` | `{ isActive?: boolean }`      | オプション設定。`isActive` のデフォルトは `true`。 |

### `MouseEvent` オブジェクト

```ts
interface MouseEvent {
  name: MouseEventName; // 'left-press', 'scroll-up', 'move' など
  col: number; // 列 (x)
  row: number; // 行 (y)
  shift: boolean; // Shift キーが押されているか
  meta: boolean; // Meta/Alt キーが押されているか
  ctrl: boolean; // Ctrl キーが押されているか
  button: "left" | "middle" | "right" | "none";
}
```

## ライセンス

Apache-2.0
