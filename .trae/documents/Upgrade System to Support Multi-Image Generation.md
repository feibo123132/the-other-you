I have analyzed the backend code (`server/index.js`) and the frontend configuration.

**Backend Analysis (`server/index.js`):**
-   The backend uses `express` and connects to `visual.volcengineapi.com` (Jimeng/Volcengine API).
-   The key endpoint is `/api/generate`.
-   It accepts `image_urls` in the `submitBody` (line 199), but in the `app.post('/api/generate')` handler (line 273), it only extracts `imageUrl` (singular) from `req.body`.
-   It then constructs `finalImageUrl` (lines 285-299) and pushes it into the queue.
-   The worker (lines 196-203) sends `image_urls: [finalImageUrl]` (an array with one item) to the Volcengine API.

**Frontend Analysis:**
-   `src/pages/Home/index.tsx` only selects *one* image (`const chosen = img1 || img2 || img3;`).
-   `src/config/options.ts` shows the "Mirror Touch" (`celebrity-mirror`) prompt clearly refers to "Image 1" and "Image 2".

**Conclusion:**
The current system is hardcoded for single-image processing. To support the "Mirror Touch" feature (which requires two images), I need to upgrade the entire pipeline to support multiple images.

**Implementation Plan:**

1.  **Backend Upgrade (`server/index.js`)**:
    -   Update `/api/generate` to accept `imageUrls` (array) in addition to `imageUrl`.
    -   Process *all* provided images (upload Base64 to temp host if needed).
    -   Pass the array of processed URLs to the worker queue.
    -   Update the worker to send the full `image_urls` array to the Volcengine API.

2.  **Frontend Upgrade**:
    -   **`src/types/transform.ts`**: Update `GenerationTask` to store `originalImageUrls: string[]` instead of just one string.
    -   **`src/context/GenerationContext.tsx`**: Update `startTask` to accept `File[]`. Convert all files to Base64.
    -   **`src/services/imageProcessor.ts`**: Update `startGeneration` to accept `string[]` and send `{ imageUrls: [...] }` to the backend.
    -   **`src/pages/Home/index.tsx`**: Update `handleGenerate` to collect *all* uploaded images (`[img1, img2, img3]`) and pass them to `startTask`.
    -   **`src/pages/Result/index.tsx`**: Update to display the first image as the "Original" or maybe a grid if multiple are used (for now, showing the first one is acceptable backward compatibility).

This is a full-stack refactor to support multi-image generation. I will start by updating the backend to handle the array.