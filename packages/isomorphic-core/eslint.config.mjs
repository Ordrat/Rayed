import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules
      "no-duplicate-imports": "warn",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "error",
      "react/prop-types": "off",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",

      // Next.js rules
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",

      // TypeScript / JS rules
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      "prefer-const": "off",
      "no-constant-binary-expression": "off",
      "no-empty-pattern": "off",
      "no-undef": "off",
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", "*.config.js", "*.config.mjs"],
  },
];
