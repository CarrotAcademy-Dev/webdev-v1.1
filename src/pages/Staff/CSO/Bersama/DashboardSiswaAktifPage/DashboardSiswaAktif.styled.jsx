import styled from "@emotion/styled";

export const StyledDashboardSiswaAktifPage = styled.div`
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;

    * {
        box-sizing: border-box;
    }

    /* Constrain Chakra Grid and GridItem */
    .chakra-grid {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
    }

    .chakra-grid__item {
        min-width: 0; /* Critical for preventing grid item overflow */
        overflow: hidden;
    }

    .hero-section {
        margin-bottom: 2rem;

        .page-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 2.5rem;
            color: var(--chakra-colors-light-text-primary);
            text-align: center;
        }

        .filter-section {
            display: flex;
            justify-content: right;
            margin-bottom: 2.5rem;
            
            label {
                font-weight: 600;
                margin-right: 0.5rem;
            }
        }
    }

    .summary-card {
        border: 2px solid #f97316;
        padding: 1.5rem;
        border-radius: 12px;
        color: var(--chakra-colors-light-text-primary);
        text-align: center;
        transition: transform 0.2s;

        &:hover {
            transform: translateY(-4px);
            background: #e87f47ff;
            color: white;
        }

        h3 {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            opacity: 0.95;
            font-weight: 600;
        }

        .number {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
        }
    }

    .chart-section {
        background: var(--chakra-colors-light-bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .section-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: var(--chakra-colors-light-text-primary);
        text-align: center;
        border-bottom: 3px solid #a6abb0ff;
        padding-bottom: 0.5rem;
    }

    .chart-container {
        padding: 1rem;
        background: var(--chakra-colors-light-bg-card);
        border-radius: 8px;
    }

    .simple-bars {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .bar-item {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .bar-label {
        min-width: 120px;
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--chakra-colors-light-text-secondary);
    }

    .bar-wrapper {
        flex: 1;
        background: var(--chakra-colors-light-border);
        border-radius: 8px;
        height: 32px;
        position: relative;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 0.5rem;
        border-radius: 8px;
        transition: width 0.3s ease;
        min-width: 40px;
    }

    .bar-value {
        color: white;
        font-weight: 700;
        font-size: 0.875rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    .table-section {
        background: var(--chakra-colors-light-bg-secondary);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    /* Wrapper untuk table dengan scroll, pagination fixed */
    .table-wrapper {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
    }

    .search-container {
        margin-bottom: 1rem;
        width: 100%;
        max-width: 100%;
    }

    .table-container {
        overflow-x: auto;
        overflow-y: hidden;
        margin-top: 1rem;
        margin-bottom: 1rem;
        width: 100%;
        max-width: 100%;
        -webkit-overflow-scrolling: touch;
        border: 1px solid var(--chakra-colors-light-border);
        border-radius: 8px;

        &::-webkit-scrollbar {
            height: 8px;
        }

        &::-webkit-scrollbar-track {
            background: var(--chakra-colors-light-bg-card);
            border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
        }

        table {
            width: max-content;
            min-width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
            background: var(--chakra-colors-light-bg-secondary);
            table-layout: auto;

            thead {
                background: #FFFAF0;
                position: sticky;
                top: 0;
                z-index: 10;

                th {
                    padding: 0.75rem 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: var(--chakra-colors-light-text-primary);
                    border-bottom: 1px solid var(--chakra-colors-light-border);
                    white-space: nowrap;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: background-color 0.2s;

                    &[style*="cursor: pointer"] {
                        user-select: none;
                        
                        &:hover {
                            background: #FEEBC8;
                        }
                    }
                }
            }

            tbody {
                tr {
                    transition: background-color 0.15s;
                    border-bottom: 1px solid var(--chakra-colors-light-border);

                    &:hover {
                        background: var(--chakra-colors-light-bg-hover);
                    }

                    &.total-row {
                        background: #FED7AA;
                        font-weight: 700;
                        border-top: 2px solid #F97316;
                        border-bottom: 2px solid #F97316;

                        &:hover {
                            background: #FDBA74;
                        }

                        td {
                            font-weight: 700;
                        }
                    }

                    td {
                        padding: 0.75rem 1rem;
                        text-align: left;
                        font-size: 0.875rem;
                        color: var(--chakra-colors-light-text-secondary);
                        white-space: nowrap;

                        strong {
                            color: var(--chakra-colors-light-text-primary);
                            font-weight: 700;
                        }
                    }
                }
            }
        }
    }

    .pagination-container {
        margin-top: 1rem;
        width: 100%;
        position: relative;
        background: transparent;
    }

    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;

        &.cuti {
            background: #fecaca;
            color: #991b1b;
        }

        &.new {
            background: #d1fae5;
            color: #065f46;
        }

        &.retention {
            background: #ddd6fe;
            color: #5b21b6;
        }

        &.private {
            background: #fef3c7;
            color: #92400e;
        }
    }

    .class-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;

        &.ol {
            background: #dbeafe;
            color: #1e40af;
        }

        &.of {
            background: #fed7aa;
            color: #9a3412;
        }
    }

    @media (max-width: 768px) {
        .table-container {
            font-size: 0.75rem;

            table {
                th, td {
                    padding: 0.5rem 0.25rem;
                }
            }
        }

        .section-title {
            font-size: 1rem;
        }

        .chart-section {
            padding: 1rem;
        }
    }

    &[data-theme='dark'] {
        .hero-section {
            .page-title {
                color: var(--chakra-colors-dark-text-primary);
            }
        }

        .summary-card {
            color: var(--chakra-colors-dark-text-primary);
        }

        .chart-section {
            background: var(--chakra-colors-dark-bg-secondary);
        }

        .section-title {
            color: var(--chakra-colors-dark-text-primary);
            border-bottom-color: #4A5568;
        }

        .chart-container {
            background: var(--chakra-colors-dark-bg-card);
        }

        .bar-label {
            color: var(--chakra-colors-dark-text-secondary);
        }

        .bar-wrapper {
            background: var(--chakra-colors-dark-border);
        }

        .table-section {
            background: var(--chakra-colors-dark-bg-secondary);
        }

        .table-container {
            border-color: var(--chakra-colors-dark-border);

            &::-webkit-scrollbar-track {
                background: var(--chakra-colors-dark-bg-card);
            }

            &::-webkit-scrollbar-thumb {
                background: #4A5568;
            }

            &::-webkit-scrollbar-thumb:hover {
                background: #718096;
            }

            table {
                background: var(--chakra-colors-dark-bg-secondary);

                thead {
                    background: #744210;

                    th {
                        color: var(--chakra-colors-dark-text-primary);
                        border-bottom-color: var(--chakra-colors-dark-border);

                        &[style*="cursor: pointer"]:hover {
                            background: #8B5000;
                        }
                    }
                }

                tbody {
                    tr {
                        border-bottom-color: var(--chakra-colors-dark-border);

                        &:hover {
                            background: var(--chakra-colors-dark-bg-hover);
                        }

                        &.total-row {
                            background: #744210;

                            &:hover {
                                background: #8B5000;
                            }
                        }

                        td {
                            color: var(--chakra-colors-dark-text-secondary);

                            strong {
                                color: var(--chakra-colors-dark-text-primary);
                            }
                        }
                    }
                }
            }
        }
    }
`;
