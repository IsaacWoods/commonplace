import * as React from 'react';
import styled from 'styled-components';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import Functionalities from './functionality';

export default function Editor() {
    const viewElementRef = React.useRef<HTMLDivElement>();
    const viewRef = React.useRef<EditorView<any>>();

    React.useEffect(() => {
        const functionalities = new Functionalities([]);
        const state = EditorState.create({
            schema: functionalities.schema(),
        });
        const view = new EditorView(viewElementRef.current, { state });

        viewRef.current = view;
    }, []);

    return (<div ref={viewElementRef} />);
}
