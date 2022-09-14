import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Flex from './flex';
import { list_zettels, Zettel, ZettelResult } from '../zettel';

export default function Sidebar() {
    const [zettels, setZettels] = React.useState([]);

    React.useEffect(() => {
        list_zettels().then((zettels) => setZettels(zettels));
    }, []);
    const zettelLinks = zettels.map(({id, title}: ZettelResult) => {
        return (<Link key={id} to={`/zettel/${id}`}>{title || "Untitled Zettel"}</Link>);
    });

    return (
        <Container column>
            <Section>
                <Link end to="/">Home</Link>
                <Link to="/search">Search</Link>
            </Section>

            <Section>
                <Header>Pinned</Header>
                {zettelLinks}
            </Section>
        </Container>
    );
}

const Container = styled(Flex)`
    position: fixed;
    top: 0;
    bottom: 0;
    width: ${props => props.theme.sidebarWidth}px;
    height: auto;
    overflow-y: scroll;
    background: ${props => props.theme.sidebarColor};
    z-index: 10;
    margin: 0;
`;

const Section = styled(Flex)`
    flex-direction: column;
    flex-shrink: 0;
    margin: 0 8px 20px;
`;

const Header = styled(Flex)`
    margin: 4px 16px 0;
    font-weight: 600;
    font-size: 10px;
    color: ${props => props.theme.link};
    text-transform: uppercase;
`;

const Link = styled(NavLink)`
    margin-bottom: 4px;
`;
