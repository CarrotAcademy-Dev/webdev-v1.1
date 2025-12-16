import styled from "@emotion/styled";

export const StyledStatisticsBarChart = styled.div`
    background: var(--chakra-colors-light-bg-secondary);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 2rem;

    .chart-container {
        background: var(--chakra-colors-light-bg-primary);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        margin: 1rem 0;
        min-height: 400px;
    }

    @media (prefers-color-scheme: dark) {
        background: var(--chakra-colors-dark-bg-secondary);
        .chart-container {
            background: var(--chakra-colors-dark-bg-secondary);
        }
    }  

    // Support manual theme toggle
    [data-theme='dark'] & {
        background: var(--chakra-colors-dark-bg-secondary);
        .chart-container {
            background: var(--chakra-colors-dark-bg-secondary);
        }
    }
    
    [data-theme='light'] & {
        background: var(--chakra-colors-light-bg-secondary);
        .chart-container {
            background: var(--chakra-colors-light-bg-secondary);
        }
    }
`;
