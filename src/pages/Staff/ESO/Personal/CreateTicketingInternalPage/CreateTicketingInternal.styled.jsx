import styled from '@emotion/styled';

export const StyledCreateTicketingInternal = styled.div`
    .hero-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: ${props => props['data-theme'] === 'dark' ? '#1A202C' : '#ffffff'};
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .main-content-section {
        background: ${props => props['data-theme'] === 'dark' ? '#1A202C' : '#ffffff'};
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
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
            font-size: 0.95rem;
            color: ${props => props['data-theme'] === 'dark' ? '#E2E8F0' : '#2D3748'};

            .required {
                color: #E53E3E;
                margin-left: 4px;
            }
        }

        input, select, textarea {
            padding: 0.75rem;
            border: 2px solid ${props => props['data-theme'] === 'dark' ? '#2D3748' : '#E2E8F0'};
            border-radius: 8px;
            font-size: 0.95rem;
            background: ${props => props['data-theme'] === 'dark' ? '#2D3748' : '#ffffff'};
            color: ${props => props['data-theme'] === 'dark' ? '#E2E8F0' : '#2D3748'};
            transition: all 0.2s;

            &:focus {
                outline: none;
                border-color: #FE7743;
                box-shadow: 0 0 0 3px rgba(254, 119, 67, 0.1);
            }

            &::placeholder {
                color: ${props => props['data-theme'] === 'dark' ? '#718096' : '#A0AEC0'};
            }
        }

        textarea {
            resize: vertical;
            min-height: 100px;
            font-family: inherit;
        }

        select {
            cursor: pointer;
        }

        .helper-text {
            font-size: 0.85rem;
            color: ${props => props['data-theme'] === 'dark' ? '#A0AEC0' : '#718096'};

            a {
                color: #FE7743;
                text-decoration: underline;

                &:hover {
                    color: #E56533;
                }
            }
        }
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 2px solid ${props => props['data-theme'] === 'dark' ? '#2D3748' : '#E2E8F0'};
    }

    @media (max-width: 768px) {
        .main-content-section {
            padding: 1.5rem;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .form-actions {
            flex-direction: column;

            button {
                width: 100%;
            }
        }
    }
`;
