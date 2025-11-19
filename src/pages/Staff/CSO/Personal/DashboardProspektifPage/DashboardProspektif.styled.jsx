import styled from 'styled-components';

export const StyledDashboardProspektifPage = styled.div`
    padding: 2rem 0;

    .page-header {
        margin-bottom: 2rem;
    }

    .kpi-card {
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1.5px solid #FE7743;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
    }

    .tables-grid {
        width: 100%;
    }

    .table-section {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

        tr {
            transition: background-color 0.2s;
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

    @media (max-width: 768px) {
        padding: 1rem 0;

        .page-header {
            margin-bottom: 1.5rem;
        }

        .table-section {
            padding: 1rem;
        }
    }
`;
