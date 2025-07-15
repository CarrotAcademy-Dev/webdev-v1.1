import styled from 'styled-components';

const StyledKpiDetails = styled.div`
    width: 100%;
    .top-grid {
        display: grid;
        grid-template-columns: 1rf;
        gap: 1.5rem;
        align-items: stretch;
    }
    .points-card {
        flex-direction: row !important;
        justify-content: center !important;
        gap: 1.5rem !important;
    }
    .points-value {
        font-size: 2.5rem;
        font-weight: 800;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-top: 1.5rem;
    }
    .details-chart {
        margin-top: 5rem !important;
    }
    .details-chart__chart {
        
    }
    @media (max-width: 768px) {
        .top-grid, .stats-grid {
            grid-template-columns: 1fr;
        }
    }
`;

export default StyledKpiDetails;