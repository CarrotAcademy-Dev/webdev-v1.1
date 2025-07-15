import styled from "styled-components";

const StyledDaftarSiswaTrialPage = styled.div`
    width: 100%;
    padding: 2rem;
    .hero-section {
        display: flex;
        gap: 1.5rem;
        align-items: stretch;
    }
    .hero-section__left {
        flex: 2;
    }
    .hero-section__right {
        flex: 1;
        & > div {
            height: 100%;
        }
    }
    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
    }
    .stats-grid-prospective {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    .main-content-section {
        margin-top: 2rem;
    }
    @media (min-width: 769px) {
        .stats-grid-prospective {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (max-width: 992px) {
        .hero-section {
            flex-direction: column;
        }
    }
`;

export default StyledDaftarSiswaTrialPage;