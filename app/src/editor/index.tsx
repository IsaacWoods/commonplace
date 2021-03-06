import * as React from 'react';
import styled from 'styled-components';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import Functionalities, { Command, CommandConstructor } from './functionality';
import type { ZettelContent } from '../zettel';
import parseZettel from './parser';
import { useNavigate } from 'react-router-dom';

import History from './history';
import { InsertMenuOpener, InsertMenu } from './insert_menu';

import Doc from './nodes/doc';
import Text from './nodes/text';
import Paragraph from './nodes/paragraph';
import Heading from './nodes/heading';
import Divider from './nodes/divider';
import { List, ListItem } from './nodes/list';
import Image from './nodes/image';

import Bold from './marks/bold';
import Italic from './marks/italic';
import Highlight from './marks/highlight';
import Strikethrough from './marks/strikethrough';
import Link from './marks/link';
import Subscript from './marks/subscript';
import Superscript from './marks/superscript';

type Editor = {
    state: EditorState,
    view: EditorView,
    commands: Record<string, Command | CommandConstructor>,
}

const EditorContext = React.createContext<Editor | null>(null);

type ProviderProps = {
    children?: React.ReactNode,
    content: ZettelContent,
}

/*
 * An `EditorProvider` manages and provides the Prosemirror state and view to child components using React context.
 * This allows us to idiomatically separate the editor's UI into React components, while accessing the Prosemirror
 * state and view from wherever it is needed.
 *
 * The actual Prosemirror DOM is rendered by `EditorView`.
 */
export default function EditorProvider(props: ProviderProps) {
    const navigate = useNavigate();
    const [insertMenuOpen, openInsertMenu] = React.useState(false);

    const onClickLink = React.useCallback((href: string) => {
        if (href[0] === "/") {
            navigate(href);
        } else {
            window.open(href, "_blank");
        }
    }, [navigate]);

    const onOpenInsertMenu = React.useCallback(() => {
        openInsertMenu(true);
    }, [openInsertMenu]);

    const onCloseInsertMenu = React.useCallback(() => {
        openInsertMenu(false);
    }, [openInsertMenu]);

    const [functionalities] = React.useState(() => {
        return new Functionalities([
            new History(),
            new InsertMenuOpener(onOpenInsertMenu, onCloseInsertMenu),

            /*
             * Nodes
             */
            new Doc(),
            new Text(),
            new Paragraph(),
            new Heading(),
            new Divider(),
            new List(),
            new ListItem(),
            new Image(),

            /*
             * Marks
             */
             new Bold(),
             new Italic(),
             new Highlight(),
             new Strikethrough(),
             new Link(onClickLink),
             new Subscript(),
             new Superscript(),
        ]);
    });

    const [schema] = React.useState(() => functionalities.schema());
    const [commands] = React.useState(() => functionalities.commands(schema));

    const [state, setState] = React.useState(() => {
        return EditorState.create({
            doc: parseZettel(schema, props.content),
            schema,
            plugins: functionalities.plugins(schema),
        });
    });

    const [view] = React.useState(() => {
        return new EditorView(undefined, {
            state,
            dispatchTransaction: (transaction) => {
                const newState = view.state.apply(transaction);
                view.updateState(newState);
                // This triggers an update of the React component, tying Prosemirror and React together correctly
                setState(newState);
            }
        })
    });

    const context = React.useMemo(() => ({ state, view, commands }), [state, view, commands]);

    return (
        <EditorContext.Provider value={context}>
            {props.children}
            {insertMenuOpen && <InsertMenu onClose={onCloseInsertMenu} />}
        </EditorContext.Provider>
    );
}

export const useEditor = (): Editor => {
    const context = React.useContext(EditorContext);

    if (!context) {
        throw new Error("`useEditor` can only be used within an EditorProvider component");
    }

    return context;
};
