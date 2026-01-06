I will implement state persistence for the images, selected style, and custom prompt so they remain available after a page reload or navigation, unless manually cleared.

**Plan:**

1.  **Modify `src/hooks/useImageUpload.ts`**:
    *   Implement logic to load images from `sessionStorage` (as Data URLs) on initialization.
    *   Update `handleImageSelect` to save selected images to `sessionStorage` (converting File to Base64/Data URL).
    *   Update `handleImageRemove` and `clearImages` to update/clear `sessionStorage`.
    *   Note: Since `File` objects cannot be directly stored, we will store them as Base64 strings.

2.  **Modify `src/pages/Home/index.tsx`**:
    *   Implement `useEffect` to save `customPrompt` and `selectedOption` (ID) to `sessionStorage` whenever they change.
    *   Initialize `customPrompt` and `selectedOption` state from `sessionStorage` on component mount.

This ensures that the user's inputs are preserved across sessions until explicitly removed.