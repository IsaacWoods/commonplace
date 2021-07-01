import * as React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import Flex from './flex';
import Sidebar from './sidebar';
import CenteredContent from './centered';

type Props = {
    children?: React.ReactNode,
    title?: string,
}

export default function Scene(props: Props) {
    return (
        <Container column auto>
            <Helmet>
                <title>{props.title}</title>
                <meta name="viewport" content="width=device-width,initial-scale=1.0" />
            </Helmet>
            <Container auto>
                <Sidebar />
                <Content auto justify="center">
                    <Fullwidth>
                        <CenteredContent>
                            {props.children}
                        </CenteredContent>
                    </Fullwidth>
                </Content>
            </Container>
        </Container>
    );
}

const Container = styled(Flex)`
    background: #ffffff;
    position: relative;
    width: 100%;
    min-height: 100%;
`;

const Content = styled(Flex)`
    margin-left: ${props => props.theme.sidebarWidth}px;
`;

const Fullwidth = styled.div`
    width: 100%;
`;
