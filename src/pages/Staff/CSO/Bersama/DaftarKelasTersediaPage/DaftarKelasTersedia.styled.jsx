import styled from "@emotion/styled";

export const StyledDaftarKelasTersediaPage = styled.div`
    .hero-section {
        margin-bottom: 2rem;
        .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #2D3748;
        }
    }

    .table-container {
        overflow-x: auto;
        position: relative;
        background: var(--chakra-colors-light-bg-secondary);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 1rem;
    }

    .jadwal-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            padding: 12px;
            text-align: center;
            border: 1px solid var(--chakra-colors-light-border);
            white-space: nowrap;
        }

        th {
            font-weight: 600;
            color: var(--chakra-colors-light-text-secondary);
            position: sticky;
            top: 0;
            z-index: 2;
        }

        .main-header {
            background-color: var(--chakra-colors-light-bg-accent);
            border-bottom: 2px solid var(--chakra-colors-light-border);
        }

        .sub-header {
            background-color: var(--chakra-colors-light-bg-tertiary);
            top: 48px;
        }
        
        .fixed-column {
            position: sticky;
            left: 0;
            background-color: var(--chakra-colors-light-bg-tertiary);
            z-index: 3;
            font-weight: 600;
            border-right: 2px solid var(--chakra-colors-light-border);
        }

        tbody tr:hover {
            background-color: var(--chakra-colors-light-bg-hover);
            
            .fixed-column {
                background-color: var(--chakra-colors-light-bg-hover);
            }
        }
    }

    .jadwal-item {
        padding: 4px 8px;
        margin: 2px 0;
        background-color: var(--chakra-colors-light-bg-accent);
        border-radius: 4px;
        font-size: 0.9rem;
        color: var(--chakra-colors-light-text-secondary);
    }

    &[data-theme="dark"] {
        .table-container {
            background: var(--chakra-colors-dark-bg-secondary);
        }
        
        .jadwal-table {
            th {
                color: var(--chakra-colors-dark-text-secondary);
            }
            
            .main-header {
                background-color: var(--chakra-colors-dark-bg-accent);
                border-bottom: 2px solid var(--chakra-colors-dark-border);
            }

            .sub-header {
                background-color: var(--chakra-colors-dark-bg-secondary);
            }

            .fixed-column {
                background-color: var(--chakra-colors-dark-bg-tertiary);
            }

            tbody tr:hover {
                background-color: var(--chakra-colors-dark-bg-hover);
                color: var(--chakra-colors-dark-text-secondary);
                
                .fixed-column {
                    background-color: var(--chakra-colors-dark-bg-hover);
                }
            }
        }

        .jadwal-item {
            background-color: var(--chakra-colors-dark-bg-accent);
            color: var(--chakra-colors-dark-text-secondary);
        }
    }
`;