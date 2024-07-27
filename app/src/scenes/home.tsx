import * as React from 'react';
import styled from 'styled-components';
import Scene from '../components/scene';
import Header, { Action } from '../components/header';
import { Link, NavLink } from 'react-router-dom';
import CenteredContent from '../components/centered';
import NewZettelButton from '../components/new_zettel_button';
import Flex from '../components/flex';
import Button from '../components/button';
import { fetch_zettel, list_zettels, search_zettels, ZettelContext } from '../zettel';

export default function Home() {
    const zettelContext = React.useContext(ZettelContext);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState([]);

    React.useEffect(() => {
        list_zettels().then((zettels) => {
            zettels.forEach((zettel: any) => {
                zettelContext.dispatch({ type: "updateTitle", id: zettel.id, title: zettel.title });
            })
        })
    }, []);

    const zettelLinks = Array.from(zettelContext.state.titles).map(([id, title]: [number, string]) => {
        return (<ZettelEntry key={id} id={id} />);
    });

    const onChangeQuery = React.useCallback((event: React.SyntheticEvent<HTMLInputElement>) => {
        setQuery((event.target as HTMLInputElement).value);
    }, [setQuery]);

    const onSearch = React.useCallback(async () => {
        setResults(await search_zettels(query));
    }, [query]);

    const onKeyUp = React.useCallback((event) => {
        if (event.key === "Enter") {
            onSearch();
        }
    }, [onSearch]);

    return (
        <Scene>
            <Header title="Home" actions={
                <Action><NewZettelButton /></Action>
            } />
            <CenteredContent>
                <Flex align="center">
                    <Searchbar autoFocus placeholder="Search for something..." onChange={onChangeQuery} onKeyUp={onKeyUp} />
                    <Button onClick={onSearch}>Search</Button>
                </Flex>
                <ul>
                    {results.map(id => (<ZettelEntry key={id} id={id} />))}
                </ul>

                <h3>All Zettels</h3>
                <ul>
                    {zettelLinks}
                </ul>
            </CenteredContent>
        </Scene>
    );
}

const Searchbar = styled.input`
    outline: none;
    border: 0;
    resize: none;

    font-size: 2em;
    font-weight: 500;
    line-height: 1.25;

    &::placeholder {
        color: ${props => props.theme.placeholder};
        -webkit-text-fill-color: ${props => props.theme.placeholder};
    }
`;

function ZettelEntry(props) {
    const [zettel, setZettel] = React.useState(null);

    React.useEffect(() => {
        fetch_zettel(props.id).then((result) => {
            setZettel(result);
        }).catch((error) => {
            console.log("Error: ", error);
        });
    }, [props.id]);

    return (
        <StyledListItem>
            <NavLink to={`/zettel/${props.id}`}>{zettel ? zettel.title : "Loading"}</NavLink>
        </StyledListItem>
    );
}

const StyledListItem = styled.li`
    border: none;
    border-radius: 4px;
    margin: 8px 4px;
    padding: 4px;

    background-color: ${props => props.theme.buttonBackground};
`;
