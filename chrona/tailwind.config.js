/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',

                // Cosmic theme colors with full palettes
                space: {
                    bg: '#0a0a14',
                    'bg-secondary': '#0f0f1a',
                },
                cosmic: {
                    purple: {
                        50: '#f3f1ff',
                        100: '#e9e5ff',
                        200: '#d6cfff',
                        300: '#b8a9ff',
                        400: '#9575ff',
                        500: '#8b5cf6', // Main brand color
                        600: '#7c3aed',
                        700: '#6b21a8',
                        800: '#581c87',
                        900: '#4c1d95',
                    },
                    blue: {
                        50: '#eff6ff',
                        100: '#dbeafe',
                        200: '#bfdbfe',
                        300: '#93c5fd',
                        400: '#60a5fa',
                        500: '#3b82f6', // Main nebula blue
                        600: '#2563eb',
                        700: '#1d4ed8',
                        800: '#1e40af',
                        900: '#1e3a8a',
                    },
                },

                // Semantic colors
                star: {
                    white: '#ffffff',
                    glow: '#f8fafc',
                },
                widget: {
                    bg: 'rgb(30 30 45 / 0.7)',
                    border: 'rgb(255 255 255 / 0.1)',
                },
                status: {
                    urgent: '#ef4444',
                    success: '#10b981',
                    warning: '#f59e0b',
                    info: '#3b82f6',
                },
            },
            boxShadow: {
                // Cosmic glow effects
                'cosmic-glow': '0 0 30px rgb(139 92 246 / 0.5)',
                'cosmic-glow-hover': '0 0 50px rgb(139 92 246 / 0.7)',
                'cosmic-glow-intense': '0 0 40px rgb(139 92 246 / 0.4), 0 0 60px rgb(139 92 246 / 0.8)',

                // Widget shadows
                'widget-glow': '0 0 20px rgb(139 92 246 / 0.3)',
                'widget-glow-purple': '0 0 30px rgb(139 92 246 / 0.5)',
                'widget-glow-blue': '0 0 30px rgb(59 130 246 / 0.5)',
                'widget-glow-red': '0 0 30px rgb(239 68 68 / 0.5)',
                'widget-glow-green': '0 0 30px rgb(16 185 129 / 0.5)',

                // Interactive shadows
                'button-cosmic': '0 0 40px rgb(139 92 246 / 0.4)',
                'button-cosmic-hover': '0 0 60px rgb(139 92 246 / 0.8)',
            },
            animation: {
                'fade-in': 'fadeIn 1.2s ease-out forwards',
                'fade-out': 'fadeOut 1.2s ease-in-out forwards',
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'slide-in': 'slideIn 0.4s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'breathing': 'breathing 3s ease-in-out infinite',
                'rotate-slow': 'rotate-slow 20s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                fadeInUp: {
                    'from': {
                        opacity: '0',
                        transform: 'translateY(20px)',
                    },
                    'to': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                slideIn: {
                    'from': {
                        opacity: '0',
                        transform: 'translateX(-20px)',
                    },
                    'to': {
                        opacity: '1',
                        transform: 'translateX(0)',
                    },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-glow': {
                    '0%, 100%': {
                        'box-shadow': '0 0 20px rgba(139, 92, 246, 0.5)',
                    },
                    '50%': {
                        'box-shadow': '0 0 40px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.5)',
                    },
                },
                breathing: {
                    '0%, 100%': {
                        transform: 'scale(1)',
                        opacity: '0.8',
                    },
                    '50%': {
                        transform: 'scale(1.1)',
                        opacity: '1',
                    },
                },
                'rotate-slow': {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' },
                },
            },
            transitionDelay: {
                '100': '0.1s',
                '200': '0.2s',
                '300': '0.3s',
                '350': '0.35s',
                '400': '0.4s',
                '600': '0.6s',
                '900': '0.9s',
                '1200': '1.2s',
            },
            backdropBlur: {
                'cosmic': '16px',
                'widget': '12px',
            },
            spacing: {
                'widget': '380px', // Standard widget width
                'widget-height': '420px', // Standard widget height
            },
        },
    },
    plugins: [],
}