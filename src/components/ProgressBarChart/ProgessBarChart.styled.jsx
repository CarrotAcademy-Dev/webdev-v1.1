import styled from "styled-components";

const StyledProgressBarChart = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
    }
    .chart-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
    }
    .today-progress {
        text-align: right;
    }
    .today-progress p {
        font-size: 1rem;
        color: #718096;
        margin: 0;
    }
    .today-progress span {
        font-size: 2rem;
        font-weight: 800;
        color: #2D3748;
    }
    .chart-container {
        width: 100%;
        flex-grow: 1;
        margin-top: 1rem;
    }
    .custom-tooltip {
        background-color: rgba(255, 255, 255, 0.76);
        color: white;
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

export default StyledProgressBarChart;