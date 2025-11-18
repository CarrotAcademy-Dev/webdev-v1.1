import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Card Skeleton for InfoCard components
export const CardSkeleton = () => (
    <div style={{ padding: '20px' }}>
        <Skeleton circle width={40} height={40} style={{ marginBottom: '10px' }} />
        <Skeleton count={1} style={{ marginBottom: '8px' }} />
        <Skeleton width={60} height={30} />
    </div>
);

// Table Skeleton for table rows
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
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
);

// Chart Skeleton
export const ChartSkeleton = ({ height = 300 }) => (
    <Skeleton height={height} style={{ borderRadius: '12px' }} />
);

// Text Skeleton
export const TextSkeleton = ({ lines = 3 }) => (
    <Skeleton count={lines} />
);
