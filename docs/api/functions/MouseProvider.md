[**tinky-mouse**](../README.md)

---

[tinky-mouse](../globals.md) / MouseProvider

# Function: MouseProvider()

> **MouseProvider**(`props`): `Element`

Provider component that sets up mouse event listening and distribution.

It enables mouse reporting on mount (if enabled) and disables it on unmount.
It uses the `tinky` `useStdin` hook to read from the input stream.

## Parameters

### props

[`MouseProviderProps`](../interfaces/MouseProviderProps.md)

The component props.

## Returns

`Element`

## Example

```tsx
<MouseProvider mouseEventsEnabled={true}>
  <App />
</MouseProvider>
```
