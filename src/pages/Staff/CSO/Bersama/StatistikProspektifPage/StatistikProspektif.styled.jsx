import styled from "@emotion/styled";

export const StyledStatistikProspektifPage = styled.div`
    .hero-section {
        margin-bottom: 2rem;

        .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--chakra-colors-dark-text-secondary);
        }

        .filter-section {
            margin-bottom: 1rem;
        }
    }

    .table-container {
        overflow-x: auto;
        background: var(--chakra-colors-light-bg-card);
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
            border: 1px solid var(--chakra-colors-light-border);
        }

        th {
            background-color: var(--chakra-colors-brand-20);
            font-weight: 600;
            color: var(--chakra-colors-light-text-primary);
            white-space: nowrap;
        }

        tbody tr:hover {
            background-color: var(--chakra-colors-brand-20);
        }

        td {
            &:not(:first-child) {
                text-align: center;
            }
        }
    }

    // support manual theme toggle
    [data-theme='dark'] & {
        tbody tr:hover {
            background-color: var(--chakra-colors-dark-bg-hover);
        }

        .table-container {
            background: var(--chakra-colors-dark-bg-card);
        }

        .statistik-table th, .statistik-table td {
            border-color: var(--chakra-colors-dark-border);
            color: var(--chakra-colors-dark-text-primary);
        }
        
        th {
            background-color: var(--chakra-colors-brand-900);
            color: var(--chakra-colors-dark-text-primary);
        }
    }
    
    [data-theme='light'] & {
        .statistik-table th, .statistik-table td {
            border-color: var(--chakra-colors-light-border);
        }
    }
`;
