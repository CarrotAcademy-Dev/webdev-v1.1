import styled from 'styled-components';

export const StyledDashboardReminder = styled.div`
    padding: 2rem 0;

    .page-header {
        margin-bottom: 2rem;
    }

    .overview-card {
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1.5px solid #FE7743;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
    }

    .filter-section {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
    }

    .holiday-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
        border-left: 4px solid;
    }

    .table-section {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
        height: fit-content;
    }

    .table-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #e2e8f0;

        &::-webkit-scrollbar {
            height: 8px;
        }

        &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 8px;
        }

        &::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 8px;

            &:hover {
                background: #a0aec0;
            }
        }
    }

    .data-table {
        border-collapse: collapse;
        
        thead {
            position: sticky;
            top: 0;
            z-index: 10;
        }

        tbody tr {
            transition: background-color 0.2s;
            cursor: pointer;

            &:hover {
                background-color: #f8fafeff;
            }
        }

        th {
            white-space: nowrap;
            text-transform: uppercase;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
        }

        td {
            font-size: 0.875rem;
        }
    }

    .react-datepicker-wrapper {
        width: 100%;
    }

    .react-datepicker__input-container input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #FE7743;
        border-radius: 6px;
        font-size: 0.875rem;
        transition: border-color 0.2s;

        &:focus {
            outline: none;
            border-color: #FE7743;
            box-shadow: 0 0 0 1px #FE7743;
        }

        &:hover {
            border-color: #cbd5e0;
        }
    }

    /* DatePicker Popup z-index fix */
    .react-datepicker-popper {
        z-index: 9999 !important;
    }

    .react-datepicker {
        font-family: inherit;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .react-datepicker__header {
        background-color: #fefdfcff;
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        padding-top: 8px;
    }

    .react-datepicker__current-month,
    .react-datepicker__day-name {
        color: #FE7743;
    }

    .react-datepicker__day--selected,
    .react-datepicker__day--keyboard-selected {
        background-color: #FE7743;
        color: white;

        &:hover {
            background-color: #e56633;
        }
    }

    .react-datepicker__day:hover {
        background-color: #fef3c7;
        border-radius: 4px;
    }

    @media (max-width: 768px) {
        padding: 1rem 0;

        .page-header {
            margin-bottom: 1.5rem;
        }

        .table-section {
            padding: 1rem;
        }

        .filter-section {
            padding: 1rem;
        }
    }
`;
