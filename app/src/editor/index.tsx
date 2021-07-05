import * as React from 'react';
import styled from 'styled-components';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import Functionalities from './functionality';

import Doc from './nodes/doc';
import Text from './nodes/text';
import Paragraph from './nodes/paragraph';

export default function Editor() {
    const viewElementRef = React.useRef<HTMLDivElement>();
    const viewRef = React.useRef<EditorView<any>>();

    React.useEffect(() => {
        const functionalities = new Functionalities([
            new Doc(),
            new Text(),
            new Paragraph(),
        ]);
        const schema = functionalities.schema();
        const state = EditorState.create({
            schema,
        });
        const view = new EditorView(viewElementRef.current, { state });

        viewRef.current = view;
    }, []);

    return (<div ref={viewElementRef} />);
}
