import { useEffect, useRef, useState, useMemo } from "react";
import { useEditor, EditorContent, generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent, Editor } from "@tiptap/react";
import "./RichTextInput.css";

const SHARED_EXTENSIONS = [
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
}

const FONT_SIZES = [
  "10",
  "12",
  "13",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "28",
  "32",
  "36",
  "38",
  "42",
  "48",
  "56",
  "64",
  "72",
];

function ToolbarButtons({ editor }: { editor: Editor }) {
  const currentSize =
    editor.getAttributes("textStyle")?.fontSize?.replace("px", "") ?? "14";

  return (
    <div className="rich-text-toolbar" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
        title="Bold"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
        title="Italic"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        className={`toolbar-btn ${editor.isActive("underline") ? "active" : ""}`}
        title="Underline"
      >
        <u>U</u>
      </button>

      <span className="toolbar-sep" />

      <div style={{ maxHeight: '50px', overflowY: 'scroll' }}>
      <select
        className="toolbar-font-size"
        value={currentSize}
        onChange={(e) => {
          editor
            .chain()
            .focus()
            .setMark("textStyle", { fontSize: `${e.target.value}px` })
            .run();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onBlur={() => editor.commands.focus()}
      > 
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}px
          </option>
        ))}
      </select>
      </div>

      <span className="toolbar-sep" />

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("left").run();
        }}
        className={`toolbar-btn ${editor.isActive({ textAlign: "left" }) ? "active" : ""}`}
        title="Align left"
      >
        ≡
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("center").run();
        }}
        className={`toolbar-btn ${editor.isActive({ textAlign: "center" }) ? "active" : ""}`}
        title="Align center"
      >
        ≡
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("right").run();
        }}
        className={`toolbar-btn ${editor.isActive({ textAlign: "right" }) ? "active" : ""}`}
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

  return (
    <div
      ref={wrapperRef}
      className="rich-text-wrapper"
      onClick={(e) => e.stopPropagation()}
    >
      {isFocused && editor && <ToolbarButtons editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Lazy wrapper — renders static HTML until clicked ────────────────────

export function LazyRichTextInput(props: RichTextInputProps) {
  const [isActive, setIsActive] = useState(false);

  const html = useMemo(() => {
    try {
      return generateHTML(props.content, SHARED_EXTENSIONS);
    } catch {
      return "";
    }
  }, [props.content]);

  console.log("Generated HTML:", html);

  if (!isActive) {
    return (
      <div
        className={`rich-text-wrapper rich-text-preview ${props.className ?? ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsActive(true);
        }}
        style={props.style}
      >
        {!(html === "<p></p>") && html ? (
          <div
            className="rich-text-editor"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="rich-text-editor rich-text-empty">
            <p className="rt-placeholder">{props.placeholder}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <RichTextInput
      {...props}
      onUpdate={(json) => {
        props.onUpdate(json);
      }}
    />
  );
}
