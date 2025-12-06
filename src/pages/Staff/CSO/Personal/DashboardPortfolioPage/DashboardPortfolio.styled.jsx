import styled from 'styled-components';

export const StyledDashboardPortfolio = styled.div`
    width: 100%;
    padding: 2rem;

    .hero-section {
        display: flex;
        gap: 1.5rem;
        align-items: stretch;
    }

    .hero-section__left {
        flex: 1;
    }

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
    }

    .stats-grid-portfolio {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .main-content-section {
        margin-top: 2rem;
    }

    @media (min-width: 769px) {
        .stats-grid-portfolio {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (min-width: 1200px) {
        .stats-grid-portfolio {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .hero-section {
            flex-direction: column;
        }

        .page-title {
            font-size: 1.5rem;
        }
    }
`;
