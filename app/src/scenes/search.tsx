import * as React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import Scene from '../components/scene';
import Header from '../components/header';
import CenteredContent from '../components/centered';
import Flex from '../components/flex';
import Button from '../components/button';
import ZettelEntry from '../components/zettel_entry';
import { search_zettels } from '../zettel';

export default function Search() {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState([]);

    const onChangeQuery = React.useCallback((event: React.SyntheticEvent<HTMLInputElement>) => {
        setQuery((event.target as HTMLInputElement).value);
    }, [setQuery]);

    const onSearch = React.useCallback(async () => {
        setResults(await search_zettels(query));
    }, [query]);

    return (
        <Scene>
            <Header title="Search" />
            <CenteredContent>
                <Flex align="center">
                    <Searchbar placeholder="Search for something..." onChange={onChangeQuery} />
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
