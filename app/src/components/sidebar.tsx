import * as React from 'react';
import styled from 'styled-components';
import Flex from './flex';

export default function Sidebar() {
    return (
        <Container column>
            <h2>Sidebar goes here wee</h2>
        </Container>
    );
}

const Container = styled(Flex)`
    position: fixed;
    top: 0;
    bottom: 0;
    width: ${props => props.theme.sidebarWidth}px;
    height: auto;
    background: ${props => props.theme.sidebarColor};
    z-index: 10;
    margin: 0;
`;
