import styled from 'styled-components';

export const StyledCariDataStudentReport = styled.div`
    min-height: 100vh;
    padding: 2rem 0;

    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: ${props => props['data-theme'] === 'dark' ? '#F9FAFB' : '#1f2937'};
        margin-bottom: 2rem;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;

        thead {
            background-color: ${props => props['data-theme'] === 'dark' ? '#2C3748' : '#fcf7ecff'};
            
            tr {
                th {
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: ${props => props['data-theme'] === 'dark' ? '#E5E7EB' : '#3b3b43ff'};
                    border-bottom: 2px solid ${props => props['data-theme'] === 'dark' ? '#374151' : '#e5e7eb'};
                    white-space: nowrap;
                    user-select: none;
                    
                    &:hover {
                        background-color: ${props => props['data-theme'] === 'dark' ? '#3A4556' : '#f5efdcff'};
                    }
                }
            }
        }

        tbody {
            tr {
                border-bottom: 1px solid ${props => props['data-theme'] === 'dark' ? '#374151' : '#e5e7eb'};
                transition: background-color 0.2s ease;

                &:hover {
                    background-color: ${props => props['data-theme'] === 'dark' ? '#374151' : '#f9fafb'};
                }

                td {
                    padding: 1rem;
                    color: ${props => props['data-theme'] === 'dark' ? '#D1D5DB' : '#4B5563'};
                    vertical-align: middle;
                }
            }
        }
    }

    @media (max-width: 768px) {
        .page-title {
            font-size: 1.5rem;
        }

        .data-table {
            font-size: 0.85rem;

            thead tr th,
            tbody tr td {
                padding: 0.75rem 0.5rem;
            }
        }
    }
`;
