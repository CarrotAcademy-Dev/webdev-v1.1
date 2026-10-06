import styled from 'styled-components';

export const StyledSocmedFreelancePage = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3.5rem;
  font-family: inherit;

  .header-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .header-title-group {
    display: flex;
    flex-direction: column;
  }

  .page-title {
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-color, #1A202C);
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FE7743 0%, #FF9565 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(254, 119, 67, 0.35);
    }

    [data-theme='dark'] & {
      color: #F7FAFC;
    }
  }

  .page-subtitle {
    font-size: 0.95rem;
    color: var(--muted-color, #718096);
    margin-top: 0.35rem;

    [data-theme='dark'] & {
      color: #A0AEC0;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;

    @media (min-width: 768px) {
      margin-top: 0;
    }
  }

  /* Section Title */
  .section-label {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-color, #718096);
    margin-bottom: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    [data-theme='dark'] & {
      color: #A0AEC0;
    }
  }

  /* Period Cards */
  .period-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .period-card {
    background: var(--card-bg, #FFFFFF);
    border: 2px solid var(--border-color, #E2E8F0);
    border-radius: 16px;
    padding: 1.25rem 1.35rem;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    [data-theme='dark'] & {
      background: #1A202C;
      border-color: #2D3748;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px -6px rgba(254, 119, 67, 0.22);
      border-color: #FE7743;
    }

    &.active {
      border-color: #FE7743;
      background: linear-gradient(135deg, rgba(254, 119, 67, 0.08) 0%, rgba(254, 119, 67, 0.02) 100%);
      box-shadow: 0 6px 18px rgba(254, 119, 67, 0.25);

      [data-theme='dark'] & {
        background: linear-gradient(135deg, rgba(254, 119, 67, 0.22) 0%, rgba(254, 119, 67, 0.06) 100%);
        border-color: #FE7743;
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 100%;
        background: #FE7743;
      }
    }

    .period-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .period-card-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(254, 119, 67, 0.12);
      color: #FE7743;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;

      [data-theme='dark'] & {
        background: rgba(254, 119, 67, 0.25);
      }
    }

    .period-badge-status {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      letter-spacing: 0.02em;
    }

    .period-card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-color, #2D3748);
      margin-bottom: 0.25rem;
      line-height: 1.3;

      [data-theme='dark'] & {
        color: #F7FAFC;
      }
    }

    .period-card-footer {
      font-size: 0.8rem;
      color: var(--muted-color, #718096);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.5rem;

      [data-theme='dark'] & {
        color: #A0AEC0;
      }
    }
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  .stat-card {
    background: var(--card-bg, #FFFFFF);
    border: 1px solid var(--border-color, #E2E8F0);
    border-radius: 16px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease;

    [data-theme='dark'] & {
      background: #1A202C;
      border-color: #2D3748;
    }

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;

      &.orange {
        background: rgba(254, 119, 67, 0.12);
        color: #FE7743;
      }
      &.purple {
        background: rgba(128, 90, 213, 0.12);
        color: #805AD5;
      }
      &.blue {
        background: rgba(49, 130, 206, 0.12);
        color: #3182CE;
      }
      &.green {
        background: rgba(56, 161, 105, 0.12);
        color: #38A169;
      }
      &.pink {
        background: rgba(213, 63, 140, 0.12);
        color: #D53F8C;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--muted-color, #718096);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      [data-theme='dark'] & {
        color: #A0AEC0;
      }
    }

    .stat-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-color, #1A202C);
      margin-top: 0.15rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      [data-theme='dark'] & {
        color: #F7FAFC;
      }
    }
  }

  /* Filter / Control Bar */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    flex: 1;
    min-width: 260px;
  }

  /* Table Container */
  .table-container {
    background: var(--card-bg, #FFFFFF);
    border: 1px solid var(--border-color, #E2E8F0);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

    [data-theme='dark'] & {
      background: #1A202C;
      border-color: #2D3748;
    }
  }

  .table-responsive {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;

    th {
      background: #F8FAFC;
      color: #4A5568;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      padding: 0.95rem 1rem;
      border-bottom: 2px solid #E2E8F0;
      text-align: left;
      white-space: nowrap;

      [data-theme='dark'] & {
        background: #2D3748;
        color: #CBD5E0;
        border-bottom-color: #4A5568;
      }
    }

    td {
      padding: 0.95rem 1rem;
      border-bottom: 1px solid #EDF2F7;
      color: #2D3748;
      vertical-align: middle;

      [data-theme='dark'] & {
        border-bottom-color: #2D3748;
        color: #E2E8F0;
      }
    }

    tbody tr {
      transition: background-color 0.15s ease;

      &:hover {
        background-color: #F8FAFC;

        [data-theme='dark'] & {
          background-color: #263244;
        }
      }

      &:last-child td {
        border-bottom: none;
      }
    }
  }

  /* Payroll Hero Card */
  .payroll-hero-card {
    background: linear-gradient(135deg, #FE7743 0%, #E0531D 60%, #C93F0C 100%);
    color: white;
    border-radius: 20px;
    padding: 2.25rem 2rem;
    box-shadow: 0 14px 30px -8px rgba(254, 119, 67, 0.45);
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -30%;
      right: -10%;
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .hero-top {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      width: fit-content;
    }

    .hero-period-label {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .hero-amount-group {
      margin-bottom: 2rem;

      .amount-caption {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .amount-value {
        font-size: 2.75rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        line-height: 1.15;
        margin-top: 0.35rem;

        @media (max-width: 640px) {
          font-size: 2rem;
        }
      }
    }

    .hero-breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.25);
      padding-top: 1.5rem;
    }

    .breakdown-item {
      display: flex;
      flex-direction: column;

      .item-label {
        font-size: 0.78rem;
        color: rgba(255, 255, 255, 0.82);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .item-value {
        font-size: 1.35rem;
        font-weight: 800;
        color: #FFFFFF;
        margin-top: 0.25rem;
      }
    }
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3.5rem 1.5rem;
    color: var(--muted-color, #718096);

    .empty-icon {
      font-size: 3rem;
      color: #CBD5E0;
      margin-bottom: 1rem;

      [data-theme='dark'] & {
        color: #4A5568;
      }
    }

    .empty-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-color, #2D3748);
      margin-bottom: 0.35rem;

      [data-theme='dark'] & {
        color: #E2E8F0;
      }
    }

    .empty-desc {
      font-size: 0.9rem;
      max-width: 420px;
      margin: 0 auto;
    }
  }

  /* External Link Button */
  .ig-link-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #FE7743;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.35rem 0.65rem;
    border-radius: 8px;
    background: rgba(254, 119, 67, 0.08);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(254, 119, 67, 0.18);
      color: #E0531D;
      text-decoration: none;
    }
  }
`;
