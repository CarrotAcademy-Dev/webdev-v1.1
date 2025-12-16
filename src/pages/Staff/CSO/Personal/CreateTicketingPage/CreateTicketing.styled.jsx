import styled from 'styled-components';

export const StyledCreateTicketing = styled.div`
    padding: 2rem 0;

    .hero-section {
        margin-bottom: 2rem;
    }

    .main-content-section {
        background: var(--chakra-colors-light-bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .form-section {
        display: grid;
        gap: 1.5rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        &.full-width {
            grid-column: 1 / -1;
        }

        label {
            font-weight: 600;
            color: var(--chakra-colors-light-text-primary);
            font-size: 0.875rem;

            .required {
                color: #e53e3e;
                margin-left: 0.25rem;
            }
        }

        input, select, textarea {
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.875rem;
            transition: all 0.2s;
            background: var(--chakra-colors-light-bg-secondary);
            color: var(--chakra-colors-light-text-primary);

            &:focus {
                outline: none;
                border-color: #FE7743;
                box-shadow: 0 0 0 3px rgba(254, 119, 67, 0.1);
            }

            &:disabled {
                background-color: var(--chakra-colors-light-bg-card);
                cursor: not-allowed;
            }
        }

        textarea {
            min-height: 100px;
            resize: vertical;
            font-family: inherit;
        }

        .helper-text {
            font-size: 0.75rem;
            color: var(--chakra-colors-light-text-muted);
            margin-top: 0.25rem;
        }
        
        a {
            color: #FE7743;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: var(--chakra-colors-light-bg-card);
        border-radius: 8px;

        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
        }

        label {
            margin: 0;
            cursor: pointer;
            user-select: none;
        }
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
    }

    .btn {
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;

        &.btn-primary {
            background: #FE7743;
            color: white;

            &:hover:not(:disabled) {
                background: #e56633;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(254, 119, 67, 0.3);
            }

            &:disabled {
                background: #cbd5e0;
                cursor: not-allowed;
            }
        }

        &.btn-secondary {
            background: var(--chakra-colors-light-bg-secondary);
            color: var(--chakra-colors-light-text-primary);
            border: 1px solid #e2e8f0;

            &:hover {
                background: var(--chakra-colors-light-bg-card);
            }
        }
    }

    &[data-theme='dark'] {
        .main-content-section {
            background: var(--chakra-colors-dark-bg-secondary);
        }

        .form-group {
            label {
                color: var(--chakra-colors-dark-text-primary);
            }

            input, select, textarea {
                background: var(--chakra-colors-dark-bg-card);
                color: var(--chakra-colors-dark-text-primary);
                border-color: var(--chakra-colors-dark-border);

                &:disabled {
                    background-color: var(--chakra-colors-dark-bg-card);
                }
            }

            .helper-text {
                color: var(--chakra-colors-dark-text-muted);
            }
        }

        .checkbox-group {
            background: var(--chakra-colors-dark-bg-card);
        }

        .form-actions {
            border-top-color: var(--chakra-colors-dark-border);
        }

        .btn-secondary {
            background: var(--chakra-colors-dark-bg-card);
            color: var(--chakra-colors-dark-text-primary);
            border-color: var(--chakra-colors-dark-border);

            &:hover {
                background: var(--chakra-colors-dark-bg-secondary);
            }
        }
    }

    @media (max-width: 768px) {
        padding: 1rem 0;

        .main-content-section {
            padding: 1rem;
        }

        .form-actions {
            flex-direction: column;

            .btn {
                width: 100%;
            }
        }
    }
`;
