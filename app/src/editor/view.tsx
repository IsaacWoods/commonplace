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
        padding-bottom: 800px;
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

        &:before {
            display: inline-block;
            color: ${props => props.theme.placeholder};
            font-size: 12px;
            font-family: ${props => props.theme.fontFamilyMono};
            margin-left: -20px;
            width: 20px;
            line-height: 0;
        }
    }
    h1:before { content: "H1"; }
    h2:before { content: "H2"; }
    h3:before { content: "H3"; }
    h4:before { content: "H4"; }
    h5:before { content: "H5"; }
    h6:before { content: "H6"; }

    p {
        margin: 0 0 0.5em 0;
        line-height: 1.5;
    }

    hr {
        position: relative;
        border: 0;
        border-top: 1px solid ${props => props.theme.divider};
    }

    ul {
        margin: 0;
    }

    .ProseMirror-gapcursor {
        display: none;
        pointer-events: none;
        position: absolute;
    }

    .ProseMirror-gapcursor:after {
        content: "";
        display: block;
        position: absolute;
        top: -2px;
        width: 20px;
        border-top: 1px solid black;
    }

    .ProseMirror-focused .ProseMirror-gapcursor {
        display: block;
    }

    .placeholder {
        position: relative;
        &:before {
            position: absolute;
            content: attr(data-text);
            color: ${props => props.theme.placeholder};
        }
    }

    .add-padding-for-slash:before {
        left: 0.5em;
    }
`;
