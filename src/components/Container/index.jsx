import { useColorMode } from '@chakra-ui/react';
import StyledContainer from './Container.Styled';

function ContainerCarrot(props) {
  const { colorMode } = useColorMode();
  
  return (
    <StyledContainer data-theme={colorMode}>
      {props.children}
    </StyledContainer>
  );
}

export default ContainerCarrot;