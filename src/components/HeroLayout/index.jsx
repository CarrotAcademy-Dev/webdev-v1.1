import React from 'react';
import StyledHeroLayout from './HeroLayout.Styled';

function HeroLayout({ title, subtitle, leftContent, rightContent }) {
    return (
        <StyledHeroLayout>
            <div className="hero__left">
                <div className="greetings">
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
                {leftContent}
            </div>
            <div className="hero__right">
                {rightContent}
            </div>
        </StyledHeroLayout>
    );
}

export default HeroLayout;