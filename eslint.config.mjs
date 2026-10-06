// Lint for the harness sources and tests. Formatting is Prettier's job:
// eslint-config-prettier switches off every rule that would fight it.
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".runs/",
      ".bdk/",
      "node_modules/",
      "coverage/",
      "tasks/*/hidden/",
      "tasks/*/reference/",
    ],
  },
  {
    files: ["harness/**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },
  prettier,
);
