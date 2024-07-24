import * as React from 'react';
import styled from 'styled-components';
import { throttle } from 'lodash';
import { transparentize } from 'polished';
import Flex from './flex';
import Fade from './fade';
import Icon from './icon';

type Props = {
    title: React.ReactNode,
    actions?: React.ReactNode,
}

export default function Header(props: Props) {
    const [isScrolled, setScrolled] = React.useState(false);

    const onScroll = React.useCallback(throttle(() => setScrolled(window.scrollY > 75), 50), [setScrolled]);

    React.useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [onScroll]);

    const onClickTitle = React.useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <Wrapper align="center" shrinkIntoCorner={isScrolled}>
            {isScrolled ? (<div />) : <Icon justify="flex-start" /> }
            {isScrolled ? (<Fade><Title onClick={onClickTitle}>{props.title}</Title></Fade>) : (<div />)}
            {props.actions && (
                <Actions align="center" justify="flex-end">
                    {props.actions}
                </Actions>
            )}
        </Wrapper>
    );
}

const Actions = styled(Flex)`
    flex-grow: 1;
    flex-basis: 0;
    min-width: auto;
    padding-left: 8px;
`;

type WrapperProps = {
    shrinkIntoCorner?: boolean,
}

const Wrapper = styled(Flex)<WrapperProps>`
    position: sticky;
    top: 0;
    background: ${(props) => transparentize(0.2, props.theme.background)};
    z-index: ${(props) => props.theme.headerDepth};
    padding: ${(props) => (props.shrinkIntoCorner ? "12px" : "20px 20px 0")};
    justify-content: center;
    transition: all 100ms ease-out;
    transform: translate3d(0, 0, 0);
    backdrop-filter: blur(20px);
    min-height: 56px;

    @media print {
        display: none;
    }
`;

const Title = styled.div`
    display: block;
    padding-left: 0;
    font-size: 16px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
    min-width: 0;

    svg {
        vertical-align: bottom;
    }
`;

export const Action = styled(Flex)`
    justify-content: center;
    align-items: center;
    padding: 0 0 0 10px;
    height: 32px;
    font-size: 15px;
    flex-shrink: 0;

    &:empty {
        display: none;
    }
`;
