import styled from "@emotion/styled";

export const StyledRekapJadwalMentorPage = styled.div`
    .hero-section {
        margin-bottom: 2rem;

        .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .table-container {
        overflow-x: auto;
        background: var(--chakra-colors-light-bg-secondary);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 1rem;
        position: relative;
    }

    .rekap-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            padding: 12px;
            text-align: center;
            border: 1px solid var(--chakra-colors-light-border);
            min-width: 80px;
        }

        th {
            background-color: #F7FAFC;
            font-weight: 600;
            color: #4A5568;
            white-space: nowrap;

            &.mentor-header {
                background-color: #feefddff;
                color: #7B341E;
            }
        }

        .fixed-column {
            position: sticky;
            left: 0;
            background-color: #F7FAFC;
            z-index: 1;
            text-align: left;
            border-right: 2px solid #CBD5E0;
        }

        .mentor-divider {
            border-right: 2px solid #CBD5E0;
        }

        tbody {
            tr:hover {
                background-color: #FEFCBF;

                .fixed-column {
                    background-color: #FEFCBF;
                }
            }

            .summary-row {
                background-color: #F7FAFC;
                font-weight: 600;
            }

            .highlighted {
                background-color: #FFF5E7;
                font-weight: 700;
                color: #9C4221;
                box-shadow: inset 0 0 0 1px #FED7A8;
            }
        }
    }

    &[data-theme='dark'] {
        .table-container {
            background: var(--chakra-colors-dark-bg-secondary);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .rekap-table {
            th, td {
                border: 1px solid var(--chakra-colors-dark-border);
            }

            th {
                background-color: #2D3748;
                color: #E2E8F0;

                &.mentor-header {
                    background-color: #744210;
                    color: #FED7A8;
                }
            }

            .fixed-column {
                background-color: #2D3748;
                border-right: 2px solid #4A5568;
            }

            .mentor-divider {
                border-right: 2px solid #4A5568;
            }

            tbody {
                tr:hover {
                    background-color: #4A5568;

                    .fixed-column {
                        background-color: #4A5568;
                    }
                }

                .summary-row {
                    background-color: #2D3748;
                }

                .highlighted {
                    background-color: #744210;
                    color: #FED7A8;
                    box-shadow: inset 0 0 0 1px #9C6644;
                }
            }
        }
    }
`;
