import styled from "@emotion/styled";

export const StyledTicketExternal = styled.div`
    padding: 2rem 0;

    .table-wrapper {
        background: ${props => props['data-theme'] === 'dark' ? 'var(--chakra-colors-dark-bg-card)' : 'white'};
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow-x: auto;
        
        &::-webkit-scrollbar {
            height: 8px;
        }

        &::-webkit-scrollbar-track {
            background: ${props => props['data-theme'] === 'dark' ? '#2D3748' : '#f1f1f1'};
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

    .custom-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 1000px;

        thead {
            position: sticky;
            top: 0;
            z-index: 10;
            background: ${props => props['data-theme'] === 'dark' ? '#2C3748' : '#fcf7ecff'};
        }

        th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            color: ${props => props['data-theme'] === 'dark' ? 'var(--chakra-colors-dark-text-primary)' : '#3b3b43ff'};
            border-bottom: 2px solid ${props => props['data-theme'] === 'dark' ? '#3A4556' : '#e2e8f0'};
            white-space: nowrap;
            user-select: none;

            &:hover {
                background: ${props => props['data-theme'] === 'dark' ? '#3A4556' : '#f5efdcff'};
            }
        }

        tbody tr {
            transition: background-color 0.2s, opacity 0.3s;
            border-bottom: 1px solid ${props => props['data-theme'] === 'dark' ? '#3A4556' : '#e2e8f0'};

            &:hover {
                background-color: ${props => props['data-theme'] === 'dark' ? 'rgba(254, 119, 67, 0.1)' : 'rgba(254, 119, 67, 0.05)'};
            }

            &.updating-row {
                opacity: 0.6;
                pointer-events: none;
            }
        }

        td {
            padding: 12px 16px;
            font-size: 0.875rem;
            color: ${props => props['data-theme'] === 'dark' ? 'var(--chakra-colors-dark-text-secondary)' : 'var(--chakra-colors-gray-600)'};
        }
    }

    &[data-theme='dark'] {
        .table-wrapper {
            background: var(--chakra-colors-dark-bg-card);
            border: 1px solid var(--chakra-colors-dark-border);
        }
    }
`;

export const StyledTicketExternalPage = StyledTicketExternal;
