import styled from "@emotion/styled";

export const StudentReportStyled = styled.div`
  padding: 24px;
  min-height: 100vh;

  /* CSS Variables for theming */
  --bg-primary: ${(props) =>
    props["data-theme"] === "dark" ? "#1a202c" : "#ffffff"};
  --bg-secondary: ${(props) =>
    props["data-theme"] === "dark" ? "#2d3748" : "#f7fafc"};
  --text-primary: ${(props) =>
    props["data-theme"] === "dark" ? "#ffffff" : "#1a202c"};
  --text-secondary: ${(props) =>
    props["data-theme"] === "dark" ? "#a0aec0" : "#4a5568"};
  --border-color: ${(props) =>
    props["data-theme"] === "dark" ? "#4a5568" : "#e2e8f0"};
  --hover-bg: ${(props) =>
    props["data-theme"] === "dark" ? "#4a5568" : "#edf2f7"};

  /* Header */
  .header {
    margin-bottom: 24px;
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 16px;
    color: var(--text-secondary);
  }

  /* Search Container */
  .search-container {
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
    color: var(--text-secondary);
  }

  /* Error Container */
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
  }

  /* Table Scroll Container */
  .table-scroll-container {
    position: relative;
    width: 100%;
    overflow-x: auto;
    margin-bottom: 24px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    /* Custom scrollbar */
    &::-webkit-scrollbar {
      height: 12px;
    }

    &::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 6px;
      
      &:hover {
        background: ${(props) =>
          props["data-theme"] === "dark" ? "#718096" : "#cbd5e0"};
      }
    }
  }

  /* Data Table */
  .data-table {
    width: 100%;
    min-width: 3500px; /* Very wide table for 25 columns */
    border-collapse: separate;
    border-spacing: 0;
    background: var(--bg-primary);

    thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg-secondary);

      tr {
        th {
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border-color);
          white-space: nowrap;
          background: var(--bg-secondary);
          transition: background-color 0.2s ease;

          /* Hover effect for sortable columns */
          &[style*="cursor: pointer"] {
            &:hover {
              background: var(--hover-bg);
            }
          }
        }
      }
    }

    tbody {
      tr {
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--hover-bg);
        }

        &:not(:last-child) td {
          border-bottom: 1px solid var(--border-color);
        }

        td {
          padding: 12px;
          font-size: 14px;
          color: var(--text-primary);
          vertical-align: middle;
          white-space: nowrap;
        }
      }
    }
  }

  /* Pagination Container */
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    flex-wrap: wrap;
    gap: 16px;
  }

  .pagination-info {
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* Responsive */
  @media (max-width: 768px) {
    padding: 16px;

    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 14px;
    }

    .search-container {
      flex-direction: column;
      align-items: stretch;
    }

    .pagination-container {
      flex-direction: column;
      align-items: flex-start;
    }

    .data-table {
      min-width: 3000px;
      font-size: 13px;
    }
  }
`;
