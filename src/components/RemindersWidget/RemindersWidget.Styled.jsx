import styled from "styled-components";

const StyledRemindersWidget = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    
    .widget-title {
        font-size: 1.25rem;
        font-weight: 500;
        color: ${props => props.theme === 'dark' ? '#E2E8F0' : '#718096'};
        text-align: left;
        margin-bottom: 0.5rem;
    }
    
    .reminders-list {
        list-style: none;
        padding: 0;
        margin-top: 0.5rem;
        width: 100%;
    }
    
    .reminder-section {
        padding: 1rem;
        border-radius: 8px;
        background: ${props => props.theme === 'dark' ? 'rgba(45, 55, 72, 0.4)' : 'rgba(255, 255, 255, 0.6)'};
        border: 1px solid ${props => props.theme === 'dark' ? '#4A5568' : '#E2E8F0'};
        transition: all 0.2s ease-in-out;
        
        &:hover {
            border-color: ${props => props.theme === 'dark' ? '#718096' : '#CBD5E0'};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
    }
    
    .reminder-item {
        padding: 1rem 0;
        border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4A5568' : '#E2E8F0'};
        
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
        color: ${props => props.theme === 'dark' ? '#F7FAFC' : '#2D3748'};
    }
    
    .reminder-time {
        font-size: 0.875rem;
        color: ${props => props.theme === 'dark' ? '#A0AEC0' : '#718096'};
    }
    
    .widget-footer {
        margin: 1rem 0;
        text-align: center;
        max-width: 100%;
    }
    
    .no-reminders {
        text-align: center;
        color: ${props => props.theme === 'dark' ? '#718096' : '#A0AEC0'};
        padding: 2rem 0;
        font-style: italic;
    }
`;

export default StyledRemindersWidget;