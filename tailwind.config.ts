import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,vue}',
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
    './plugins/**/*.{js,ts,vue}',
  ],
  safelist: [
    'md:col-span-1',
    'md:col-span-2',
    'md:col-span-3',
    'md:col-span-4',
    'md:grid-cols-2',
    'md:grid-cols-3',
    'md:grid-cols-4',
    'lg:grid-cols-2',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    'grid-cols-1',
    'transition-all',
    'transition-colors',
    'transition-shadow',
    'transition-transform',
    'duration-300',
    'duration-500',
    'ease-out',
    'rotate-180',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
