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

function ZettelEditor(props: { id: number }) {
    const zettelCache = React.useContext(ZettelCache);
    const [zettel, setZettel] = React.useState(null);

    /*
     * We independently track whether the title and content are dirty - whether they've been changed since the last
     * update was sent. This allows us to avoid sending an update at all if one is not needed, and if one is, only
     * includes the fields that have actually changed.
     */
    const [isTitleDirty, setTitleDirty] = React.useState(false);
    const [isContentDirty, setContentDirty] = React.useState(false);

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

    /*
     * We want to save the Zettel when the editor is unmounted, but we can't access the state in `zettel` for this.
     * Instead, we store the Zettel in a ref, which lasts for the entire lifetime of the component, and use that to
     * access the Zettel during cleanup.
     */
    const zettelRef = React.useRef();
    React.useEffect(() => { zettelRef.current = zettel; }, [zettel]);
    React.useEffect(() => {
        return () => {
            if (zettelRef.current) {
                update_zettel(props.id, zettelRef.current);
                zettelCache.dispatch({ type: "updateZettel", id: props.id, zettel: zettelRef.current });
            }
        };
    }, []);

    const onChange = React.useCallback((content: ZettelContent) => {
        setZettel((zettel) => ({ ...zettel, content }));
        setContentDirty(true);
    }, [setZettel]);

    const onChangeTitle = React.useCallback((event: React.SyntheticEvent<HTMLTextAreaElement>) => {
        setZettel((zettel) => ({ ...zettel, title: (event.target as HTMLTextAreaElement).value }));
        setTitleDirty(true);
    }, [setZettel]);

    const onSave = React.useCallback(() => {
        if (zettel && (isTitleDirty || isContentDirty)) {
            const update = {
                title: isTitleDirty ? zettel.title : undefined,
                content: isContentDirty ? zettel.content: undefined,
            };
            update_zettel(props.id, update);
            zettelCache.dispatch({ type: "updateZettel", id: props.id, zettel });

            setTitleDirty(false);
            setContentDirty(false);
        }
    }, [props.id, zettel, update_zettel, isTitleDirty, isContentDirty]);

    return (
        <>
            <Header title={zettel ? zettel.title : "Loading Zettel..."} actions={
                <Action><Button onClick={onSave}>Save</Button></Action>
            } />
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
