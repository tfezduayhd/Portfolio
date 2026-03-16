"use client";

import ColorPaletteGenerator from "./ColorPaletteGenerator";
import CssAnimationPlayground from "./CssAnimationPlayground";
import TypographyTester from "./TypographyTester";
import PomodoroTimer from "./PomodoroTimer";
import MarkdownPreviewer from "./MarkdownPreviewer";
import KanbanBoard from "./KanbanBoard";

const COMPONENT_MAP: Record<string, React.ComponentType> = {
  ColorPaletteGenerator,
  CssAnimationPlayground,
  TypographyTester,
  PomodoroTimer,
  MarkdownPreviewer,
  KanbanBoard,
};

interface Props {
  name: string;
}

export default function LabComponentRenderer({ name }: Props) {
  const Component = COMPONENT_MAP[name];
  if (!Component) return null;
  return <Component />;
}
