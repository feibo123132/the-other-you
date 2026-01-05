I have identified the root cause of both issues. They stem from the touch event handling logic in `src/components/StyleSelector/index.tsx`.

**Root Cause:**
The `OptionCard` component manually calls `onClick()` inside the `onTouchEnd` handler.
1.  **Issue 1 (Flashing State):** On mobile devices, a tap triggers both `onTouchEnd` and a simulated mouse `click`. This causes the `onOptionSelect` function to run twice: once selecting the option, and immediately again toggling it off (deselecting it).
2.  **Issue 2 (Ghost Clicks):** `onTouchEnd` fires even when you are scrolling (dragging the finger). Since the code blindly calls `onClick()` inside `onTouchEnd`, simply scrolling the page triggers a selection.

**Fix Plan:**
I will modify `src/components/StyleSelector/index.tsx` to:
*   Remove the `onClick()` call from `handleTouchEnd`.
*   Rely entirely on the standard `onClick` prop for logic, which correctly handles tap interactions and ignores scroll gestures on mobile devices.
*   Keep the visual scaling animation in touch events as purely cosmetic.

This simple change will resolve both the "button resetting" and the "unintended selection during scroll" issues.