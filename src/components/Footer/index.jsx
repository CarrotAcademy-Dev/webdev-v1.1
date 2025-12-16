import { useColorMode } from '@chakra-ui/react';
import StyledFooter from "./Footer.Styled";

function Footer() {
    const { colorMode } = useColorMode();
    
    return (
        <StyledFooter data-theme={colorMode}>
            <div className="container">
                <footer className="footer">
                    <h2 className="footer__title">© Carrot Academy 2025 v1.1</h2>
                </footer>
            </div>
        </StyledFooter>
    );
}

export default Footer;