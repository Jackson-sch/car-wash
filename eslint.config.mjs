import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  // Next.js recommended configs (core-web-vitals + typescript)
  ...nextVitals,
  ...nextTs,

  // TypeScript strict rules on top of Next.js defaults
  ...tseslint.configs.strict,

  // Custom overrides
  {
    rules: {
      // Keep no-explicit-any as error to prevent new explicit any usage
      "@typescript-eslint/no-explicit-any": "error",

      // Prefer `import type` for type-only imports
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

      // Enforce consistent type definitions (interfaces over types)
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],

      // Use `T[]` instead of `Array<T>`
      "@typescript-eslint/array-type": ["warn", { default: "array" }],

      // Warn on variables that are declared but never used
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],

      // Allow require() for config/seed scripts
      "@typescript-eslint/no-require-imports": "off",

      // Disable strict config rules that would be overly disruptive
      // on an existing codebase, or that require type-aware linting
      // (parserOptions.project) which isn't configured here.
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/lib/db/migrations/**",
  ]),
]);

export default eslintConfig;
