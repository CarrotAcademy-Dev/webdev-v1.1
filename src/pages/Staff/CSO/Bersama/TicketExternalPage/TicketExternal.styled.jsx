import styled from "@emotion/styled";

export const StyledTicketExternalPage = styled.div`
    .hero-section {
        margin-bottom: 2rem;

        .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #2D3748;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .main-content-section {
        margin-top: 2rem;
    }
`;
