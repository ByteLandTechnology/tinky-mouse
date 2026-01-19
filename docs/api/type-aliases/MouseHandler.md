[**tinky**](../README.md)

---

[tinky](../globals.md) / MouseHandler

# Type Alias: MouseHandler()

> **MouseHandler** = (`event`) => `boolean` \| `undefined`

Function signature for handling mouse events.

## Parameters

### event

[`MouseEvent`](../interfaces/MouseEvent.md)

The parsed mouse event.

## Returns

`boolean` \| `undefined`

`boolean` or `undefined`. If it returns `true`, it might indicate the event was handled (depending on consumer logic), but commonly used for side effects.
