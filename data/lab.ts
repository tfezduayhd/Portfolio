import { LabItem } from "@/types";

export const labItems: LabItem[] = [
  {
    slug: "ascii-image-studio",
    title: "ASCII Art & Media Generator",
    description:
      "Highly performant image & video to ASCII art generator with real-time Canvas rendering, colour mode, customisable character sets, animation controls, and export to PNG, WebP, GIF & MP4.",
    tags: ["Tool", "ASCII", "Canvas", "Animation", "Export", "Video"],
    component: "AsciiImageStudio",
    year: 2026,
  },
  {
    slug: "kanban-board",
    title: "Kanban Board",
    description:
      "Production-grade interactive board with drag-and-drop, card creation, priority badges, inline editing, and smooth state handling without external dependencies.",
    tags: ["Tool", "Productivity", "React", "Drag & Drop"],
    component: "KanbanBoard",
    year: 2025,
  },
  {
    slug: "color-palette-generator",
    title: "Color Palette Generator",
    description: "Advanced palette studio with harmony modes, tuning controls, and design-ready color token export.",
    tags: ["Tool", "Color", "Design System", "Front-End"],
    component: "ColorPaletteGenerator",
    year: 2024,
  },
  {
    slug: "css-animation-playground",
    title: "CSS Animation Playground",
    description:
      "Advanced motion playground to design, tune, and preview CSS keyframe animations in real time with immediate visual feedback.",
    tags: ["CSS", "Animation", "Experiment"],
    component: "CssAnimationPlayground",
    year: 2024,
  },
  {
    slug: "typography-tester",
    title: "Typography Tester",
    description:
      "Design-focused typography workspace to evaluate font pairings, hierarchy scales, spacing rhythm, and line-heights directly in the browser.",
    tags: ["Typography", "Tool", "Front-End"],
    component: "TypographyTester",
    year: 2023,
  },
  {
    slug: "pomodoro-timer",
    title: "Pomodoro Timer",
    description:
      "Complete productivity timer with focus sessions, short and long breaks, session tracking, and clear interaction states for daily deep-work routines.",
    tags: ["Productivity", "Tool", "React"],
    component: "PomodoroTimer",
    year: 2025,
  },
  {
    slug: "markdown-previewer",
    title: "Markdown Previewer",
    description:
      "Developer-friendly writing studio with side-by-side Markdown editing, live HTML rendering, and a custom zero-dependency parser for precise output control.",
    tags: ["Tool", "Markdown", "Front-End"],
    component: "MarkdownPreviewer",
    year: 2025,
  },
];
