"use client";

import ColorPaletteGenerator from "./ColorPaletteGenerator";
import CssAnimationPlayground from "./CssAnimationPlayground";
import TypographyTester from "./TypographyTester";
import PomodoroTimer from "./PomodoroTimer";
import MarkdownPreviewer from "./MarkdownPreviewer";
import KanbanBoard from "./KanbanBoard";
import AsciiImageStudio from "./AsciiImageStudio";

const COMPONENT_MAP: Record<string, React.ComponentType> = {
  ColorPaletteGenerator,
  CssAnimationPlayground,
  TypographyTester,
  PomodoroTimer,
  MarkdownPreviewer,
  KanbanBoard,
  AsciiImageStudio,
};

interface Props {
  name: string;
}

export default function LabComponentRenderer({ name }: Props) {
  const Component = COMPONENT_MAP[name];
  if (!Component) return null;
  return <Component />;
}
