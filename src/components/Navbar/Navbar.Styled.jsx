import styled from "styled-components";

const StyledNavbar = styled.div`
    /* Fixed positioning */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1000;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    /* Small Screen */
    .navbar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        background-color: #ffffff;
        padding: 0.75rem 1rem;
        max-width: 100%;
        margin: 0 auto;
    }

    .navbar__left {
        display: flex;
        align-items: center;
    }

    .navbar__brand {
        margin: 0;
    }

    .navbar__brand .brandLogo {
        width: 120px;
        height: auto;
    }

    /* Desktop menu - hidden on mobile */
    .navbar__desktop {
        display: none;
    }

    /* Mobile hamburger - visible on mobile */
    .navbar__mobile {
        display: flex;
        align-items: center;
    }

    .navbar__list {
        display: flex;
        flex-direction: row;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: 0.5rem;
        align-items: center;
    }

    .navbar__item {
        margin: 0;
    }

    /* Medium Screen */
    @media (min-width: 768px) {
        .navbar {
            padding: 1rem 1.5rem;
        }

        /* Show desktop menu */
        .navbar__desktop {
            display: flex;
        }

        /* Hide mobile hamburger */
        .navbar__mobile {
            display: none;
        }

        .navbar__list {
            gap: 1rem;
        }

        .navbar__item {
            margin: 0 0.5rem;
        }
    }

    /* Large Screen */
    @media (min-width: 992px) {
        .navbar {
            padding: 1rem 2rem;
        }

        .navbar__list {
            gap: 1.5rem;
        }

        .navbar__item {
            margin: 0 1rem;
        }
    }
`

export default StyledNavbar