import styled from "@emotion/styled";

export const StyledStatistikProspektifPage = styled.div`
    .hero-section {
        margin-bottom: 2rem;

        .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #2D3748;
        }

        .filter-section {
            margin-bottom: 1rem;
        }
    }

    .table-container {
        overflow-x: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 1rem;
    }

    .statistik-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #E2E8F0;
        }

        th {
            background-color: #fcf9e8ff;
            font-weight: 600;
            color: #4A5568;
            white-space: nowrap;
        }

        tbody tr:hover {
            background-color: #fdfce7ff;
        }

        td {
            &:not(:first-child) {
                text-align: center;
            }
        }
    }
`;
