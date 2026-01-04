Great! Since you've already prepared the images with the correct naming convention (`id.jpg`), I will proceed with updating the code.

**Implementation Plan:**

1.  **Update `src/config/options.ts`**:
    -   I will iterate through the `transformOptions` array.
    -   For every item, I will add the `previewImage` field pointing to `/gallery/{id}.jpg`.
    -   Example change:
        ```typescript
        {
          id: 'ghibli',
          // ...
          previewImage: '/gallery/ghibli.jpg'
        }
        ```

This will link all your gallery items to the local images you provided.