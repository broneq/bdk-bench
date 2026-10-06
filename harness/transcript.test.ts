import { describe, expect, it } from "vitest";

import { transcript } from "./transcript.ts";

describe("transcript", () => {
  it("writes one numbered line per call with its scope, tool, input and outcome", () => {
    const text = transcript([
      { id: "t1", name: "Bash", input: { command: "git status --short" }, output: "{}" },
      {
        id: "t2",
        name: "Skill",
        input: { skill: "plan", args: "--auto" },
        output: "Launching",
      },
      {
        id: "t3",
        name: "Agent",
        input: { subagent_type: "worker", description: "Implement part 01" },
        output: "done",
      },
      {
        id: "t4",
        name: "Read",
        input: { file_path: "src/a.ts" },
        output: "x",
        parentToolUseId: "t3",
      },
    ]);
    expect(text.split("\n")).toEqual([
      "1. [main] Bash: git status --short -> ok",
      "2. [main] Skill: plan --auto -> ok",
      "3. [main] Agent: worker - Implement part 01 -> ok",
      "4. [worker] Read: src/a.ts -> ok",
    ]);
  });

  it("names non-zero exits and tool errors, and leaves a refused-looking output as ok", () => {
    const text = transcript([
      {
        name: "Bash",
        input: { command: "tool run" },
        output: '{\n  "refused": true,\n  "rule": "policy/no-open-ticket",\n  "why": "x"\n}',
      },
      { name: "Bash", input: { command: "npm test" }, output: "Exit code 2\nFAIL src/a.test.ts" },
      {
        name: "Edit",
        input: { file_path: "src/b.ts" },
        output: "<tool_use_error>String not found\nmore</tool_use_error>",
        is_error: true,
      },
    ]);
    expect(text.split("\n")).toEqual([
      "1. [main] Bash: tool run -> ok",
      "2. [main] Bash: npm test -> exit 2",
      "3. [main] Edit: src/b.ts -> error: <tool_use_error>String not found",
    ]);
  });

  it("puts a long or multi-line input on one line of at most 200 characters", () => {
    const command = `cat <<'EOF'\n${"x".repeat(400)}\nEOF`;
    const [line] = transcript([{ name: "Bash", input: { command }, output: "" }]).split("\n");
    expect(line).not.toMatch(/\n/);
    expect(line).toMatch(/^1\. \[main\] Bash: cat <<'EOF' x+… -> ok$/);
    expect((line ?? "").length).toBeLessThan(240);
  });

  it("shows the input of other tools as JSON, and a subagent of an unknown call as subagent", () => {
    const text = transcript([
      { name: "Grep", input: { pattern: "foo", path: "src" }, output: "", parentToolUseId: "zz" },
    ]);
    expect(text).toBe('1. [subagent] Grep: {"pattern":"foo","path":"src"} -> ok');
  });

  it("is empty without calls", () => {
    expect(transcript([])).toBe("");
  });
});
