I will implement the "Style Universe" page using React Flow as requested.

**Plan:**

1.  **Install Dependencies**:
    *   `reactflow` (Core library)
    *   `dagre` (Layout algorithm)
    *   `@types/dagre` (Type definitions)

2.  **Create Custom Node Component (`src/pages/StyleUniverse/ImageNode.tsx`)**:
    *   Implement a circular image node with a label.
    *   Support visual distinction for the "Center Node" (User Source Image) vs. "Style Nodes" (larger size, highlighted border).
    *   Add Framer Motion animations for smooth appearance.

3.  **Implement Layout Logic (`src/pages/StyleUniverse/layout.ts`)**:
    *   Create a utility function using `dagre` to automatically calculate node positions in a Left-to-Right (LR) tree structure.

4.  **Create Main Page (`src/pages/StyleUniverse/index.tsx`)**:
    *   Initialize the React Flow canvas with `Background`, `Controls`, and `MiniMap`.
    *   Construct mock data representing "One Source -> Multiple Styles".
    *   Integrate the custom node and layout logic.

5.  **Update Routing (`src/App.tsx`)**:
    *   Add the `/style-universe` route.

6.  **Add Navigation Entry (`src/pages/Home/index.tsx`)**:
    *   Add a "风格宇宙" button in the header area (next to "作品展示栏") for easy access.