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
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  
  img {
    width: 70px;  
    height: 70px;
  }
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