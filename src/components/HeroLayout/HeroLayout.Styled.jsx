import styled from 'styled-components';

const StyledHero = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    .greetings h2 {
        color: #000000;
        font-size: 2rem;
        font-weight: 800;
    }
    .greetings p {
        color: #718096;
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
    .cards__profile {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
    }
    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        text-align: left;
        margin-top: 2.5rem;
        margin-bottom: 1rem;
    }
    .task-summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1.5rem;
    }
    .tasks-completed-chart {
        margin-top: 1.5rem;
    }
    .bottom-widgets-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1.5rem;
        align-items: start;
    }
    @media screen and (min-width: 769px) {
        .cards__profile {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    @media screen and (min-width: 992px) {
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        text-align: left;
        gap: 2rem;
        .hero__left {
            flex-basis: 65%;
        }
        .hero__right {
            flex-basis: 35%;
        }
        .greetings {
            text-align: left;
        }
        .calendar-widget {
            margin-top:5rem;
        }
    }
`;

export default StyledHero;