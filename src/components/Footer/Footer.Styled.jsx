import styled from "styled-components";

const StyledFooter = styled.div`
    /* Small Screen */
    .container {
        background-color: var(--chakra-colors-light-bg-secondary);
        color: var(--chakra-colors-light-text-muted);
        padding: 1rem;
        text-align: center;
    }

    .footer {
        background-color: transparent;
    }

    .footer__title {
        background-color: transparent;
        margin-bottom: 1rem;
        font-size: 1rem;
        color: inherit;
    }

    &[data-theme='dark'] {
        .container {
            background-color: var(--chakra-colors-dark-bg-secondary);
            color: var(--chakra-colors-dark-text-muted);
        }
    }

    /* Medium screen */
    @media (min-width: 768px) {
        
    }

    /* Large Screen */
    @media (min-width: 992px) {
        
    }
`;

export default StyledFooter;