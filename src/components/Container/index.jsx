import StyledContainer from './Container.Styled';

function ContainerCarrot(props) {
  return <StyledContainer>{props.children}</StyledContainer>;
}

export default ContainerCarrot;