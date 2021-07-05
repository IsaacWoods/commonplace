import * as React from 'react';
import styled from 'styled-components';
import { useEditor } from '.';

export default function EditorView() {
    const { view } = useEditor();

    const viewRef = React.useCallback((element: HTMLDivElement | null) => {
        if (element) {
            element.appendChild(view.dom);
        }
    }, [view]);

    return (<div ref={viewRef} />);
}
