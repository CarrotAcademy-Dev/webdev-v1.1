import styled from "styled-components";

const StyledRemindersWidget = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    .widget-title {
        font-size: 1.25rem;
        font-weight: 500;
         color: #718096;
        text-align: left;
    }
    .reminders-list {
        list-style: none;
        padding: 0;
        margin-top: 1rem;
        width: 100%;
    }
    .reminder-item {
        padding: 1rem 0;
        border-bottom: 1px solid #E2E8F0;
        &:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
    }
    .reminder-details {
        text-align: left;
    }
    .reminder-title {
        margin-top: 0;
        font-size: 1.44rem;
        font-weight: 500;
        color: #2D3748;
    }
    .reminder-time {
        font-size: 0.875rem;
        color: #718096;
    }
    .widget-footer {
        margin: 1rem;
        text-align: center;
        max-width: 100%;
    }
    .no-reminders {
        text-align: center;
        color: #a0aec0; /* Warna abu-abu */
        padding: 2rem 0;
        font-style: italic;
    }
`;

export default StyledRemindersWidget;