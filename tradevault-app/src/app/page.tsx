// =============================================
// CANDLE TRACE - CLEAN LANDING PAGE
// Simple, elegant, professional
// =============================================

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

// =============================================
// FEATURES DATA - Based on actual app
// =============================================
const FEATURES = [
  {
    icon: '📈',
    title: 'Trade Journal',
    description: 'Log every trade with entry, exit, position size, and notes. Build your trading history.',
  },
  {
    icon: '📊',
    title: 'Performance Dashboard',
    description: 'Track P&L, win rate, profit factor, and key metrics at a glance.',
  },
  {
    icon: '📉',
    title: 'Deep Analytics',
    description: 'Analyze performance by time, strategy, asset, and market conditions.',
  },
  {
    icon: '🤖',
    title: 'AI Insights',
    description: 'Get AI-powered analysis of your trading patterns and improvement suggestions.',
  },
  {
    icon: '🎯',
    title: 'Strategy Management',
    description: 'Define, track, and compare multiple trading strategies.',
  },
  {
    icon: '🧮',
    title: 'Risk Calculator',
    description: 'Calculate position sizes based on risk tolerance and account size.',
  },
];

// =============================================
// STAR BACKGROUND
// =============================================
function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    const stars: { x: number; y: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }

    // Draw stars
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    };

    draw();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className={styles.starCanvas} />;
}

// =============================================
// MAIN LANDING PAGE
// =============================================
export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={styles.container}>
      {/* Star Background */}
      <StarBackground />

      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          <img src="/CandleTrace_logo.svg" alt="Candle Trace" width={32} height={32} className={styles.logoImage} />
          <span className={styles.logoText}>Candle Trace</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>
            Login
          </Link>
          <Link href="/signup" className={styles.navCta}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Your Trading
            <br />
            <span className={styles.heroAccent}>Journal</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Analyze your trades. Track your progress. Improve your edge.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/signup" className={styles.primaryCta}>
              Start Free
              <span className={styles.ctaArrow}>→</span>
            </Link>
            <Link href="/login" className={styles.secondaryCta}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <p className={styles.sectionSubtitle}>
            Professional tools to level up your trading
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((feature, i) => (
            <div key={i} className={styles.featureCard}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>10K+</span>
            <span className={styles.statLabel}>Trades Logged</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>Active Traders</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>24/7</span>
            <span className={styles.statLabel}>Always Available</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to improve your trading?</h2>
          <p className={styles.ctaSubtitle}>
            Join traders who are building their edge with data-driven insights.
          </p>
          <Link href="/signup" className={styles.finalCta}>
            Start Journaling Today
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/CandleTrace_logo.svg" alt="Candle Trace" width={24} height={24} className={styles.logoImage} />
            <span>Candle Trace</span>
          </div>
          <p className={styles.footerText}>
            © 2024 Candle Trace. Built for traders, by traders.
          </p>
        </div>
      </footer>
    </div>
  );
}
