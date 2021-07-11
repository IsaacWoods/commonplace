import * as React from 'react';
import styled from 'styled-components';
import { Portal } from 'react-portal';
import { Functionality } from './functionality';
import { InputRule } from 'prosemirror-inputrules';
import { Schema } from 'prosemirror-model';
import { Plugin, EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { findParentNode } from 'prosemirror-utils';
import { useEditor } from '.';

export class InsertMenuOpener extends Functionality {
    onOpen: () => void;
    onClose: () => void;

    constructor(onOpen, onClose) {
        super();
        this.onOpen = onOpen;
        this.onClose = onClose;
    }

    plugins() {
        return [
            new Plugin({
                props: {
                    decorations: (state: EditorState) => {
                        const parent = findParentNode(({ type }) => type.name === "paragraph")(state.selection);
                        const isTopLevel = state.selection.$from.depth === 1;

                        if (!parent || !isTopLevel) {
                            this.onClose();
                            return;
                        }

                        const pos = parent.pos;
                        const isEmpty = parent.node.content.size === 0;
                        const isSlash = parent.node.textContent === '/';
                        const isSearch = parent.node.textContent.startsWith('/');

                        if (isEmpty) {
                            this.onClose();
                            const text = 'Type / to use the slash commands...';
                            return DecorationSet.create(state.doc, [
                                Decoration.node(pos, pos + parent.node.nodeSize, {
                                    class: "placeholder",
                                    "data-text": "Type '/' for commands...",
                                }),
                            ]);
                        }

                        if (isSlash) {
                            this.onOpen();
                            const text = 'Type to filter...';
                            return DecorationSet.create(state.doc, [
                                Decoration.node(pos, pos + parent.node.nodeSize, {
                                    class: "placeholder add-padding-for-slash",
                                    "data-text": "Keep typing to filter...",
                                }),
                            ]);
                        }

                        if (isSearch) {
                            this.onOpen();
                            return null;
                        }

                        this.onClose();
                        return null;
                    },
                },
            })
        ];
    }
}

type Props = {
    onClose: () => void;
}

export function InsertMenu(props: Props) {
    const { view } = useEditor();
    const position = view.coordsAtPos(view.state.selection.from);

    return (
        <Portal>
            <Container left={position.left} top={position.top + 20}>
                <p>Menu goes here</p>
            </Container>
        </Portal>
    );
}

const Container = styled.div<{left: number, top: number}>`
    * {
        box-sizing: border-box;
    }

    position: absolute;
    left: ${props => props.left}px;
    top: ${props => props.top}px;

    background-color: ${props => props.theme.sidebarColor};
    color: ${props => props.theme.text};

    font-family: ${props => props.theme.fontFamily};
`;
