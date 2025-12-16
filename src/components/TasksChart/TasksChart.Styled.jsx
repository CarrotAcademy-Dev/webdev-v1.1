import styled from "styled-components";

const StyledChart = styled.div`
    border: 2px solid #FE7743;
    border-radius: 20px;
    padding: 1.5rem;
    width: 100%;
    background-color: var(--chakra-colors-light-bg-secondary);
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

    [data-theme='dark'] & {
        background-color: var(--chakra-colors-dark-bg-secondary);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .chart-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--chakra-colors-light-text-primary);
    }

    [data-theme='dark'] & .chart-header h3 {
        color: var(--chakra-colors-dark-text-primary);
    }

    .filters button {
        background-color: transparent;
        border: none;
        padding: 0.5rem 1rem;
        margin-left: 0.5rem;
        font-weight: 500;
        color: var(--chakra-colors-light-text-muted);
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
        
        &:hover {
            color: var(--chakra-colors-light-text-primary);
        }
        
        &.active {
            color: #FE7743;
            font-weight: 700;
            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0.5rem;
                right: 0.5rem;
                height: 2px;
                background-color: #FE7743;
            }
        }
    }

    [data-theme='dark'] & .filters button {
        color: var(--chakra-colors-dark-text-muted);
        
        &:hover {
            color: var(--chakra-colors-dark-text-primary);
        }
    }

    .chart-container {
        width: 100%;
    }

    .custom-tooltip {
        background-color: var(--chakra-colors-light-bg-secondary);
        color: var(--chakra-colors-light-text-primary);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    [data-theme='dark'] & .custom-tooltip {
        background-color: var(--chakra-colors-dark-bg-tertiary);
        color: var(--chakra-colors-dark-text-primary);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .custom-tooltip .label {
        font-weight: bold;
        margin: 0;
    }

    .custom-tooltip .intro {
        margin: 0;
        font-size: 0.875rem;
    }
`;

export default StyledChart;