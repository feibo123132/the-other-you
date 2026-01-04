I have incorporated the requirements for **Persistence** and **Task List Modal**.

**Revised Implementation Plan:**

1.  **Update Data Structures (`src/types/transform.ts`)**:
    *   Add `originalImageUrl: string` (Base64) to `GenerationTask` to support persistence (since `File` objects cannot be saved to `localStorage`).
    *   Add `completedAt: number` to track completion time.
    *   Add `progress: number` and `progressMessage: string` to the task object itself for list display.

2.  **Create `GenerationContext` (`src/context/GenerationContext.tsx`)**:
    *   **State**: `tasks` array.
    *   **Persistence**:
        *   On mount: Load tasks from `localStorage`. Restart monitoring for any tasks still in 'processing' status.
        *   On change: Save `tasks` to `localStorage`.
    *   **Logic**:
        *   `startTask`: Converts image to Base64, creates task, saves to state, and starts monitoring.
        *   `monitorTask`: Handles `subscribeProgress` (SSE) and polling `fetchResult`.

3.  **Create `TaskListModal` Component (`src/components/TaskListModal/index.tsx`)**:
    *   A popup showing all background tasks.
    *   Displays thumbnail, status (Processing/Completed), and Progress Bar.
    *   Clicking a task navigates to `/result?id={taskId}`.

4.  **Update `Home` Page**:
    *   Add "Background Tasks" button to header.
        *   **Badge**: Shows "Generating" count or "Completed" (if < 5s ago).
        *   **Action**: Opens `TaskListModal`.
    *   Update "Start" button to call `startTask` and **stay on the current page**.

5.  **Update `Result` Page**:
    *   Modify to read `taskId` from URL query parameters.
    *   Fetch the specific task from `GenerationContext`.
    *   If no ID provided, prompt to select a task.

6.  **Update `App.tsx` / `main.tsx`**:
    *   Wrap the application with `GenerationProvider`.

I will now proceed with these changes, starting with the types and context.