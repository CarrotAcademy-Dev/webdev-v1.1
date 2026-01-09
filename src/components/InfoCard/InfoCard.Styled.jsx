import styled from "styled-components";

const StyledInfoCard = styled.div`
  border: 2px solid #FE7743;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--chakra-colors-chakra-body-bg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  /* Hover effects - only when $hoverable or $clickable */
  ${props => (props.$hoverable || props.$clickable) && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(254, 119, 67, 0.2);
      border-color: var(--chakra-colors-brand-600);
    }
    
    &:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(254, 119, 67, 0.15);
    }
  `}
  
  /* Clickable cursor */
  ${props => props.$clickable && `
    cursor: pointer;
    user-select: none;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(254, 119, 67, 0.1);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    &:active::before {
      width: 300px;
      height: 300px;
    }
  `}
  
  /* Focus state for keyboard navigation */
  ${props => props.$clickable && `
    &:focus {
      outline: 2px solid var(--chakra-colors-brand-500);
      outline-offset: 2px;
    }
  `}
  
  img {
    width: 70px;  
    height: 70px;
    transition: transform 0.3s ease;
  }
  
  ${props => props.$hoverable && `
    &:hover img {
      transform: scale(1.1);
    }
  `}
  
  p {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--chakra-colors-chakra-body-text);
    text-align: center;
    line-height: 1.4;
    margin-top: 0.5rem;
  }
  .profile__name {
    font-size: 0.9rem;
  }
  .card__text {
    font-size: 0.9rem;
    margin-top: 0.5rem;
    strong { font-weight: 700; }
  }
  .card__subtext {
    margin-top:0.5rem;
    font-size: 0.8rem;
  }
  .card__subtext__sub {
    font-size: 0.65rem;
  }
  .card__points {
    font-size: 1.75rem;
    font-weight: 800;
    margin-top: 0.5rem;
  }
  &.dark-card {
    border: 2px solid var(--chakra-colors-brand-500);
    background-color: var(--chakra-colors-brand-500);
    color: var(--chakra-colors-light-text-primary);
    p {
        color: var(--chakra-colors-light-text-primary);
    }
    strong {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--chakra-colors-light-text-primary);
    }
  }
`;

export default StyledInfoCard;