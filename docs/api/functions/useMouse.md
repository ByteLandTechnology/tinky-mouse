[**tinky**](../README.md)

---

[tinky](../globals.md) / useMouse

# Function: useMouse()

> **useMouse**(`handler`, `options`): `void`

Hook to subscribe to mouse events.

## Parameters

### handler

[`MouseHandler`](../type-aliases/MouseHandler.md)

The function to call when a mouse event occurs.

### options

Configuration options.

#### isActive?

`boolean` = `true`

Whether the subscription is active. Defaults to `true`.

## Returns

`void`

## Example

```tsx
useMouse((event) => {
  if (event.name === "left-press") {
    console.log("Clicked at", event.col, event.row);
  }
});
```
