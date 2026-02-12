// =============================================
// CANDLE TRACE - INPUT COMPONENT
// =============================================

import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

import { motion } from 'framer-motion';

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, className = '', ...props }, ref) => {
        return (
            <div className={styles.formGroup}>
                {label && <label className={styles.label}>{label}</label>}
                <motion.div
                    className={`${styles.inputWrapper} ${leftIcon ? styles.hasIcon : ''}`}
                    whileTap={{ scale: 0.995 }}
                >
                    {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
                    <input
                        ref={ref}
                        className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
                        {...props}
                    />
                </motion.div>
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Select component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <div className={styles.formGroup}>
                {label && <label className={styles.label}>{label}</label>}
                <select
                    ref={ref}
                    className={`${styles.select} ${error ? styles.inputError : ''} ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className={styles.formGroup}>
                {label && <label className={styles.label}>{label}</label>}
                <textarea
                    ref={ref}
                    className={`${styles.textarea} ${error ? styles.inputError : ''} ${className}`}
                    {...props}
                />
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
