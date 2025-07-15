import styled from "styled-components";

const StyledNavbar = styled.div`
    /* Small Screen */
    .navbar {
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        padding: 0 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .navbar__brand {
        margin-bottom: 1rem;
        margin-right: 1.5rem;
    }
    .navbar__brand .brandLogo {
        max-width: 10%;
        height: auto;
        margin: 1rem;
    }
    .navbar__list {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
        gap: 1.5rem;
    }
    /* Medium Screen */
    @media (min-width: 768px) {
        .navbar {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
        .navbar__brand {
            margin-bottom: 0;
        }
        .navbar__list {
            flex-direction: row;
        }
        .navbar__item {
            margin: 0 1rem;
        }
    }
    /* Large Screen */
    @media (min-width: 992px) {
        
    }
`

export default StyledNavbar