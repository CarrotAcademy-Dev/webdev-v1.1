import styled from 'styled-components';

export const StyledTrackTicketFme = styled.div`
    padding: 2rem 0;

    .page-header {
        margin-bottom: 2rem;
    }

    .overview-card {
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1.5px solid #FE7743;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(254, 119, 67, 0.2);
        }
    }

    .table-section {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
            border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background: #FE7743;
            border-radius: 4px;

            &:hover {
                background: #e56633;
            }
        }
    }

    .data-table {
        border-collapse: collapse;
        width: 100%;

        thead {
            position: sticky;
            top: 0;
            z-index: 10;
        }

        tbody tr {
            transition: background-color 0.2s, opacity 0.3s;
            cursor: pointer;

            &:hover {
                background-color: #f8fafeff;
            }
        }

        th, td {
            text-align: left;
            font-size: 0.875rem;
        }

        th {
            font-weight: 600;
            white-space: nowrap;
        }
    }
`;
