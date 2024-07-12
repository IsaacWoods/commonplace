import * as React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import Scene from '../components/scene';
import Header, { Action } from '../components/header';
import Button from '../components/button';
import CenteredContent from '../components/centered';
import Flex from '../components/flex';
import TextareaAutosize from 'react-textarea-autosize';
import { fetch_zettel, update_zettel, ZettelContext } from '../zettel';
import { debounce } from 'lodash';

import { EditorProvider, useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const extensions = [StarterKit];

function ZettelEditor(props: { id: number }) {
    const zettelContext = React.useContext(ZettelContext);
    const [zettel, setZettel] = React.useState(null);

    const editor = useEditor({
        extensions,
        content: '<p>Hello there!</p>',

        onUpdate: ({editor}) => {
            const json = editor.getJSON();
            setZettel((zettel) => ({ ...zettel, content: json }));
        }
    });

    const DEBOUNCE_SAVE_MS = 1200;
    const debouncedSave = React.useCallback(debounce(async (zettel) => {
        await update_zettel(props.id, { title: zettel.title, content: zettel.content });
    }, DEBOUNCE_SAVE_MS), []);
    React.useEffect(() => {
        if (zettel) {
            debouncedSave(zettel);
        }
    }, [zettel, debouncedSave]);

    const onChange = React.useCallback((content: any) => {
        setZettel((zettel) => ({ ...zettel, content }));
    }, [setZettel]);

    const onChangeTitle = React.useCallback((event: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const newTitle = (event.target as HTMLTextAreaElement).value;
        setZettel((zettel) => ({ ...zettel, title: newTitle }));
        zettelContext.dispatch({ type: "updateTitle", id: props.id, title: newTitle });
    }, [setZettel]);

    const onTitleKeyUp = React.useCallback((event) => {
        if (event.key === "Enter") {
            console.log("Enter detected in title");
            // TODO: hmm what we should do here to move focus to the prosemirror editor is not actually obvious...
            // I wonder if we can expose the view through a ref somehow and then focus via that? (idk if calling
            // focus on the view is even the right approach ngl)
        }
    }, []);

    React.useEffect(() => {
        setZettel({title: "", content: []});
        fetch_zettel(props.id).then((result) => {
            setZettel(result);
            if (editor) {
                editor.commands.setContent(result.content);
            }
        }).catch((error) => {
            console.log("Error: ", error);
        });
    }, [props.id, editor]);

    return (
        <>
            <Header title={zettel ? zettel.title : "Loading Zettel..."} />
            <CenteredContent>
                { zettel ?
                    <Flex auto column>
                        <Title defaultValue={zettel.title} placeholder="Add a title..." onChange={onChangeTitle} onKeyUp={onTitleKeyUp} />
                        <EditorContent editor={editor} />
                        <FloatingMenu editor={editor}>This is a floating menu</FloatingMenu>
                        <BubbleMenu editor={editor}>This is a bubble menu</BubbleMenu>
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
