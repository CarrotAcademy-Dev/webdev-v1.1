import styled from 'styled-components';

const ChartWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    .chart-title {
        font-size: 1rem;
        font-weight: bold;
        width: 100%;
        text-align: center;
        margin-bottom: 1rem;
    }
    .chart-container {
        flex-grow: 1;
        width: 100%;
        position: relative;
    }
    .chart-label {
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }
    .percent-value {
        font-size: 2rem;
        font-weight: 800;
        color: #2D3748;
    }
    .task-status {
        font-size: 0.875rem;
        color: #718096;
    }
`;

export default ChartWrapper;