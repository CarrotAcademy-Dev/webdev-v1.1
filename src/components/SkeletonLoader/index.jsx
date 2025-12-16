import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useColorMode } from '@chakra-ui/react';

// Wrapper component for theme-aware skeleton
const ThemedSkeleton = ({ children }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    
    return (
        <SkeletonTheme 
            baseColor={isDark ? '#2D3748' : '#e0e0e0'} 
            highlightColor={isDark ? '#4A5568' : '#f0f0f0'}
        >
            {children}
        </SkeletonTheme>
    );
};

// Card Skeleton for InfoCard components
export const CardSkeleton = () => (
    <ThemedSkeleton>
        <div style={{ padding: '20px' }}>
            <Skeleton circle width={40} height={40} style={{ marginBottom: '10px' }} />
            <Skeleton count={1} style={{ marginBottom: '8px' }} />
            <Skeleton width={60} height={30} />
        </div>
    </ThemedSkeleton>
);

// Table Skeleton for table rows
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
    <ThemedSkeleton>
        <>
            {Array.from({ length: rows }).map((_, idx) => (
                <tr key={idx}>
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <td key={colIdx} style={{ padding: '12px' }}>
                            <Skeleton />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    </ThemedSkeleton>
);

// Chart Skeleton
export const ChartSkeleton = ({ height = 300 }) => (
    <ThemedSkeleton>
        <Skeleton height={height} style={{ borderRadius: '12px' }} />
    </ThemedSkeleton>
);

// Text Skeleton
export const TextSkeleton = ({ lines = 3 }) => (
    <ThemedSkeleton>
        <Skeleton count={lines} />
    </ThemedSkeleton>
);
