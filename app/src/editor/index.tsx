import * as React from 'react';
import styled from 'styled-components';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import Functionalities from './functionality';
import type { ZettelContent } from '../zettel';
import parseZettel from './parser';

import Doc from './nodes/doc';
import Text from './nodes/text';
import Paragraph from './nodes/paragraph';

import Bold from './marks/bold';
import Italic from './marks/italic';
import Highlight from './marks/highlight';

type Editor = {
    state: EditorState,
    view: EditorView,
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
    const [functionalities] = React.useState(() => {
        return new Functionalities([
            /*
             * Nodes
             */
            new Doc(),
            new Text(),
            new Paragraph(),

            /*
             * Marks
             */
             new Bold(),
             new Italic(),
             new Highlight(),
        ]);
    });

    const [schema] = React.useState(() => functionalities.schema());

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

    const context = React.useMemo(() => ({ state, view }), [state, view]);

    return (
        <EditorContext.Provider value={context}>
            {props.children}
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
