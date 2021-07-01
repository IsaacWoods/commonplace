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

// TODO: colors and width from theme
const Container = styled(Flex)`
    position: fixed;
    top: 0;
    bottom: 0;
    width: 240px;
    height: auto;
    background: #333333;
    z-index: 10;
    margin: 0;
`;
