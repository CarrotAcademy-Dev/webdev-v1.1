import styled from "@emotion/styled";

export const StyledDaftarKelasTersediaPage = styled.div`
    .hero-section {
        margin-bottom: 2rem;
        .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #2D3748;
        }
    }

    .table-container {
        overflow-x: auto;
        position: relative;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 1rem;
    }

    .jadwal-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            padding: 12px;
            text-align: center;
            border: 1px solid #E2E8F0;
            white-space: nowrap;
        }

        th {
            font-weight: 600;
            color: #4A5568;
            position: sticky;
            top: 0;
            z-index: 2;
        }

        .main-header {
            background-color: #fcf5e9ff;
            border-bottom: 2px solid #F6AD55;
        }

        .sub-header {
            background-color: #faf8efff;
            top: 48px;
        }
        
        .fixed-column {
            position: sticky;
            left: 0;
            background-color: #fcf5e9ff;
            z-index: 3;
            font-weight: 600;
            border-right: 2px solid #F6AD55;
        }

        tbody tr:hover {
            background-color: #F7FAFC;
            
            .fixed-column {
                background-color: #EDF2F7;
            }
        }
    }

    .jadwal-item {
        padding: 4px 8px;
        margin: 2px 0;
        background-color: #EDF2F7;
        border-radius: 4px;
        font-size: 0.9rem;
        color: #4A5568;
    }
`;