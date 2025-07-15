import StyledInfoCard from "./InfoCard.Styled";

function InfoCard ({ children, ...rest }) {
    return (
        <StyledInfoCard {...rest}>
            {children}
        </StyledInfoCard>
    );
}

export default InfoCard;