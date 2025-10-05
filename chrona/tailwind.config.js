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
                'space-bg': '#0a0a14',
                'space-bg-secondary': '#0f0f1a',
                'cosmic-purple': '#8b5cf6',
                'nebula-blue': '#3b82f6',
                'star-white': '#ffffff',
                'widget-bg': 'rgba(30, 30, 45, 0.7)',
                'urgent-red': '#ef4444',
                'success-green': '#10b981',
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
        },
    },
    plugins: [],
}