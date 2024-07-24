import * as React from 'react';
import styled from 'styled-components';
import Scene from '../components/scene';
import Header, { Action } from '../components/header';
import CenteredContent from '../components/centered';
import NewZettelButton from '../components/new_zettel_button';
import Flex from '../components/flex';
import Button from '../components/button';
import ZettelEntry from '../components/zettel_entry';
import { search_zettels } from '../zettel';

export default function Home() {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState([]);

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
                    {results.map(id => (<li key={id}><ZettelEntry id={id} /></li>))}
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
