import * as React from 'react';
import styled from 'styled-components';

type Props = {
    children?: React.ReactNode,
}

export default function CenteredContent(props: Props) {
    return (
        <Container>
            <Content>
                {props.children}
            </Content>
        </Container>
    );
}

const Container = styled.div`
    width: 100%;
    max-width: 100vw;
    padding: 20px 12px;
`;

const Content = styled.div`
    max-width: 52em;
    margin: 0 auto;
`;
