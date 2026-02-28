import styled from '@emotion/styled';

const StyledSettingsPage = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    .page-header {
        margin-bottom: 2rem;

        h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
    }

    .settings-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .settings-section {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .section-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);

            svg {
                font-size: 1.5rem;
                color: #FE7743;
            }

            h2 {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
            }
        }

        .section-content {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
    }

    .profile-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 2rem;
        align-items: start;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .profile-avatar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;

        .avatar-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .avatar-name {
            font-size: 0.85rem;
            color: var(--text-secondary);
            text-align: center;
        }
    }

    .profile-fields {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        flex: 1;
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;

            svg {
                font-size: 1rem;
                color: #FE7743;
            }
        }

        .field-value {
            padding: 0.75rem 1rem;
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 0.95rem;

            &.read-only {
                background: var(--disabled-bg);
                color: var(--text-secondary);
                cursor: not-allowed;
            }
        }

        .badge-group {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
    }

    .action-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #FE7743 0%, #f5576c 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        width: fit-content;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(254, 119, 67, 0.4);
        }

        &:active {
            transform: translateY(0);
        }

        svg {
            font-size: 1.2rem;
        }
    }

    .theme-toggle-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: var(--input-bg);
        border-radius: 8px;
        border: 1px solid var(--border-color);

        .toggle-info {
            display: flex;
            align-items: center;
            gap: 1rem;

            svg {
                font-size: 1.5rem;
                color: #FE7743;
            }

            .toggle-text {
                h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 0.25rem 0;
                }

                p {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin: 0;
                }
            }
        }
    }

    .login-history-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;

        thead {
            background: var(--input-bg);

            th {
                padding: 0.75rem 1rem;
                text-align: left;
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--text-primary);
                border-bottom: 2px solid var(--border-color);
            }
        }

        tbody {
            tr {
                border-bottom: 1px solid var(--border-color);

                &:hover {
                    background: var(--hover-bg);
                }

                td {
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }
            }
        }

        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;

            &.success {
                background: #C6F6D5;
                color: #22543D;
            }

            &.failed {
                background: #FED7D7;
                color: #742A2A;
            }
        }
    }

    .save-button-container {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;

        button {
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;

            &.primary {
                background: #FE7743;
                color: white;
                border: none;

                &:hover {
                    background: #E46A3A;
                }
            }

            &.secondary {
                background: transparent;
                color: var(--text-primary);
                border: 1px solid var(--border-color);

                &:hover {
                    background: var(--hover-bg);
                }
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .page-header h1 {
            font-size: 1.5rem;
        }

        .settings-section {
            padding: 1.5rem;
        }

        .login-history-table {
            font-size: 0.8rem;

            thead th,
            tbody td {
                padding: 0.5rem;
            }
        }
    }
`;

export default StyledSettingsPage;
