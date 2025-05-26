// tailwind.config.ts (с упрощенным путем content)
import type { Config } from 'tailwindcss'

const config: Config = {
  // --- ИЗМЕНЕН ПУТЬ НА БОЛЕЕ ШИРОКИЙ ---
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Сканировать ВСЁ внутри папки src
  ],
  // --- КОНЕЦ ИЗМЕНЕНИЯ ---
  theme: {
    extend: {
      colors: {
        // Синий цвет пока убран, но можно вернуть, если нужен
        'brand-orange': {
          light: '#FB923C',
          DEFAULT: '#F97316',
          dark: '#EA580C',
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config