'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Calendar, BookOpen, BarChart3, Sparkles } from 'lucide-react';
import ChronaLogo from '@/components/intro/ChronaLogo';
import SpaceBackground from '@/components/dashboard/SpaceBackground';

export default function LoginPage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-space-bg">
      {/* Space Background */}
      <div className="fixed inset-0">
        <SpaceBackground />
      </div>

      {/* Hero Section - Login */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo with breathing animation */}
        <div className="mb-12 animate-fade-in" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <ChronaLogo size={200} animate={true} className="animate-breathing" />
        </div>

        {/* Brand Name */}
        <div className="mb-16 animate-fade-in delay-300" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 text-center">
            CHRONA
          </h1>
          <p className="text-center text-gray-400 text-lg">
            Your Cosmic Academic Dashboard
          </p>
        </div>

        {/* Sign In Button */}
        <div className="animate-fade-in delay-600" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          <button
            onClick={handleSignIn}
            className="group relative px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <div className="flex items-center gap-3">
              {/* Google Icon */}
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300 -z-10 blur-xl"></div>
          </button>
        </div>

        {/* Subtitle */}
        <div className="mt-12 text-center animate-fade-in delay-900" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          <p className="text-gray-500 text-sm max-w-md">
            Sign in to access your personalized dashboard with course management,
            calendar integration, and academic analytics.
          </p>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-fade-in delay-1200 flex flex-col items-center" style={{ opacity: Math.max(0, 1 - scrollY / 300) }}>
          <p className="text-gray-400 text-sm mb-3">Discover more</p>
          <div className="animate-bounce">
            <ChevronDown className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 min-h-screen px-4 py-20 bg-gradient-to-b from-transparent via-black/20 to-black/40">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20" style={{ opacity: Math.min(1, Math.max(0, (scrollY - 400) / 200)) }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Chrona brings together all your academic tools in one cosmic dashboard
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Smart Calendar',
                description: 'Upload your syllabus and auto-generate calendar events with smart reminders',
                color: 'from-blue-500/20 to-cyan-500/20',
                borderColor: 'border-blue-500/30'
              },
              {
                icon: BookOpen,
                title: 'Course Management',
                description: 'Track all your courses, assignments, and deadlines in one beautiful interface',
                color: 'from-green-500/20 to-emerald-500/20',
                borderColor: 'border-green-500/30'
              },
              {
                icon: BarChart3,
                title: 'Grade Analytics',
                description: 'Visualize your academic performance with real-time grade tracking and insights',
                color: 'from-purple-500/20 to-pink-500/20',
                borderColor: 'border-purple-500/30'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Gemini AI parses your syllabi and extracts dates, assignments, and exams automatically',
                color: 'from-orange-500/20 to-yellow-500/20',
                borderColor: 'border-orange-500/30'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`p-6 bg-gradient-to-br ${feature.color} backdrop-blur-xl rounded-2xl border ${feature.borderColor} hover:scale-105 transition-all duration-300`}
                  style={{
                    opacity: Math.min(1, Math.max(0, (scrollY - 600 - index * 100) / 200)),
                    transform: `translateY(${Math.max(0, 50 - (scrollY - 600 - index * 100) / 4)}px)`
                  }}
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-20" style={{ opacity: Math.min(1, Math.max(0, (scrollY - 1000) / 200)) }}>
            <button
              onClick={handleSignIn}
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:scale-110 shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.8)] animate-pulse-glow"
            >
              <span className="relative z-10">Get Started Free</span>
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"></div>
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-400/40 group-hover:via-blue-400/40 group-hover:to-purple-400/40 transition-all duration-300 -z-20 blur-2xl scale-110"></div>
            </button>
            <p className="text-gray-400 text-sm mt-4 animate-fade-in delay-200">
              No credit card required • <span className="text-purple-400">Sign in with Google</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
