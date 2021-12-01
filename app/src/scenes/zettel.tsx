import * as React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import Scene from '../components/scene';
import Header, { Action } from '../components/header';
import Button from '../components/button';
import CenteredContent from '../components/centered';
import Flex from '../components/flex';
import TextareaAutosize from 'react-autosize-textarea';
import EditorProvider from '../editor';
import EditorView from '../editor/view';
import ChangeReporter from '../editor/change_reporter';
import type { ZettelContent } from '../zettel';
import { fetch_zettel, update_zettel, ZettelCache } from '../zettel';
import { debounce } from 'lodash';

function ZettelEditor(props: { id: number }) {
    const zettelCache = React.useContext(ZettelCache);
    const [zettel, setZettel] = React.useState(null);

    React.useEffect(() => {
        // See if the Zettel is already in the cache
        const zettel = zettelCache.state.zettels.get(props.id);
        if (zettel) {
            setZettel(zettel);
            return;
        }

        fetch_zettel(props.id).then((result) => {
            setZettel(result);
            zettelCache.dispatch({ type: "updateZettel", id: props.id, zettel: result });
        }).catch((error) => {
            console.log("Error: ", error);
        });
    }, [props.id]);

    const DEBOUNCE_SAVE_MS = 1200;
    const debouncedSave = React.useCallback(debounce(async (zettel) => {
        zettelCache.dispatch({ type: "updateZettel", id: props.id, zettel });
        await update_zettel(props.id, { title: zettel.title, content: zettel.content });
    }, DEBOUNCE_SAVE_MS), []);
    React.useEffect(() => {
        if (zettel) {
            debouncedSave(zettel);
        }
    }, [zettel, debouncedSave]);

    const onChange = React.useCallback((content: ZettelContent) => {
        setZettel((zettel) => ({ ...zettel, content }));
    }, [setZettel]);

    const onChangeTitle = React.useCallback((event: React.SyntheticEvent<HTMLTextAreaElement>) => {
        setZettel((zettel) => ({ ...zettel, title: (event.target as HTMLTextAreaElement).value }));
    }, [setZettel]);

    return (
        <>
            <Header title={zettel ? zettel.title : "Loading Zettel..."} />
            <CenteredContent>
                { zettel ?
                    <Flex auto column>
                        <Title defaultValue={zettel.title} placeholder="Add a title..." onChange={onChangeTitle} />
                        <EditorProvider content={zettel.content}>
                            <ChangeReporter onChange={onChange} />
                            <EditorView />
                        </EditorProvider>
                    </Flex>
                : <></>}
            </CenteredContent>
        </>
    );
}

export default function Zettel() {
    const id = parseInt(useParams().id);
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

    font-size: 3em;
    font-weight: 500;
    line-height: 1.25;

    background: ${props => props.theme.background};
    transition: background 100ms ease-in-out;
    color: ${props => props.theme.text};
    -webkit-text-fill-color: ${props => props.theme.text};

    &::placeholder {
        color: ${props => props.theme.placeholder};
        -webkit-text-fill-color: ${props => props.theme.placeholder};
    }
`;
