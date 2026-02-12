'use client';

import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ===========================================
// FADE IN
// ===========================================
interface FadeInProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.5,
    className,
    direction = 'up',
    distance = 20,
    ...props
}: FadeInProps) {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
            x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration,
                delay,
                ease: 'circOut' as any,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ===========================================
// STAGGER CONTAINER
// ===========================================
export function Stagger({
    children,
    delay = 0,
    stagger = 0.1,
    className,
}: {
    children: ReactNode;
    delay?: number;
    stagger?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
                visible: {
                    transition: {
                        staggerChildren: stagger,
                        delayChildren: delay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ===========================================
// SCALE IN
// ===========================================
export function ScaleIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ===========================================
// PAGE TRANSITION
// ===========================================
export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex-1 w-full"
        >
            {children}
        </motion.div>
    );
}

// ===========================================
// HOVER CARD (Micro-interaction)
// ===========================================
export function HoverCard({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={cn('cursor-pointer relative overflow-hidden', className)}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {children}
        </motion.div>
    );
}
