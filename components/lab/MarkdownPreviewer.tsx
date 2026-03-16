"use client";

import { useState, useMemo } from "react";

// ── Minimal Markdown → HTML parser ─────────────────────────────────────────

function parseMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeLines: string[] = [];

  const closeList = () => {
    if (inUl) { html.push("</ul>"); inUl = false; }
    if (inOl) { html.push("</ol>"); inOl = false; }
  };

  const inline = (text: string) =>
    text
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#818cf8;text-decoration:underline">$1</a>')
      .replace(/`([^`]+)`/g, '<code style="background:#1e1e2e;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:.875em">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>");

  for (const raw of lines) {
    const line = raw;

    // Fenced code block toggle
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre style="background:#0d0d0d;padding:16px;border-radius:8px;overflow-x:auto;border:1px solid #262626"><code style="font-family:monospace;font-size:.875em;color:#6ee7b7">${codeLines.join("\n")}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeLines.push(line.replace(/</g, "&lt;").replace(/>/g, "&gt;")); continue; }

    // Headings
    const h6 = line.match(/^#{6}\s+(.*)/); if (h6) { closeList(); html.push(`<h6 style="font-size:.875em;font-weight:700;color:#a3a3a3;margin:8px 0">${inline(h6[1])}</h6>`); continue; }
    const h5 = line.match(/^#{5}\s+(.*)/); if (h5) { closeList(); html.push(`<h5 style="font-size:1em;font-weight:700;color:#a3a3a3;margin:8px 0">${inline(h5[1])}</h5>`); continue; }
    const h4 = line.match(/^#{4}\s+(.*)/); if (h4) { closeList(); html.push(`<h4 style="font-size:1.1em;font-weight:700;color:#d4d4d4;margin:10px 0">${inline(h4[1])}</h4>`); continue; }
    const h3 = line.match(/^#{3}\s+(.*)/); if (h3) { closeList(); html.push(`<h3 style="font-size:1.25em;font-weight:700;color:#e5e5e5;margin:12px 0">${inline(h3[1])}</h3>`); continue; }
    const h2 = line.match(/^#{2}\s+(.*)/); if (h2) { closeList(); html.push(`<h2 style="font-size:1.5em;font-weight:700;color:#f5f5f5;margin:16px 0 8px">${inline(h2[1])}</h2>`); continue; }
    const h1 = line.match(/^#{1}\s+(.*)/); if (h1) { closeList(); html.push(`<h1 style="font-size:2em;font-weight:800;color:#fff;margin:20px 0 10px">${inline(h1[1])}</h1>`); continue; }

    // Horizontal rule
    if (/^---+$|^\*\*\*+$/.test(line.trim())) { closeList(); html.push('<hr style="border:none;border-top:1px solid #404040;margin:16px 0" />'); continue; }

    // Blockquote
    const bq = line.match(/^>\s?(.*)/); if (bq) { closeList(); html.push(`<blockquote style="border-left:3px solid #6366f1;padding-left:12px;margin:8px 0;color:#a3a3a3">${inline(bq[1])}</blockquote>`); continue; }

    // Ordered list
    const ol = line.match(/^\d+\.\s+(.*)/);
    if (ol) {
      if (inUl) { html.push("</ul>"); inUl = false; }
      if (!inOl) { html.push('<ol style="padding-left:24px;margin:8px 0;list-style:decimal;color:#d4d4d4">'); inOl = true; }
      html.push(`<li style="margin:4px 0">${inline(ol[1])}</li>`);
      continue;
    }

    // Unordered list
    const ul = line.match(/^[-*+]\s+(.*)/);
    if (ul) {
      if (inOl) { html.push("</ol>"); inOl = false; }
      if (!inUl) { html.push('<ul style="padding-left:24px;margin:8px 0;list-style:disc;color:#d4d4d4">'); inUl = true; }
      html.push(`<li style="margin:4px 0">${inline(ul[1])}</li>`);
      continue;
    }

    closeList();

    // Blank line → paragraph break
    if (line.trim() === "") { html.push('<div style="height:8px"></div>'); continue; }

    // Normal paragraph
    html.push(`<p style="color:#d4d4d4;line-height:1.7;margin:4px 0">${inline(line)}</p>`);
  }
  closeList();
  if (inCode) html.push(`<pre style="background:#0d0d0d;padding:16px;border-radius:8px"><code style="font-family:monospace;font-size:.875em;color:#6ee7b7">${codeLines.join("\n")}</code></pre>`);
  return html.join("\n");
}

// ── Default content ───────────────────────────────────────────────────────────

const INITIAL = `# Markdown Previewer

Type on the **left**, see live HTML on the **right**.

## Features

- **Bold**, *italic*, ~~strikethrough~~
- \`inline code\` and fenced blocks
- [Links](https://example.com)
- Lists & blockquotes

> "Simplicity is the soul of efficiency." — Austin Freeman

## Code block

\`\`\`
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

---

1. First item
2. Second item
3. Third item
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarkdownPreviewer() {
  const [md, setMd] = useState(INITIAL);
  const html = useMemo(() => parseMarkdown(md), [md]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-neutral-500">
        Supports: headings, bold, italic, strikethrough, inline code, fenced code blocks, links, images, lists, blockquotes, horizontal rules.
      </p>
      <div className="grid sm:grid-cols-2 gap-3" style={{ minHeight: "480px" }}>
        {/* Editor */}
        <div className="flex flex-col">
          <div className="px-3 py-1.5 rounded-t-xl bg-neutral-800 border border-neutral-700 border-b-0 text-xs text-neutral-400 font-medium">
            Markdown
          </div>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="flex-1 px-4 py-3 rounded-b-xl bg-neutral-950 border border-neutral-700 text-neutral-300 font-mono text-sm focus:outline-none focus:border-indigo-500 resize-none"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div className="px-3 py-1.5 rounded-t-xl bg-neutral-800 border border-neutral-700 border-b-0 text-xs text-neutral-400 font-medium">
            Preview
          </div>
          <div
            className="flex-1 px-5 py-4 rounded-b-xl bg-neutral-950 border border-neutral-700 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
