import { defineConfig } from "vitest/config";

// Every git a test runs inherits this: `git commit` starts a detached
// `git maintenance run --auto`, which on recent git writes under
// `.git/objects/pack` while a test removes the repository (ENOTEMPTY).
const env = {
  GIT_CONFIG_COUNT: "2",
  GIT_CONFIG_KEY_0: "maintenance.auto",
  GIT_CONFIG_VALUE_0: "false",
  GIT_CONFIG_KEY_1: "gc.auto",
  GIT_CONFIG_VALUE_1: "0",
};

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          env,
          include: ["harness/**/*.test.ts"],
          // Hidden acceptance tests are fixture code, run inside a fixture copy.
          exclude: ["tasks/*/hidden/**"],
        },
      },
    ],
  },
});
