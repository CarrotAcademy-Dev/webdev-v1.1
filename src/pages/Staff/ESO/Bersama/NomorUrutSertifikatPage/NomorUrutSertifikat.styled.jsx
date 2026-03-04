import styled from '@emotion/styled';

const StyledNomorUrutSertifikat = styled.div`
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;

    .hero-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        
        .page-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
        }
    }

    .controls-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;

        .search-box {
            flex: 1;
            min-width: 250px;
            max-width: 400px;
        }

        .add-button {
            background: linear-gradient(135deg, #FE7743 0%, #f5576c 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
            white-space: nowrap;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(254, 119, 67, 0.3);
            }

            &:active {
                transform: translateY(0);
            }

            svg {
                font-size: 1.2rem;
            }
        }
    }

    .table-container {
        background: var(--card-bg);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .data-table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background-color: ${props => props['data-theme'] === 'dark' ? '#3e4a5e' : '#fcf7ecff'};
                color: ${props => props['data-theme'] === 'dark' ? '#E5E7EB' : '#3b3b43ff'};

                tr {
                    th {
                        padding: 1rem;
                        text-align: left;
                        font-weight: 600;
                        font-size: 0.9rem;
                        white-space: nowrap;
                        border-bottom: 2px solid ${props => props['data-theme'] === 'dark' ? '#374151' : '#e5e7eb'};

                        &:hover {
                            background-color: ${props => props['data-theme'] === 'dark' ? '#313c4b' : '#f5efdcff'};
                        }

                        &.center {
                            text-align: center;
                        }
                    }
                }
            }

            tbody {
                tr {
                    border-bottom: 1px solid var(--border-color);
                    transition: background-color 0.2s;

                    &:hover {
                        background: var(--hover-bg);
                    }

                    &:last-child {
                        border-bottom: none;
                    }

                    td {
                        padding: 1rem;
                        color: var(--text-primary);
                        font-size: 0.9rem;

                        &.center {
                            text-align: center;
                        }

                        &.highlight {
                            font-weight: 600;
                            color: #FE7743;
                        }
                    }
                }
            }
        }
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);

        .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-text {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }

        .empty-subtext {
            font-size: 0.9rem;
        }
    }

    .pagination-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--card-bg);
        border-radius: 8px;
        flex-wrap: wrap;
        gap: 1rem;

        .pagination-info {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .pagination-controls {
            display: flex;
            gap: 0.5rem;

            button {
                padding: 0.5rem 1rem;
                border: 1px solid var(--border-color);
                background: var(--card-bg);
                color: var(--text-primary);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;

                &:hover:not(:disabled) {
                    background: var(--hover-bg);
                    border-color: #FE7743;
                    color: #FE7743;
                }

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                &.active {
                    background: #FE7743;
                    color: white;
                    border-color: #FE7743;
                }
            }
        }
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;

        .modal-content {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;

                h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }

                .close-button {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;

                    &:hover {
                        background: var(--hover-bg);
                        color: var(--text-primary);
                    }
                }
            }

            .form-group {
                margin-bottom: 1.5rem;

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.9rem;

                    .required {
                        color: #f5576c;
                        margin-left: 0.25rem;
                    }
                }

                input, select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--input-bg);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    transition: all 0.2s;

                    &:focus {
                        outline: none;
                        border-color: #FE7743;
                        box-shadow: 0 0 0 3px rgba(254, 119, 67, 0.1);
                    }

                    &::placeholder {
                        color: var(--text-muted);
                    }
                }

                select {
                    cursor: pointer;
                }

                .error-message {
                    color: #f5576c;
                    font-size: 0.85rem;
                    margin-top: 0.5rem;
                }
            }

            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;

                button {
                    flex: 1;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;

                    &.cancel-button {
                        background: var(--hover-bg);
                        color: var(--text-primary);
                        border: 2px solid var(--border-color);

                        &:hover {
                            background: var(--input-bg);
                        }
                    }

                    &.submit-button {
                        background: linear-gradient(135deg, #FE7743 0%, #f5576c 100%);
                        color: white;

                        &:hover:not(:disabled) {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(254, 119, 67, 0.3);
                        }

                        &:disabled {
                            opacity: 0.6;
                            cursor: not-allowed;
                            transform: none;
                        }
                    }
                }
            }
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .hero-section {
            .page-title {
                font-size: 1.5rem;
            }
        }

        .controls-section {
            flex-direction: column;
            align-items: stretch;

            .search-box {
                max-width: none;
            }

            .add-button {
                justify-content: center;
            }
        }

        .table-container {
            overflow-x: auto;

            .data-table {
                min-width: 800px;
            }
        }

        .pagination-section {
            flex-direction: column;
            align-items: stretch;

            .pagination-controls {
                justify-content: center;
            }
        }
    }
`;

export default StyledNomorUrutSertifikat;
