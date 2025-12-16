import styled from 'styled-components';

export const StyledRekapAbsensi = styled.div`
    width: 100%;
    padding: 5rem;

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        color: var(--chakra-colors-light-text-primary);
    }

    .today-section {
        background: var(--chakra-colors-light-bg-secondary);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--chakra-colors-light-text-primary);
            margin-bottom: 1rem;
        }

        .time-display {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;

            .time-item {
                flex: 1;
                min-width: 200px;
                padding: 1rem;
                background: var(--chakra-colors-light-bg-card);
                border-radius: 8px;
                border-left: 4px solid #FE7743;

                .time-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--chakra-colors-light-text-muted);
                    margin-bottom: 0.5rem;
                }

                .time-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--chakra-colors-light-text-primary);
                }
            }
        }
        
        .statsCard {
            background: var(--chakra-colors-light-bg-secondary);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin: 2rem 0;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;

        @media (min-width: 769px) {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .filter-section {
        background: var(--chakra-colors-light-bg-secondary);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;
    }

    .table-section {
        background: var(--chakra-colors-light-bg-secondary);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--chakra-colors-light-text-primary);
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid var(--chakra-colors-light-bg-card);
        }
    }

    .payslip-section {
        background: var(--chakra-colors-light-bg-secondary);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--chakra-colors-light-text-primary);
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid var(--chakra-colors-light-bg-card);
        }

        .payslip-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;

            @media (min-width: 768px) {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .payslip-group {
            .group-title {
                font-size: 1rem;
                font-weight: 600;
                color: var(--chakra-colors-light-text-primary);
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--chakra-colors-light-border);
            }

            .payslip-item {
                display: flex;
                justify-content: space-between;
                padding: 0.75rem 0;
                border-bottom: 1px solid var(--chakra-colors-light-bg-card);

                .item-label {
                    font-size: 0.875rem;
                    color: var(--chakra-colors-light-text-secondary);
                }

                .item-value {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--chakra-colors-light-text-primary);
                }

                &.total {
                    font-weight: 700;
                    color: #FE7743;
                    border-top: 2px solid #FE7743;
                    padding-top: 1rem;
                    margin-top: 0.5rem;
                }
            }
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .page-title {
            font-size: 1.5rem;
        }

        .today-section,
        .filter-section,
        .table-section,
        .payslip-section {
            padding: 1rem;
        }
    }

    &[data-theme='dark'] {
        .page-title {
            color: var(--chakra-colors-dark-text-primary);
        }

        .today-section,
        .filter-section,
        .table-section,
        .payslip-section {
            background: var(--chakra-colors-dark-bg-secondary);
        }

        .today-section {
            .section-title {
                color: var(--chakra-colors-dark-text-primary);
            }

            .time-display .time-item {
                background: var(--chakra-colors-dark-bg-card);

                .time-label {
                    color: var(--chakra-colors-dark-text-muted);
                }

                .time-value {
                    color: var(--chakra-colors-dark-text-primary);
                }
            }

            .statsCard {
                background: var(--chakra-colors-dark-bg-secondary);
            }
        }

        .table-section,
        .payslip-section {
            .section-title {
                color: var(--chakra-colors-dark-text-primary);
                border-bottom-color: var(--chakra-colors-dark-bg-card);
            }
        }

        .payslip-group {
            .group-title {
                color: var(--chakra-colors-dark-text-primary);
                border-bottom-color: var(--chakra-colors-dark-border);
            }

            .payslip-item {
                border-bottom-color: var(--chakra-colors-dark-bg-card);

                .item-label {
                    color: var(--chakra-colors-dark-text-secondary);
                }

                .item-value {
                    color: var(--chakra-colors-dark-text-primary);
                }
            }
        }
    }
`;
