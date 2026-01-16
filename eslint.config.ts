import eslint from "@eslint/js";

import { defineConfig } from "eslint/config";
import eslintTypescript from "typescript-eslint";
import eslintReact from "eslint-plugin-react";

export default defineConfig(
  eslint.configs.recommended,
  eslintTypescript.configs.stylistic,
  eslintTypescript.configs.strict,
  eslintReact.configs.flat.recommended,
  eslintReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
      languageOptions: {
        parserOptions: {
          project: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
  },
);
