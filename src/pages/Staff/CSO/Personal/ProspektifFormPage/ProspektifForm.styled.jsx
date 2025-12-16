import styled from 'styled-components';

export const StyledProspektifFormPage = styled.div`
    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--chakra-colors-light-text-primary);
        margin-bottom: 1.5rem;
    }

    .form-container {
        background: var(--chakra-colors-light-bg-secondary);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .search-section {
        margin-bottom: 2rem;
        display: flex;
        gap: 1rem;
        align-items: flex-end;
    }

    .search-input-wrapper {
        flex: 1;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .form-section {
        margin-bottom: 2rem;
    }

    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--chakra-colors-light-text-primary);
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #FE7743;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .field-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--chakra-colors-light-text-secondary);
    }

    .field-value {
        font-size: 1rem;
        color: var(--chakra-colors-light-text-primary);
        padding: 0.5rem;
        background: var(--chakra-colors-light-bg-card);
        border-radius: 6px;
        min-height: 2.5rem;
        display: flex;
        align-items: center;
    }

    .field-value.empty {
        color: var(--chakra-colors-light-text-muted);
        font-style: italic;
    }

    .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .checkbox-field {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .readonly-checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid #FE7743;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--chakra-colors-light-bg-secondary);

        &.checked {
            background: #FE7743;
            
            &::after {
                content: '✓';
                color: white;
                font-size: 14px;
                font-weight: bold;
            }
        }
    }

    .notes-section {
        margin-top: 2rem;
    }

    .notes-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .notes-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .notes-value {
        min-height: 100px;
        padding: 0.75rem;
        background: var(--chakra-colors-light-bg-card);
        border-radius: 6px;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: var(--chakra-colors-light-text-primary);
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--chakra-colors-light-text-muted);
    }

    .error-state {
        text-align: center;
        padding: 3rem;
        color: #dc3545;
    }

    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .checkbox-grid {
            grid-template-columns: 1fr;
        }

        .button-group {
            flex-direction: column;
        }

        .search-section {
            flex-direction: column;
        }
    }

    &[data-theme='dark'] {
        .page-title {
            color: var(--chakra-colors-dark-text-primary);
        }

        .form-container {
            background: var(--chakra-colors-dark-bg-secondary);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .section-title {
            color: var(--chakra-colors-dark-text-primary);
        }

        .field-label {
            color: var(--chakra-colors-dark-text-secondary);
        }

        .field-value {
            color: var(--chakra-colors-dark-text-primary);
            background: var(--chakra-colors-dark-bg-card);
        }

        .field-value.empty {
            color: var(--chakra-colors-dark-text-muted);
        }

        .readonly-checkbox {
            background: var(--chakra-colors-dark-bg-secondary);
        }

        .notes-value {
            background: var(--chakra-colors-dark-bg-card);
            color: var(--chakra-colors-dark-text-primary);
        }

        .empty-state {
            color: var(--chakra-colors-dark-text-muted);
        }
    }
`;
