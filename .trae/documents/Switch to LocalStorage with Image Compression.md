I will implement the robust persistence strategy as requested.

**Plan:**

1.  **Modify `src/hooks/useImageUpload.ts`**:
    *   Change storage to `localStorage` with key `THE_OTHER_YOU_DRAFT_IMAGES`.
    *   In `saveImagesToStorage`:
        *   Iterate through the files.
        *   **Compress** each file using `compressImage` (target 1024x1024, quality 0.8) to reduce size.
        *   Convert compressed files to Base64.
        *   Wrap `localStorage.setItem` in a `try-catch` block.
        *   If `QuotaExceededError` occurs, catch it, log a warning, and set the `error` state (which will show in the UI) with a message like "空间不足，图片保存失败".
    *   In `useEffect` (init):
        *   Load from `localStorage`.
        *   Reconstruct `File` objects from Base64.
        *   Generate new `previewUrls` using `URL.createObjectURL`.
        *   Update state.

2.  **Modify `src/pages/Home/index.tsx`**:
    *   Change storage to `localStorage`.
    *   Use keys `THE_OTHER_YOU_DRAFT_PROMPT` and `THE_OTHER_YOU_DRAFT_STYLE`.
    *   Keep the logic for saving/restoring prompt and style simple (text data is small and unlikely to fail, but I will wrap in try-catch just in case).

This ensures data survives on mobile/desktop restarts while mitigating storage limit issues.