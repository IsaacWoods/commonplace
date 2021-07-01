import * as React from 'react';
import styled from 'styled-components';

type Align = "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
type Justify = "flex-start" | "flex-end" | "left" | "right" | "center" | "space-between" | "space-around" | "space-evenly";

type Props = {
    children?: React.ReactNode,
    auto?: boolean,
    column?: boolean,
    align?: Align,
    justify?: Justify,
}

const Flex = React.forwardRef<HTMLDivElement, Props>(({ children, ...otherProps }, ref) => {
    return (
        <Container ref={ref} {...otherProps}>
            {children}
        </Container>
    );
});

const Container = styled.div<Props>`
    display: flex;
    flex: ${props => (props.auto ? "1 1 auto" : "initial")};
    flex-direction: ${props => (props.column ? "column" : "row")};
    align-items: ${props => props.align};
    justify-content: ${props => props.justify};

    min-width: 0;
    min-height: 0;
`;

export default Flex;
