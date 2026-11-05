import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import quality from "./eslint-rules/index.cjs";

// Sem eslint-plugin-react: marca como usados os componentes referenciados so em JSX
// (<Foo />, <Foo.Bar />). Tags minusculas (div) sao intrinsecas e ignoradas.
const jsxUses = {
  rules: {
    "mark-used": {
      create(context) {
        return {
          JSXOpeningElement(node) {
            let n = node.name;
            while (n.type === "JSXMemberExpression") n = n.object;
            if (n.type === "JSXIdentifier" && /^[A-Z_]/.test(n.name)) {
              context.sourceCode.markVariableAsUsed(n.name, node);
            }
          },
        };
      },
    },
  },
};

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
    plugins: { quality, "react-hooks": reactHooks, "jsx-uses": jsxUses },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "jsx-uses/mark-used": "error",
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
