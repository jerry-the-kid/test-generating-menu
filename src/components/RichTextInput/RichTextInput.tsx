import { useEffect, useRef, useState, useMemo } from "react";
import { useEditor, EditorContent, generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent, Editor } from "@tiptap/react";
import "./RichTextInput.css";

export const SHARED_EXTENSIONS = [
  StarterKit.configure({
    blockquote: false,
    bulletList: false,
    orderedList: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    listItem: false,
  }),
  Underline,
  TextStyle,
  FontSize,
  TextAlign.configure({
    types: ["paragraph"],
    alignments: ["left", "center", "right"],
  }),
];

export interface RichTextInputProps {
  content: JSONContent;
  onUpdate: (json: JSONContent) => void;
  placeholder?: string;
  className?: string;
  singleLine?: boolean;
  style?: React.CSSProperties;
  /** Render the formatting toolbar docked above the editor and always visible. */
  alwaysShowToolbar?: boolean;
}

export const FONT_SIZES = [
  "10", "12", "13", "14", "16", "18", "20", "22", "24",
  "28", "32", "36", "38", "42", "48", "56", "64", "72",
];

const TOOLBAR_BTN_BASE =
  "bg-transparent border border-transparent rounded cursor-pointer px-1.5 py-0.5 text-[13px] text-gray-700 min-w-[26px] h-[26px] flex items-center justify-center hover:bg-slate-100";
const TOOLBAR_BTN_ACTIVE =
  "bg-sky-100 border-sky-300 text-sky-700 border rounded cursor-pointer px-1.5 py-0.5 text-[13px] min-w-[26px] h-[26px] flex items-center justify-center";

function ToolbarButtons({ editor, docked = false }: { editor: Editor; docked?: boolean }) {
  const currentSize =
    editor.getAttributes("textStyle")?.fontSize?.replace("px", "") ?? "14";

  const btn = (active: boolean) => (active ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN_BASE);

  const containerClass = docked
    ? "flex flex-wrap items-center gap-0.5 bg-slate-50 border border-slate-200 border-b-0 rounded-t-md px-1.5 py-1"
    : "absolute bottom-full left-0 flex items-center gap-0.5 bg-white border border-slate-200 rounded-md px-1.5 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.12)] z-[100] whitespace-nowrap mb-1"

  return (
    <div
      className={containerClass}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        className={btn(editor.isActive("bold"))}
        title="Bold"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        className={btn(editor.isActive("italic"))}
        title="Italic"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
        className={btn(editor.isActive("underline"))}
        title="Underline"
      >
        <u>U</u>
      </button>

      <span className="w-px h-[18px] bg-slate-200 mx-1" />

      <div className="max-h-[50px] overflow-y-scroll">
        <select
          className="border border-slate-200 rounded px-1 py-0.5 text-xs bg-white cursor-pointer h-[26px]"
          value={currentSize}
          onChange={(e) => {
            editor.chain().focus().setMark("textStyle", { fontSize: `${e.target.value}px` }).run();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onBlur={() => editor.commands.focus()}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
      </div>

      <span className="w-px h-[18px] bg-slate-200 mx-1" />

      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("left").run(); }}
        className={btn(editor.isActive({ textAlign: "left" }))}
        title="Align left"
      >
        ≡
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("center").run(); }}
        className={btn(editor.isActive({ textAlign: "center" }))}
        title="Align center"
      >
        ≡
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("right").run(); }}
        className={btn(editor.isActive({ textAlign: "right" }))}
        title="Align right"
      >
        ≡
      </button>
    </div>
  );
}

export function RichTextInput({
  content,
  onUpdate,
  placeholder,
  className,
  singleLine = false,
  style,
  alwaysShowToolbar = false,
}: RichTextInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef(content);
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      ...SHARED_EXTENSIONS,
      ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `rich-text-editor ${className ?? ""}`,
        ...(style && {
          style: Object.entries(style)
            .map(
              ([k, v]) =>
                `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`,
            )
            .join(";"),
        }),
      },
      ...(singleLine && {
        handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
          if (event.key === "Enter") {
            event.preventDefault();
            return true;
          }
          return false;
        },
      }),
    },
    onFocus: () => setIsFocused(true),
    onBlur: ({ editor: ed, event }) => {
      const relatedTarget = event.relatedTarget as Node | null;
      if (wrapperRef.current?.contains(relatedTarget)) return;
      setIsFocused(false);
      lastContentRef.current = ed.getJSON();
      onUpdate(ed.getJSON());
    },
  });

  // Sync external content changes (e.g. undo) when editor is not focused
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    if (JSON.stringify(lastContentRef.current) !== JSON.stringify(content)) {
      lastContentRef.current = content;
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (alwaysShowToolbar) {
    return (
      <div
        ref={wrapperRef}
        className="w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {editor && <ToolbarButtons editor={editor} docked />}
        <div className="border border-slate-200 rounded-b-md bg-white px-2 py-1.5">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {isFocused && editor && <ToolbarButtons editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Read-only static renderer (used by canvas preview) ─────────────────

export function RichTextDisplay({
  content,
  className,
  placeholder,
  style,
}: Readonly<{
  content: JSONContent
  className?: string
  placeholder?: string
  style?: React.CSSProperties
}>) {
  const html = useMemo(() => {
    try {
      return generateHTML(content, SHARED_EXTENSIONS)
    } catch {
      return ""
    }
  }, [content])

  const isEmpty = !html || html === "<p></p>"

  return (
    <div className={`relative w-full rich-text-preview ${className ?? ""}`} style={style}>
      {isEmpty ? (
        <div className="rich-text-editor rich-text-empty">
          <p className="rt-placeholder">{placeholder}</p>
        </div>
      ) : (
        <div className="rich-text-editor" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}

