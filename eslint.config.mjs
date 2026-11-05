import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import quality from "./eslint-rules/index.cjs";

export default defineConfig([
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { quality, "react-hooks": reactHooks },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "quality/max-lines": ["error", { max: 350 }],
    },
  },
  {
    files: ["scripts/**/*.mjs", "vite.config.js", "eslint.config.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["eslint-rules/**/*.cjs"],
    languageOptions: { sourceType: "commonjs", globals: { ...globals.node } },
  },
  globalIgnores([".claude/**", ".superpowers/**", "node_modules/**", "dist/**", "docs/**"]),
]);
