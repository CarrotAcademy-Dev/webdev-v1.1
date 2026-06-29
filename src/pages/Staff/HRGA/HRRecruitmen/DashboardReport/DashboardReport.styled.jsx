import styled from "@emotion/styled";

export const StyledDashboardReport = styled.div`
  padding: 24px;
  min-height: 100vh;

  --bg-primary: ${(props) => (props.colorMode === "dark" ? "#1a202c" : "#ffffff")};
  --bg-secondary: ${(props) => (props.colorMode === "dark" ? "#2d3748" : "#f7fafc")};
  --text-primary: ${(props) => (props.colorMode === "dark" ? "#ffffff" : "#1a202c")};
  --text-secondary: ${(props) => (props.colorMode === "dark" ? "#a0aec0" : "#4a5568")};
  --border-color: ${(props) => (props.colorMode === "dark" ? "#4a5568" : "#e2e8f0")};
  --hover-bg: ${(props) => (props.colorMode === "dark" ? "#4a5568" : "#edf2f7")};
  --sticky-bg: ${(props) => (props.colorMode === "dark" ? "#2d3748" : "#ffffff")};
  .header {
    margin-bottom: 24px;

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 16px;
      color: var(--text-secondary);
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @media (min-width: 992px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .search-container {
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
    color: var(--text-secondary);
    gap: 16px;
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    background: var(--bg-primary);

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
        background: ${(props) => (props.colorMode === "dark" ? "#718096" : "#cbd5e0")};
      }
    }

    table {
      width: 100%;
      min-width: 1400px;
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

            &[style*="cursor: pointer"] {
              &:hover {
                background: var(--hover-bg);
              }
            }

            &[style*="position: sticky"] {
              background: var(--sticky-bg);
              box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
              z-index: 11;
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

            &[style*="position: sticky"] {
              background: var(--sticky-bg);
              box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
              z-index: 1;
            }
          }

          &:hover td[style*="position: sticky"] {
            background: var(--hover-bg);
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .header {
      h1 {
        font-size: 24px;
      }

      .subtitle {
        font-size: 14px;
      }
    }

    .search-container {
      flex-direction: column;
      align-items: stretch;
    }

    .table-wrapper {
      table {
        min-width: 1800px;

        thead tr th,
        tbody tr td {
          padding: 10px 8px;
        }
      }
    }
  }
`;
