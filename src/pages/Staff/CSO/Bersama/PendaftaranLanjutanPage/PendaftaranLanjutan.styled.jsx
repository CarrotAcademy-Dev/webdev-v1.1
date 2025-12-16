import styled from "@emotion/styled";

export const StyledPendaftaranLanjutanPage = styled.div`
    width: 100%;
    padding: 2rem;

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        color: var(--chakra-colors-light-text-primary);
    }

    .hero-section {
        display: flex;
        gap: 1.5rem;
        align-items: stretch;
        margin-bottom: 2rem;

        .hero-section__left {
            flex: 2;
        }

        .hero-section__right {
            flex: 1;
            
            & > div {
                height: 100%;
            }
        }

        .stats-grid-prospective {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .progress-info {
            width: 100%;
            
            h3 {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--chakra-colors-light-text-primary);
                margin-bottom: 1rem;
            }

            .progress-stats {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;

                .percentage {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--chakra-colors-brand-500);
                }

                .count {
                    font-size: 0.9rem;
                    color: var(--chakra-colors-light-text-secondary);
                }
            }

            .progress-bar {
                width: 100%;
                height: 12px;
                background-color: var(--chakra-colors-light-bg-card);
                border-radius: 6px;
                overflow: hidden;

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg,  var(--chakra-colors-brand-500) 0%, var(--chakra-colors-brand-200) 100%);
                    transition: width 0.3s ease;
                    border-radius: 6px;
                }
            }
        }
    }

    @media (min-width: 769px) {
        .stats-grid-prospective {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 992px) {
        .hero-section {
            flex-direction: column;
        }
    }

    .table-container {
        overflow-x: auto;
        background: var(--chakra-colors-light-bg-card);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 1rem;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--chakra-colors-light-border);
        }

        th {
            background-color: var(--chakra-colors-light-bg-card);
            font-weight: 600;
            color: var(--chakra-colors-light-text-primary);
            white-space: nowrap;
        }

        tbody tr:hover {
            background-color: var(--chakra-colors-light-bg-hover);
        }

        td {
            vertical-align: middle;
        }
    }

    &[data-theme='dark'] {
        .page-title {
            color: var(--chakra-colors-dark-text-primary);
        }
        
        .hero-section {
            .progress-info {
                h3 {
                    color: var(--chakra-colors-dark-text-primary);
                }

                .progress-stats {
                    .count {
                        color: var(--chakra-colors-dark-text-secondary);
                    }
                }

                .progress-bar {
                    background-color: var(--chakra-colors-dark-bg-card);
                }
            }
        }

        .table-container {
            background: var(--chakra-colors-dark-bg-card);
        }

        .data-table {
            th, td {
                border-bottom: 1px solid var(--chakra-colors-dark-border);
                color: var(--chakra-colors-dark-text-secondary);
            }

            th {
                background-color: var(--chakra-colors-dark-bg-ternary);
                color: var(--chakra-colors-dark-text-primary);
            }

            tbody tr:hover {
                background-color: var(--chakra-colors-dark-bg-hover);
            }
        }
    }
`;
