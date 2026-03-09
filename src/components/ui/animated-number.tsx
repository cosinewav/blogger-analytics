'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useInView, SpringOptions } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  formatFn?: (value: number) => string;
  className?: string;
  springOptions?: SpringOptions;
}

export function AnimatedNumber({
  value,
  duration = 1,
  delay = 0,
  formatFn = (v) => v.toLocaleString(),
  className,
  springOptions,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
    ...springOptions,
  });

  const display = useTransform(spring, (latest) => formatFn(Math.round(latest)));

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timeout = setTimeout(() => {
        spring.set(value);
        setHasAnimated(true);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, value, delay, spring, hasAnimated]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

// Format number with Chinese units
export function formatChineseNumber(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  return num.toLocaleString();
}

// Format percentage
export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

// Format decimal
export function formatDecimal(num: number, decimals = 2): string {
  return num.toFixed(decimals);
}

// Animated number with Chinese formatting
export function AnimatedChineseNumber({
  value,
  ...props
}: Omit<AnimatedNumberProps, 'formatFn'>) {
  return (
    <AnimatedNumber
      value={value}
      formatFn={formatChineseNumber}
      {...props}
    />
  );
}

// Counter animation for multiple numbers in a card
interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  formatFn?: (value: number) => string;
  delay?: number;
  className?: string;
}

export function AnimatedStatCard({
  label,
  value,
  suffix = '',
  formatFn,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold mt-2">
        <AnimatedNumber value={value} formatFn={formatFn} delay={delay + 0.2} />
        {suffix}
      </div>
    </motion.div>
  );
}

// Pulse animation for values
export function PulseNumber({
  value,
  formatFn = (v) => v.toLocaleString(),
  className,
}: {
  value: number;
  formatFn?: (value: number) => string;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.1, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {formatFn(value)}
    </motion.span>
  );
}
