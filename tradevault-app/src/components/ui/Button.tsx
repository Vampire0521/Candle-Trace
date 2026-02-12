// =============================================
// CANDLE TRACE - BUTTON COMPONENT
// =============================================

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './Button.module.css';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
    variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}



export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className={styles.spinner}>⏳</span>
            ) : (
                <>
                    {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
                    {children && <span className={styles.text}>{children}</span>}
                    {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
                </>
            )}
        </motion.button>
    );
}
