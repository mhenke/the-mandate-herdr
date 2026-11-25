import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

const coreOnly = (label, forbidden) => [
  "error",
  {
    patterns: [
      {
        group: forbidden,
        message: `${label} must stay framework- and adapter-free (see docs/TECH_STACK.md).`,
      },
    ],
  },
];

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "references/feasibility/**", ".playwright-mcp/**"],
  },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ["**/*.{ts,tsx}"] })),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["src/core/herdr/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": coreOnly("src/core/herdr", [
        "react",
        "react/*",
        "react-dom",
        "react-dom/*",
        "src/core/narrative",
        "src/core/narrative/*",
        "**/core/narrative",
        "**/core/narrative/**",
        "src/core/assessment",
        "src/core/assessment/*",
        "**/core/assessment",
        "**/core/assessment/**",
        "src/ui",
        "src/ui/*",
        "**/ui/**",
        "src/adapters",
        "src/adapters/*",
        "**/adapters/**",
      ]),
    },
  },
  {
    files: [
      "src/core/narrative/**/*.{ts,tsx}",
      "src/core/assessment/**/*.{ts,tsx}",
      "src/core/applications/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": coreOnly("Core observation modules", [
        "react",
        "react/*",
        "react-dom",
        "react-dom/*",
        "src/ui",
        "src/ui/*",
        "**/ui/**",
        "src/adapters",
        "src/adapters/*",
        "**/adapters/**",
      ]),
    },
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": coreOnly("src/ui", [
        "src/adapters",
        "src/adapters/*",
        "src/adapters/**",
        "**/adapters/**",
      ]),
    },
  },
);
