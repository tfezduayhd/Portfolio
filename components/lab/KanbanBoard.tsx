"use client";

import { useState, useRef, useCallback } from "react";

type Priority = "low" | "medium" | "high";

interface Card {
  id: string;
  title: string;
  priority: Priority;
  label: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const LABEL_STYLES: Record<string, string> = {
  Design: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Dev: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Research: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Docs: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  DevOps: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  UX: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  QA: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const DEFAULT_LABEL_STYLE = "bg-neutral-700/50 text-neutral-300 border-neutral-600";

const INITIAL_COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "#6366f1",
    cards: [
      { id: "c1", title: "Design new landing page", priority: "high", label: "Design" },
      { id: "c2", title: "Write user documentation", priority: "medium", label: "Docs" },
      { id: "c3", title: "Set up CI/CD pipeline", priority: "low", label: "DevOps" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "#f59e0b",
    cards: [
      { id: "c4", title: "Refactor authentication flow", priority: "high", label: "Dev" },
      { id: "c5", title: "Conduct user interviews", priority: "medium", label: "Research" },
    ],
  },
  {
    id: "review",
    title: "In Review",
    color: "#8b5cf6",
    cards: [
      { id: "c6", title: "A/B test new onboarding", priority: "medium", label: "UX" },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "#10b981",
    cards: [
      { id: "c7", title: "Update color system tokens", priority: "low", label: "Design" },
      { id: "c8", title: "Fix mobile navigation bug", priority: "high", label: "Dev" },
    ],
  },
];

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface NewCardForm {
  title: string;
  priority: Priority;
  label: string;
}

const AVAILABLE_LABELS = ["Design", "Dev", "Research", "Docs", "DevOps", "UX", "QA"];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [form, setForm] = useState<NewCardForm>({ title: "", priority: "medium", label: "Dev" });
  const [editingCard, setEditingCard] = useState<{ colId: string; cardId: string } | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Drag state
  const dragging = useRef<{ colId: string; cardId: string } | null>(null);
  const dragOverCol = useRef<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // ---------- drag handlers ----------
  const onDragStart = useCallback((colId: string, cardId: string) => {
    dragging.current = { colId, cardId };
  }, []);

  const onDragOverCol = useCallback((colId: string, e: React.DragEvent) => {
    e.preventDefault();
    dragOverCol.current = colId;
    setDragOverColId(colId);
  }, []);

  const onDragLeaveCol = useCallback(() => {
    dragOverCol.current = null;
    setDragOverColId(null);
  }, []);

  const onDropCol = useCallback(
    (targetColId: string) => {
      if (!dragging.current) return;
      const { colId: srcColId, cardId } = dragging.current;
      if (srcColId === targetColId) {
        dragging.current = null;
        setDragOverColId(null);
        return;
      }
      setColumns((prev) => {
        const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));
        const srcCol = next.find((c) => c.id === srcColId);
        const tgtCol = next.find((c) => c.id === targetColId);
        if (!srcCol || !tgtCol) return prev;
        const cardIndex = srcCol.cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) return prev;
        const [card] = srcCol.cards.splice(cardIndex, 1);
        tgtCol.cards.push(card);
        return next;
      });
      dragging.current = null;
      setDragOverColId(null);
    },
    []
  );

  // ---------- add card ----------
  const openAddCard = (colId: string) => {
    setAddingTo(colId);
    setForm({ title: "", priority: "medium", label: "Dev" });
  };

  const submitNewCard = (colId: string) => {
    if (!form.title.trim()) return;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, cards: [...col.cards, { id: uid(), ...form, title: form.title.trim() }] }
          : col
      )
    );
    setAddingTo(null);
  };

  // ---------- delete card ----------
  const deleteCard = (colId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
      )
    );
  };

  // ---------- inline edit ----------
  const startEdit = (colId: string, card: Card) => {
    setEditingCard({ colId, cardId: card.id });
    setEditTitle(card.title);
  };

  const commitEdit = () => {
    if (!editingCard) return;
    const { colId, cardId } = editingCard;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId
          ? {
              ...col,
              cards: col.cards.map((c) =>
                c.id === cardId ? { ...c, title: editTitle.trim() || c.title } : c
              ),
            }
          : col
      )
    );
    setEditingCard(null);
  };

  const totalCards = columns.reduce((s, c) => s + c.cards.length, 0);
  const doneCount = columns.find((c) => c.id === "done")?.cards.length ?? 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300">
          📋 <span className="font-semibold text-neutral-100">{totalCards}</span> tasks total
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          ✅ <span className="font-semibold">{doneCount}</span> completed
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          🔄 <span className="font-semibold">{totalCards - doneCount}</span> in progress
        </span>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => onDragOverCol(col.id, e)}
            onDragLeave={onDragLeaveCol}
            onDrop={() => onDropCol(col.id)}
            className={`flex flex-col rounded-2xl border transition-colors min-h-[280px] ${
              dragOverColId === col.id
                ? "border-indigo-500/60 bg-indigo-500/5"
                : "border-neutral-800 bg-neutral-900/40"
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="font-semibold text-neutral-200 text-sm">{col.title}</h3>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: col.color + "22", color: col.color }}
                >
                  {col.cards.length}
                </span>
              </div>
              <button
                onClick={() => openAddCard(col.id)}
                className="text-neutral-500 hover:text-neutral-200 transition-colors text-lg leading-none"
                title="Add card"
              >
                +
              </button>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 px-3 pb-3 flex-1">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => onDragStart(col.id, card.id)}
                  className="group relative bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/60 hover:border-neutral-600 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md"
                >
                  {/* Edit / Delete controls */}
                  <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                    <button
                      onClick={() => startEdit(col.id, card)}
                      className="text-neutral-500 hover:text-indigo-400 transition-colors text-xs p-0.5"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteCard(col.id, card.id)}
                      className="text-neutral-500 hover:text-red-400 transition-colors text-xs p-0.5"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Title */}
                  {editingCard?.colId === col.id && editingCard?.cardId === card.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingCard(null);
                      }}
                      className="w-full bg-neutral-700 text-neutral-100 text-sm rounded-md px-2 py-1 outline-none border border-indigo-500/60 mb-2"
                    />
                  ) : (
                    <p className="text-sm text-neutral-200 font-medium leading-snug mb-2 pr-12">
                      {card.title}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        PRIORITY_STYLES[card.priority]
                      }`}
                    >
                      {PRIORITY_LABELS[card.priority]}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        LABEL_STYLES[card.label] ?? DEFAULT_LABEL_STYLE
                      }`}
                    >
                      {card.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* Add card inline form */}
              {addingTo === col.id ? (
                <div className="bg-neutral-800 border border-indigo-500/50 rounded-xl p-3 flex flex-col gap-2">
                  <input
                    autoFocus
                    placeholder="Card title…"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitNewCard(col.id);
                      if (e.key === "Escape") setAddingTo(null);
                    }}
                    className="w-full bg-neutral-700 text-neutral-100 text-sm rounded-md px-2 py-1.5 outline-none border border-neutral-600 focus:border-indigo-500/70 placeholder-neutral-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                      className="flex-1 bg-neutral-700 text-neutral-200 text-xs rounded-md px-2 py-1.5 outline-none border border-neutral-600"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <select
                      value={form.label}
                      onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                      className="flex-1 bg-neutral-700 text-neutral-200 text-xs rounded-md px-2 py-1.5 outline-none border border-neutral-600"
                    >
                      {AVAILABLE_LABELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitNewCard(col.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      Add card
                    </button>
                    <button
                      onClick={() => setAddingTo(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openAddCard(col.id)}
                  className="mt-1 w-full py-2 rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 text-neutral-600 hover:text-neutral-400 text-sm transition-colors"
                >
                  + Add card
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-600 text-center">
        Drag &amp; drop cards between columns · Click <span className="font-mono">+</span> to add · Hover a card to edit or delete
      </p>
    </div>
  );
}
