"use client";

import { useRef,useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escreva seu conteúdo aqui...",
  minHeight = 300,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormatting = (formatType: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = "";
    let newValue = "";

    switch (formatType) {
      case "bold":
        newText = `**${selectedText}**`;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        break;
      case "heading":
        newText = `## ${selectedText}`;
        break;
      case "list":
        newText = `- ${selectedText}`;
        break;
      case "link":
        const url = prompt("Digite a URL:");
        if (url) {
          newText = `[${selectedText || "link"}](${url})`;
        } else {
          return;
        }
        break;
      default:
        return;
    }

    newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Restaurar foco e posição do cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + newText.length,
        start + newText.length,
      );
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl font-bold text-white mb-2">$1</h2>',
      )
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-[#C2A537] underline" target="_blank">$1</a>',
      )
      .replace(/\n/g, "<br>");
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-t-md border border-slate-600 bg-slate-800/50 p-2">
        <button
          type="button"
          onClick={() => handleFormatting("bold")}
          className="rounded bg-slate-700 px-3 py-1 text-sm font-bold text-white hover:bg-slate-600"
          title="Negrito"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => handleFormatting("italic")}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-white italic hover:bg-slate-600"
          title="Itálico"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => handleFormatting("heading")}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600"
          title="Título"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => handleFormatting("list")}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600"
          title="Lista"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => handleFormatting("link")}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600"
          title="Link"
        >
          🔗
        </button>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`rounded px-3 py-1 text-sm ${
              !isPreview
                ? "bg-[#C2A537] text-black"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`rounded px-3 py-1 text-sm ${
              isPreview
                ? "bg-[#C2A537] text-black"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      {isPreview ? (
        <div
          className="prose prose-invert w-full max-w-none rounded-b-md border border-slate-600 bg-slate-800/50 p-3 text-white"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-b-md border border-slate-600 bg-slate-800/50 p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
          style={{ minHeight }}
        />
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500">
        Dicas: Use **texto** para negrito, *texto* para itálico, ## para
        títulos, - para listas
      </div>
    </div>
  );
}
