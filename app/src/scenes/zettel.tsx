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

import { EditorProvider, useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import ListKeymap from '@tiptap/extension-list-keymap';
import Link from '@tiptap/extension-link';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Image from '@tiptap/extension-image';
import Details from '@tiptap-pro/extension-details';
import DetailsContent from '@tiptap-pro/extension-details-content';
import DetailsSummary from '@tiptap-pro/extension-details-summary';

function ZettelEditor(props: { id: number }) {
    const zettelContext = React.useContext(ZettelContext);
    const [zettel, setZettel] = React.useState(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            // TODO: maybe configure for details summary too?
            Placeholder.configure({ includeChildren: true, placeholder: ({ node }) => {
                if (node.type.name === 'detailsSummary') {
                    return "Summary";
                }
                // TODO: can we detect if it's the first child??
                return "Write something..."
            }}),
            ListKeymap,
            // TODO: for some reason `defaultProtocol` is not found... investigate maybe at some point
            Link.configure({ openOnClick: true, autolink: true }),
            Superscript,
            Subscript,
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Image,
            Details.configure({ persist: true, HTMLAttributes: { class: 'details' }}),
            DetailsContent,
            DetailsSummary,
        ],
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

    const addImage = React.useCallback(() => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    return (
        <>
            <Header title={zettel ? zettel.title : "Loading Zettel..."} />
            <CenteredContent>
                { zettel ?
                    <Flex auto column>
                        <Title defaultValue={zettel.title} placeholder="Add a title..." onChange={onChangeTitle} onKeyUp={onTitleKeyUp} />
                        <StyledEditorContent editor={editor} />
                        <FloatingMenu editor={editor}>
                            <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() }>Table</button>
                            <button onClick={addImage}>Image</button>
                            <button onClick={() => editor.chain().focus().setDetails().run() }>Details</button>
                        </FloatingMenu>
                        <BubbleMenu editor={editor}>
                            This is a bubble menu
                        </BubbleMenu>
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

const StyledEditorContent = styled(EditorContent)`
    .tiptap {
        padding-bottom: 100px;

        /* This renders the placeholder from a custom attribute if the editor is empty */
        p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }

        blockquote {
            border-left: 3px solid #d0d0d0;
            margin: 1.5rem 0;
            padding-left: 1rem;
        }

        :first-child {
            margin-top: 0;
        }

        ul, ol {
            padding: 0 1rem;
            margin: 1.25rem 1rem 1.25rem 0.4rem;

            li p {
                margin-top: 0.25em;
                margin-bottom 0.25em;
            }
        }

        /* TODO: the checkbox isn't centered within the line - not sure why */
        ul[data-type="taskList"] {
            list-style: none;
            margin-left: 0;
            padding: 0;

            li {
                align-items: flex-start;
                display: flex;

                > label {
                    flex: 0 0 auto;
                    margin-right: 0.5rem;
                    user-select: none;
                }

                > div {
                    flex: 1 1 auto;
                }
            }

            input[type="checkbox"] {
                cursor: pointer;
            }

            ul[data-type="taskList"] {
                margin: 0;
            }
        }

        table {
            border-collapse: collapse;
            margin: 0;
            overflow: hidden;
            table-layout: fixed;
            width: 100%;

            td, th {
                border: 1px solid #d0d0d0;
                box-sizing: border-box;
                min-width: 1em;
                padding: 6px 8px;
                position: relative;
                vertical-align: top;

                > * {
                    margin-bottom: 0;
                }
            }

            th {
                background-color: #e1e5eb;
                font-weight: bold;
                text-align: left;
            }

            .selectedCell:after {
                background-color: #a3a3a3;
                content: "";
                left: 0; right: 0; top: 0; bottom: 0;
                pointer-events: none;
                position: absolute;
                z-index: 2;
            }

            .column-resize-handle {
                background-color: #3e555e;
                bottom: -2px;
                pointer-events: none;
                position: absolute;
                right: -2px;
                top: 0;
                width: 4px;
            }
        }

        .tableWrapper {
            margin: 1.5rem 0;
            overflow-x: auto;
        }

        &.resize-cursor {
            cursor: ew-resize;
            cursor: col-resize;
        }

        code {
            background-color: #d8e3e8;
            border-radius: 0.4rem;
            color: black;
            font-size: 0.85rem;
            padding: 0.25em 0.3em;
        }

        pre {
            background: black;
            border-radius: 0.5rem;
            color: white;
            font-family: 'JetBrainsMono', monospace;
            margin: 1.5rem 0;
            padding: 0.75rem 1rem;

            code {
                background: none;
                color: inherit;
                font-size: 0.8rem;
                padding: 0;
            }
        }

        .details {
            display: flex;
            gap: 0.25rem;
            margin: 1.5rem 0;
            border: 1px solid #d0d0d0;
            border-radius: 0.5rem;
            padding: 0.5rem;

            summary {
                font-weight: 700;

                &::marker {
                    content: "";
                }
            }

            /* Summary placeholder */
            .is-empty::before {
                color: #adb5bd;
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
            }

            > button {
                align-items: center;
                background: transparent;
                border-radius: 4px;
                display: flex;
                font-size: 0.625rem;
                width: 1.25rem;
                height: 1.25rem;
                justify-content: center;
                line-height: 1;
                margin-top: 0.1rem;
                padding: 0;

                &:hover {
                    background-color: #d0d0d0;
                }

                &::before {
                    content: '\\25B6';
                }
            }

            &.is_open > button::before {
                transform: rotate(90deg);
            }

            > div {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                width: 100%;

                > [data-type="detailsContent"] > :last-child {
                    margin-bottom: 0.5rem;
                }
            }

            .details {
                margin: 0.5rem 0;
            }
        }
    }
`;
