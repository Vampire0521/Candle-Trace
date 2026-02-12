// =============================================
// CANDLE TRACE - LOADING SKELETON COMPONENT
// Animated placeholder for loading states
// =============================================

import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
}

export function Skeleton({
    width = '100%',
    height = 20,
    borderRadius = '8px',
    className = '',
}: SkeletonProps) {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius,
            }}
        />
    );
}

// Pre-built skeleton patterns
export function CardSkeleton() {
    return (
        <div className={styles.cardSkeleton}>
            <Skeleton height={16} width="40%" />
            <Skeleton height={32} width="60%" />
        </div>
    );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
    return (
        <tr className={styles.rowSkeleton}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i}>
                    <Skeleton height={16} width={i === 0 ? '80%' : '60%'} />
                </td>
            ))}
        </tr>
    );
}

export function ChartSkeleton() {
    return (
        <div className={styles.chartSkeleton}>
            <Skeleton height="100%" />
        </div>
    );
}
