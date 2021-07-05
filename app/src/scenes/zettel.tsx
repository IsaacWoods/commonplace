import * as React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import Scene from '../components/scene';
import Header from '../components/header';
import CenteredContent from '../components/centered';
import Flex from '../components/flex';
import TextareaAutosize from 'react-autosize-textarea';
import EditorProvider from '../editor';
import EditorView from '../editor/view';
import { fetch_zettel } from '../zettel';

function ZettelEditor(props: { id: number }) {
    const [zettel, setZettel] = React.useState(null);

    React.useEffect(() => {
        fetch_zettel(props.id).then((result) => {
            setZettel(result);
        }).catch((error) => {
            console.log("Error: ", error);
        });
    }, [props.id]);

    return (
        <>
            <Header title={zettel ? zettel.title : "Loading Zettel..."} />
            <CenteredContent>
                { zettel ?
                    <Flex auto column>
                        <Title defaultValue={zettel.title} placeholder="Add a title..." />
                        { /* TODO: pass Zettel contents into Prosemirror somehow */ }
                        <EditorProvider>
                            <EditorView />
                        </EditorProvider>
                    </Flex>
                : <></>}
            </CenteredContent>
        </>
    );
}

export default function Zettel() {
    const id = parseInt(useParams<{ id: string }>().id);
    return (
        <Scene>
            <ZettelEditor key={id} id={id} />
        </Scene>
    );
}

const Title = styled(TextareaAutosize)`
    outline: none;
    border: 0;
    resize: none;
    padding: 0;
    margin-top: 1em;
    margin-bottom: 0.5em;

    font-size: 2.25em;
    font-weight: 500;
    line-height: 1.25;

    background: ${(props) => props.theme.background};
    transition: background 100ms ease-in-out;
    color: ${(props) => props.theme.text};
    -webkit-text-fill-color: ${(props) => props.theme.text};

    &::placeholder {
        color: ${(props) => props.theme.placeholder};
        -webkit-text-fill-color: ${(props) => props.theme.placeholder};
    }
`;
