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

    return (<StyledView ref={viewRef} />);
}

const StyledView = styled.div`
    .ProseMirror {
        position: relative;
        outline: none;
        word-wrap: break-word;
        white-space: pre-wrap;
        white-space: break-spaces;
        -webkit-font-variant-ligatures: none;
        font-variant-ligatures: none;
    }

    pre {
        white-space: pre-wrap;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin: 1em 0 0;
    }
    hr {
        position: relative;
        border: 0;
        border-top: 1px solid ${props => props.theme.divider};
    }
`;
