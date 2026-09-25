import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // API images already arrive in sm/md/lg sizes, so plain <img srcset> is used on purpose.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
