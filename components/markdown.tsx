"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div
      className={`prose-invert prose max-w-none text-parchment/90 
        prose-headings:font-display prose-headings:text-parchment prose-headings:font-bold
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-a:text-gold prose-a:underline-offset-4 hover:prose-a:underline
        prose-strong:text-parchment prose-strong:font-semibold
        prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-parchment/80
        prose-code:text-gold prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-white/10
        prose-li:marker:text-gold
        prose-hr:border-white/10 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => {
            const rawSrc = typeof src === "string" ? src : "";
            const rawAlt = typeof alt === "string" ? alt : "";

            const isLeft =
              rawSrc.includes("#left") ||
              rawAlt.toLowerCase().includes("|left") ||
              rawAlt.toLowerCase().includes("#left") ||
              rawAlt.toLowerCase().startsWith("left:");

            const isRight =
              rawSrc.includes("#right") ||
              rawAlt.toLowerCase().includes("|right") ||
              rawAlt.toLowerCase().includes("#right") ||
              rawAlt.toLowerCase().startsWith("right:");

            // Clean the alt text of alignment tags for the caption & screenreaders
            const cleanAlt = rawAlt
              .replace(/\|(left|right|center)/gi, "")
              .replace(/#(left|right|center)/gi, "")
              .replace(/^(left|right|center):/gi, "")
              .trim();

            const cleanSrc = rawSrc.replace(/#(left|right|center)/gi, "");

            if (isLeft) {
              return (
                <figure className="float-left mr-6 mb-4 mt-2 max-w-[280px] sm:max-w-[340px] clear-left group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cleanSrc}
                    alt={cleanAlt}
                    className="m-0 rounded-xl border border-white/15 bg-black/40 object-cover shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {cleanAlt && (
                    <figcaption className="mt-2 text-center text-[11px] italic tracking-wide text-parchment/50">
                      {cleanAlt}
                    </figcaption>
                  )}
                </figure>
              );
            }

            if (isRight) {
              return (
                <figure className="float-right ml-6 mb-4 mt-2 max-w-[280px] sm:max-w-[340px] clear-right group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cleanSrc}
                    alt={cleanAlt}
                    className="m-0 rounded-xl border border-white/15 bg-black/40 object-cover shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {cleanAlt && (
                    <figcaption className="mt-2 text-center text-[11px] italic tracking-wide text-parchment/50">
                      {cleanAlt}
                    </figcaption>
                  )}
                </figure>
              );
            }

            return (
              <figure className="my-8 block w-full text-center group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cleanSrc}
                  alt={cleanAlt}
                  className="mx-auto rounded-xl border border-white/15 bg-black/40 object-cover shadow-xl max-h-[500px] w-full"
                />
                {cleanAlt && (
                  <figcaption className="mt-2 text-center text-xs italic text-parchment/50">
                    {cleanAlt}
                  </figcaption>
                )}
              </figure>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
      {/* Clearfix at end of markdown so floating images never spill into comments or footer */}
      <div className="clear-both" />
    </div>
  );
}