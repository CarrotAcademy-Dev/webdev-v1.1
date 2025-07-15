import styled from "styled-components";

const StyledChart = styled.div`
    border: 2px solid #FE7743;
    border-radius: 20px;
    padding: 1.5rem;
    width: 100%;
    background-color: #fff;
    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .chart-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
    }
    .filters button {
        background-color: transparent;
        border: none;
        padding: 0.5rem 1rem;
        margin-left: 0.5rem;
        font-weight: 500;
        color: #718096;
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
        &:hover {
            color: #1A202C;
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
    .chart-container {
        width: 100%;
    }
    .custom-tooltip {
        background-color: rgba(255, 255, 255, 0.76);
        color: black;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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