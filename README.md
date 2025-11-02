# NCS Style Audio Visualizer

An immersive, NCS-inspired audio visualizer built with a decoupled vanilla Three.js renderer, managed by a React-based UI. This project follows the System Prompt v10 guidelines for architecture, styling, and componentization, including the #MP (Meta Prototype) panel-based layout.

Upload an audio file to experience a dynamic visual spectacle that reacts to your music in real-time.

## Features

-   **Decoupled Vanilla Three.js Renderer:** All 3D rendering logic is handled by a standalone Three.js class, completely separate from React's render cycle for optimal performance.
-   **Dynamic 3D Visualization:** A particle sphere that pulses and distorts based on audio frequency and loudness.
-   **Custom GLSL Shaders:** Advanced shaders for particle displacement, fluid motion effects (FBM), and color intensity.
-   **Meta Prototype UI:** A responsive, collapsible three-panel layout (Code, Controls, Console) for managing the application state and properties.
-   **Reactive UI:** Built with React and Framer Motion for a fluid user experience.
-   **Advanced Styling:** Implements a CSS-in-JS themeable design system based on semantic design tokens.
-   **Light & Dark Modes:** Easily switch between themes.

## Project Structure

```
.
├── index.html
├── index.tsx
├── App.tsx
├── importmap.js
├── metadata.json
├── README.md
├── noteBook.md
├── bugReport.md
├── three/
│   └── Visualizer.ts
├── components/
│   ├── Core/
│   │   ├── Button/
│   │   └── Icon/
│   ├── Layout/
│   │   └── MetaPrototypeLayout.tsx
│   ├── Package/
│   │   ├── CodePanel/
│   │   ├── ConsolePanel/
│   │   └── ControlPanel/
│   ├── Page/
│   │   └── HomePage/
│   └── Section/
│       └── AudioVisualizer/
└── styles/
    ├── designTokens.ts
    ├── GlobalStyles.tsx
    └── theme.ts
```

*Note: The `/Asset` folder structure (with subfolders for Font, Model, Video, Image, SVG) is specified by the prompt but cannot be created as empty directories in this environment. In a standard project setup, these folders would exist at the root level.*
