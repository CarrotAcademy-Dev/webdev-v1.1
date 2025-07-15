import styled from "styled-components";

const StyledCalendarWrapper = styled.div`
    h3 {
        font-size: 1.25rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 1rem;
    }
    .react-calendar {
        width: 100%;
        border: none;
        font-family: 'Poppins', sans-serif;
    }
    .react-calendar__navigation {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }
    .react-calendar__navigation button {
        color: #1A202C;
        min-width: 44px;
        background: none;
        border: none;
        font-size: 1.2rem;
        font-weight: bold;
    }
    .react-calendar__navigation button:hover {
        background-color: #f0f0f0;
    }
    .react-calendar__month-view__weekdays__weekday abbr {
        text-decoration: none;
        font-size: 0.75rem;
        font-weight: 600;
        color: #718096;
    }
    .react-calendar__tile {
        background: none;
        border: none;
        aspect-ratio: 1 / 1;
        font-size: 0.75rem;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: background-color 0.2s;
        position: relative;
    }
    .react-calendar__tile:hover {
        background-color: #f0f0f0;
    }
    .react-calendar__month-view__days__day--neighboringMonth {
        color: #d1d1d1;
    }
    .react-calendar__tile.holiday {
        color: #ff4d4d;
        font-weight: 400;
    }
    .react-calendar__tile.attended {
        background-color: #FEECE5;
        color: #1A202C;
    }
    .react-calendar__tile.attended {
        background-color: #FEECE5;
        color: #1A202C;
        border-radius: 0;
    }
    .react-calendar__tile.range-start {
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
    }
    .react-calendar__tile.range-end {
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
    }
    .react-calendar__tile.attended:not(.range-start):not(.range-end):not(.range-middle) {
        border-radius: 50%;
    }
    .react-calendar__tile.today {
        background-color: #FE7743;
        color: white;
        border-radius: 50%;
    }
    info-box {
        margin-top: 1rem;
        padding: 0.75rem;
        background-color: #f7fafc;
        border-radius: 8px;
        text-align: center;
        min-height: 40px; /* Biar ukurannya stabil */
        transition: background-color 0.2s;
    }
    .info-box p {
        font-weight: 500;
        color: #4a5568;
    }
    .tooltip-trigger {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
    }
    @media screen and (min-width: 992px) {
        .react-calendar__month-view__weekdays__weekday abbr {
            font-size: 1rem;
        }
        .react-calendar__tile {
            font-size: 1rem;
        }
    }
`;

export default StyledCalendarWrapper;