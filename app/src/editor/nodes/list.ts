import { Functionality } from '../functionality';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { EditorState, Transaction } from 'prosemirror-state';
import { splitListItem, sinkListItem, liftListItem, wrapInList } from 'prosemirror-schema-list';
import { NodeType } from 'prosemirror-model';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { findParentNode } from 'prosemirror-utils';

export class ListItem extends Functionality {
    node() {
        return {
            name: "list_item",
            schema: {
                content: "paragraph block*",
                defining: true,
                toDOM: () => ["li", 0],
                parseDOM: [{ tag: "li" }],
            }
        }
    }

    keys(schema) {
        return {
            "Enter": splitListItem(schema.nodes.list_item),
            "Shift-Enter": (state, dispatch) => {
                /*
                 * When Shift-Enter is pressed, we extend the current list item, allowing multiple blocks to be
                 * placed under a single item.
                 */
                if (!isInList(state) || !state.selection.empty) {
                    return false;
                }

                if (dispatch) dispatch(state.tr.split(state.selection.to));
                return true;
            },
            "Tab": sinkListItem(schema.nodes.list_item),
            "Shift-Tab": liftListItem(schema.nodes.list_item),
        }
    }
}

export class List extends Functionality {
    node() {
        return {
            name: "list",
            schema: {
                content: "list_item+",
                group: "block",
                toDOM: () => ["ul", 0],
                parseDOM: [{ tag: "ul" }],
            }
        }
    }

    inputRules(schema) {
        return [
            wrappingInputRule(/^\s*([-*])\s*$/, schema.nodes.list),
        ];
    }

    keys(schema) {
        return {
            "Mod-Shift-8": toggleList(schema.nodes.list, schema.nodes.list_item),
        };
    }
}

function toggleList(listType: NodeType, itemType: NodeType) {
    return (state: EditorState, dispatch: (tr: Transaction) => void) => {
        const { schema, selection } = state;
        const { $from, $to } = selection;
        const range = $from.blockRange($to);

        if (!range) {
            return false;
        }

        const parentList = findParentNode(node => isList(node, schema))(selection);
        if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
            if (parentList.node.type === listType) {
                return liftListItem(itemType)(state, dispatch);
            }

            if (isList(parentList.node, schema) && listType.validContent(parentList.node.content)) {
                const { tr } = state;
                tr.setNodeMarkup(parentList.pos, listType);

                if (dispatch) dispatch(tr);
                return false;
            }
        }

        return wrapInList(listType)(state, dispatch);
    };
}

function isList(node, schema) {
    return (node.type === schema.nodes.list);
}

function isInList(state) {
    for (let d = state.selection.$head.depth; d > 0; d--) {
        const name = state.selection.$head.node(d).type.name;
        if (name === "list") {
            return true;
        }
    }

    return false;
}
