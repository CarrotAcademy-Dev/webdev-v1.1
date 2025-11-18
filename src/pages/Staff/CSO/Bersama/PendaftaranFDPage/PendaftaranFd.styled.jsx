import styled from "styled-components";

const StyledPendaftaranFdPage = styled.div`
    width: 100%;
    max-width: 100%;
    padding: 2rem;
    box-sizing: border-box;
    overflow-x: hidden;

    * {
        box-sizing: border-box;
    }

    .hero-section {
        display: flex;
        gap: 1.5rem;
        align-items: stretch;
        width: 100%;
        max-width: 100%;
    }
    .hero-section__left {
        flex: 2;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .hero-section__right {
        flex: 1;
        display: flex;
        min-width: 0;
        & > div {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
    }
    .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
    }
    .stats-grid-prospective {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        flex: 1;
        width: 100%;
        max-width: 100%;
        
        /* Make all cards same height */
        & > div {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 12rem;
        }
    }
    .main-content-section {
        margin-top: 2rem;
    }
    
    /* Progress Bar Styles */
    .progress-info {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        height: 100%;
        justify-content: center;
        padding: 0.5rem 0;
        
        h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: #2D3748;
            margin-bottom: 0.25rem;
            text-align: center;
        }
        
        .progress-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            
            .percentage {
                font-size: 2rem;
                font-weight: 800;
                background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .count {
                font-size: 0.875rem;
                font-weight: 600;
                color: #64748B;
            }
        }
        
        .progress-bar {
            width: 100%;
            height: 1.25rem;
            background: linear-gradient(90deg, #FEF3C7 0%, #FED7AA 100%);
            border-radius: 9999px;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
            position: relative;
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #F97316 0%, #FB923C 50%, #FDBA74 100%);
                border-radius: 9999px;
                transition: width 0.5s ease-in-out;
                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
                position: relative;
                
                &::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    animation: shimmer 2s infinite;
                }
            }
        }
    }
    
    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }
    
    @media (min-width: 769px) {
        .stats-grid-prospective {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (max-width: 992px) {
        .hero-section {
            flex-direction: column;
        }
    }
`;

export default StyledPendaftaranFdPage;