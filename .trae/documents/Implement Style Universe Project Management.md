I will implement the "Universe Management" feature, transforming the Style Universe from a static demo into a multi-project management tool.

**Plan:**

1.  **State Management (`src/pages/StyleUniverse/store.ts`)**:
    *   Create a Zustand store (`useUniverseStore`) to manage `UniverseProject` data.
    *   Implement `addProject`, `deleteProject`, `setCurrentProject` actions.
    *   Use `localStorage` persistence (key: `STYLE_UNIVERSE_PROJECTS`) to save projects.
    *   Include a default "Demo Project" so the page isn't empty initially.

2.  **Sidebar Component (`src/pages/StyleUniverse/ProjectSidebar.tsx`)**:
    *   Create a slide-out drawer using Framer Motion.
    *   Display a list of projects with thumbnails (Core Image).
    *   Add "Delete" button for each project.
    *   Add a "New Project" button that triggers a file input for uploading a new Core Image.

3.  **Refactor Main Page (`src/pages/StyleUniverse/index.tsx`)**:
    *   Integrate `useUniverseStore`.
    *   Add the "Manage" button (LayoutDashboard icon) in the top-right corner.
    *   Render `ProjectSidebar`.
    *   Update React Flow to render the *current project's* nodes and edges.
    *   **Auto-Layout Logic Update**: When a new project is created (image uploaded), automatically generate the "Center Node" and some placeholder "Style Nodes" (or empty style slots) and apply the `dagre` layout.

This will give you a complete management system where you can switch between different "Style Universes".