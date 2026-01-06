I will fix the issue where the "Start AI Transformation" button is unresponsive when using only a custom prompt, and implement the requested enhancements.

**Plan:**
1.  **Modify `src/pages/Home/index.tsx`**:
    *   Rewrite the `handleGenerate` function to support flexible generation logic.
    *   **Case 1: Style + Custom Prompt**:
        *   Concatenate prompt as `[Custom Prompt], [Style Template]`.
        *   Create a modified style object with label "自定义风格" (Custom Style) so it shows up correctly in the Task List.
    *   **Case 2: Custom Prompt Only**:
        *   Create a dummy `TransformOption` (ID: 'custom', Label: '自定义风格', Icon: '✨').
        *   Pass the custom prompt directly.
    *   **Case 3: Style Only**:
        *   Proceed as before.
    *   Ensure `startTask` receives the correct parameters for all cases.

This will ensure the button works in all scenarios and the Task List displays the appropriate task name as requested.