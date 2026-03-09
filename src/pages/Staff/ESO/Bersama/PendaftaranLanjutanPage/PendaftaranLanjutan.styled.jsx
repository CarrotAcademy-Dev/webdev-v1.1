import styled from '@emotion/styled';

export const StyledPendaftaranLanjutanPage = styled.div`
  width: 100%;
  padding: 2rem;

  .page-title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: var(--chakra-colors-light-text-primary);
  }

  .table-container {
    overflow-x: auto;
    background: var(--chakra-colors-light-bg-card);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--chakra-colors-light-border);
    }

    th {
      background-color: var(--chakra-colors-light-bg-card);
      font-weight: 600;
      color: var(--chakra-colors-light-text-primary);
      white-space: nowrap;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    tbody tr {
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--chakra-colors-light-bg-hover);
      }

      &:last-child td {
        border-bottom: none;
      }
    }

    td {
      vertical-align: middle;
      font-size: 0.875rem;
      color: var(--chakra-colors-light-text-primary);
    }
  }

  &[data-theme='dark'] {
    .page-title {
      color: var(--chakra-colors-dark-text-primary);
    }

    .table-container {
      background: var(--chakra-colors-dark-bg-card);
    }

    .data-table {
      th,
      td {
        border-bottom-color: var(--chakra-colors-dark-border);
      }

      th {
        background-color: var(--chakra-colors-dark-bg-card);
        color: var(--chakra-colors-dark-text-primary);
      }

      tbody tr:hover {
        background-color: var(--chakra-colors-dark-bg-hover);
      }

      td {
        color: var(--chakra-colors-dark-text-primary);
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .page-title {
      font-size: 1.5rem;
    }

    .data-table {
      th,
      td {
        padding: 0.75rem;
        font-size: 0.813rem;
      }
    }
  }
`;
