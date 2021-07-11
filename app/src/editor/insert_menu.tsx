import * as React from 'react';
import styled from 'styled-components';
import { Portal } from 'react-portal';
import { Functionality, Command, CommandConstructor } from './functionality';
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
    const { view, commands } = useEditor();
    const position = view.coordsAtPos(view.state.selection.from);

    const doCommand = React.useCallback((command: Command) => () => {
        view.focus();

        // Get rid of the '/'
        const parent = findParentNode(node => !!node)(view.state.selection);
        view.dispatch(view.state.tr.insertText("", parent.pos, view.state.selection.to));

        (command)(view.state, view.dispatch);
        props.onClose();
    }, [view, props.onClose]);

    return (
        <Portal>
            <Container left={position.left} top={position.top + 20}>
                <List>
                    <li><Item onClick={doCommand((commands.insertHeader as CommandConstructor)({ level: 1 }))}>Header 1</Item></li>
                    <li><Item onClick={doCommand((commands.insertHeader as CommandConstructor)({ level: 2 }))}>Header 2</Item></li>
                    <li><Item onClick={doCommand((commands.insertHeader as CommandConstructor)({ level: 3 }))}>Header 3</Item></li>
                    <li><Item onClick={doCommand((commands.insertHeader as CommandConstructor)({ level: 4 }))}>Header 4</Item></li>
                    <li><Item onClick={doCommand(commands.insertDivider as Command)}>Divider</Item></li>
                </List>
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

    background-color: ${props => props.theme.insertMenuBackground};
    color: ${props => props.theme.text};
    font-family: ${props => props.theme.fontFamily};

    border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(10, 10, 10, 0.05), 0 3px 6px rgba(10, 10, 10, 0.1), 0 9px 24px rgba(10, 10, 10, 0.2);
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    height: 100%;
    text-align: left;
`;

const Item = styled.button`
    border: none;
    outline: none;
    background: none;
    color: ${props => props.theme.text};
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    width: 100%;
    height: 40px;

    font-weight: 500;
    font-size: 14px;
    line-height: 1;

    &:hover {
        background: ${props => props.theme.insertMenuSelected};
        color: black;
    }
`;
