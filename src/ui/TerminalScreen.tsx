import type { JSX } from "react";
import type { TerminalScreenModel } from "../core/applications/screen";
import "./TerminalScreen.css";

export interface TerminalScreenProps {
  readonly model: TerminalScreenModel;
}

export function TerminalScreen({ model }: TerminalScreenProps): JSX.Element {
  return (
    <div className="terminal-screen" role="region" aria-label="Terminal screen">
      {model.lines.map((line, lineIdx) => {
        if (line.kind === "rule") {
          return <div key={lineIdx} className="terminal-rule" aria-hidden="true" />;
        }
        if (line.kind === "footer") {
          return (
            <div key={lineIdx} className="terminal-footer">
              {line.spans.map((span, spanIdx) => (
                <span key={spanIdx} className={`term-span term-${span.style}`}>
                  {span.text}
                </span>
              ))}
            </div>
          );
        }
        if (line.kind === "user") {
          return (
            <div key={lineIdx} className="terminal-user-line">
              {line.spans.map((span, spanIdx) => (
                <span key={spanIdx} className={`term-span term-${span.style}`}>
                  {span.text}
                </span>
              ))}
            </div>
          );
        }
        if (line.kind === "blank") {
          return <div key={lineIdx} className="terminal-blank-line" aria-hidden="true" />;
        }
        return (
          <div key={lineIdx} className={`terminal-line terminal-${line.kind ?? "plain"}`}>
            {line.spans.map((span, spanIdx) => (
              <span key={spanIdx} className={`term-span term-${span.style}`}>
                {span.text}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
