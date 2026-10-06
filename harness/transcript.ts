// The readable transcript of a run: one line per tool call, in order, naming
// where it ran (the main thread or the subagent type of its `Agent` call), the
// tool, a short input and the outcome. The harness provider puts it in the
// run's metadata, where the promptfoo viewer shows it.
import type { ToolCall } from "./hook.ts";

const INPUT_LIMIT = 200;

function field(input: unknown, key: string): string {
  if (typeof input !== "object" || input === null) return "";
  const value = (input as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function oneLine(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > INPUT_LIMIT ? `${flat.slice(0, INPUT_LIMIT)}…` : flat;
}

function summary(call: ToolCall): string {
  switch (call.name) {
    case "Bash":
      return field(call.input, "command");
    case "Skill":
      return [field(call.input, "skill"), field(call.input, "args")].filter(Boolean).join(" ");
    case "Agent":
    case "Task":
      return [field(call.input, "subagent_type"), field(call.input, "description")]
        .filter(Boolean)
        .join(" - ");
    case "Read":
    case "Edit":
    case "Write":
      return field(call.input, "file_path");
    default:
      return call.input === undefined ? "" : JSON.stringify(call.input);
  }
}

function textOf(output: unknown): string {
  if (typeof output === "string") return output;
  return output === undefined || output === null ? "" : JSON.stringify(output);
}

function outcome(call: ToolCall): string {
  const output = textOf(call.output);
  const firstLine = output.split("\n")[0] ?? "";
  if (call.is_error === true) return `error: ${oneLine(firstLine)}`;
  const exit = /^Exit code (\d+)/.exec(firstLine);
  if (exit !== null && exit[1] !== "0") return `exit ${exit[1] ?? ""}`;
  return "ok";
}

export function transcript(calls: readonly ToolCall[]): string {
  const subagents = new Map(
    calls
      .filter((call) => call.id !== undefined && (call.name === "Agent" || call.name === "Task"))
      .map((call) => [call.id, field(call.input, "subagent_type") || "subagent"]),
  );
  return calls
    .map((call, index) => {
      const parent = call.parentToolUseId ?? null;
      const scope = parent === null ? "main" : (subagents.get(parent) ?? "subagent");
      return `${String(index + 1)}. [${scope}] ${call.name}: ${oneLine(summary(call))} -> ${outcome(call)}`;
    })
    .join("\n");
}
