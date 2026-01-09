import { memo } from "react";
import { Link } from "react-router-dom";
import StyledInfoCard from "./InfoCard.Styled";

/**
 * InfoCard Component - Enhanced with optional interactivity
 * 
 * @param {ReactNode} children - Card content
 * @param {string} to - Optional route path (makes card clickable as Link)
 * @param {function} onClick - Optional click handler
 * @param {boolean} hoverable - Enable hover effects (default: false)
 * @param {string} className - Additional CSS classes
 * @param {object} rest - Other props passed to styled component
 */
function InfoCard ({ children, to, onClick, hoverable = false, ...rest }) {
    const isInteractive = !!(to || onClick);
    
    // If has 'to' prop, wrap with Link
    if (to) {
        return (
            <StyledInfoCard 
                as={Link} 
                to={to} 
                $hoverable={hoverable || isInteractive}
                $clickable={isInteractive}
                {...rest}
            >
                {children}
            </StyledInfoCard>
        );
    }
    
    // If has onClick, add handler
    if (onClick) {
        return (
            <StyledInfoCard 
                onClick={onClick}
                $hoverable={hoverable || isInteractive}
                $clickable={isInteractive}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick(e);
                    }
                }}
                {...rest}
            >
                {children}
            </StyledInfoCard>
        );
    }
    
    // Default: static card (backward compatible)
    return (
        <StyledInfoCard 
            $hoverable={hoverable}
            $clickable={false}
            {...rest}
        >
            {children}
        </StyledInfoCard>
    );
}

export default memo(InfoCard);