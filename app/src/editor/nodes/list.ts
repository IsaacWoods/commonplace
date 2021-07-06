import { Functionality } from '../functionality';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { EditorState, Transaction } from 'prosemirror-state';
import { splitListItem, liftListItem, wrapInList } from 'prosemirror-schema-list';
import { NodeType } from 'prosemirror-model';
import { wrappingInputRule } from 'prosemirror-inputrules';

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
            }
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
