import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-invert prose max-w-none text-parchment/85 prose-headings:font-display prose-headings:text-parchment prose-a:text-gold prose-strong:text-parchment prose-blockquote:border-gold prose-li:marker:text-gold">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}