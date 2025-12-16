import styled from 'styled-components';

const StyledContainer = styled.div`
  margin: 3rem;
  padding: 3rem;
  /* Use secondary bg for container to create contrast with body */
  background-color: var(--chakra-colors-light-bg-secondary);
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  /* Dark mode uses CSS variable that switches automatically */
  @media (prefers-color-scheme: dark) {
    background-color: var(--chakra-colors-dark-bg-secondary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Support manual theme toggle */
  [data-theme='dark'] & {
    background-color: var(--chakra-colors-dark-bg-secondary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  [data-theme='light'] & {
    background-color: var(--chakra-colors-light-bg-secondary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  @media screen and (min-width: 992px) {
    max-width: 1200px;
  }
`;

export default StyledContainer;