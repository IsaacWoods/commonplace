import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Flex from './flex';
import { ZettelCache, list_zettels, Zettel, ZettelResult } from '../zettel';

export default function Sidebar() {
    const zettelCache = React.useContext(ZettelCache);

    React.useEffect(() => {
        list_zettels().then((zettels) => {
            zettels.forEach((zettel: ZettelResult) => {
                zettelCache.dispatch({ type: "updateZettel", id: zettel.id, zettel: { title: zettel.title, content: zettel.content }});
            });
        });
    }, []);

    const zettels = Array.from(zettelCache.state.zettels).map(([id, zettel]: [number, Zettel]) => {
        return (<Link key={id} to={`/zettel/${id}`}>{zettel.title || "Untitled Zettel"}</Link>);
    });

    return (
        <Container column>
            <h2>Hello, Isaac</h2>
            {zettels}
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

const Link = styled(NavLink)`
    margin-bottom: 4px;
`;
