import styled from 'styled-components';

export const StyledReviewKaryawanFin = styled.div`
    width: 100%;
    padding: 5rem;

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 2rem;
        color: var(--chakra-colors-light-text-primary);
    }

    .form-section {
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

        .warning-text {
            font-size: 0.875rem;
            color: #E53E3E;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;

            @media (min-width: 768px) {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            label {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--chakra-colors-light-text-secondary);
            }

            .input-readonly {
                background: var(--chakra-colors-light-bg-card);
                cursor: not-allowed;
            }
        }

        .criteria-section {
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--chakra-colors-light-bg-card);
            border-radius: 8px;

            .criteria-title {
                font-size: 1rem;
                font-weight: 600;
                color: var(--chakra-colors-light-text-primary);
                margin-bottom: 1rem;
            }

            .criteria-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .criteria-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem;
                background: var(--chakra-colors-light-bg-secondary);
                border-radius: 6px;

                label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--chakra-colors-light-text-primary);
                }

                .rating-group {
                    display: flex;
                    gap: 0.5rem;
                }
            }
        }

        .comment-section {
            margin-top: 1.5rem;
        }

        .submit-section {
            margin-top: 2rem;
            display: flex;
            justify-content: flex-end;
        }
    }

    .history-section {
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
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .page-title {
            font-size: 1.5rem;
        }

        .form-section,
        .history-section {
            padding: 1rem;
        }
    }

    &[data-theme='dark'] {
        .page-title {
            color: var(--chakra-colors-dark-text-primary);
        }

        .form-section,
        .history-section {
            background: var(--chakra-colors-dark-bg-secondary);

            .section-title {
                color: var(--chakra-colors-dark-text-primary);
                border-bottom-color: var(--chakra-colors-dark-bg-card);
            }
        }

        .form-group {
            label {
                color: var(--chakra-colors-dark-text-secondary);
            }

            .input-readonly {
                background: var(--chakra-colors-dark-bg-card);
            }
        }

        .criteria-section {
            background: var(--chakra-colors-dark-bg-card);

            .criteria-title {
                color: var(--chakra-colors-dark-text-primary);
            }

            .criteria-item {
                background: var(--chakra-colors-dark-bg-secondary);

                label {
                    color: var(--chakra-colors-dark-text-primary);
                }
            }
        }
    }
`;
