import type { Config } from "tailwindcss";
import sharedConfig from "tailwind-config";

const config: Pick<Config, "prefix" | "presets" | "content" | "theme"> = {
  content: [
    "./src/**/*.tsx",
    "./node_modules/rizzui/dist/*.{js,ts,jsx,tsx}",
    '../../packages/isomorphic-core/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      fontFamily: {
        vazirmatn: ["var(--font-vazirmatn)"],
      },
    },
  },
};

export default config;
