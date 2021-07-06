import { Functionality } from '../functionality';
import { InputRule } from 'prosemirror-inputrules';

export default class Divider extends Functionality {
    node() {
        return {
            name: "divider",
            schema: {
                group: "block",
                toDOM: () => ["hr"],
                parseDOM: [{ tag: "hr" }],
            },
        };
    }

    // Create dividers with `---`, `___`, or `***`
    inputRules(schema) {
        return [
            new InputRule(/^(?:---|___|\*\*\*)$/, (state, match, start, end) => {
                const { tr } = state;

                if (match[0]) {
                    tr.replaceWith(start - 1, end, schema.nodes.divider.create());
                }

                return tr;
            })
        ];
    }

    commands(schema) {
        return {
            "insertDivider": (state, dispatch) => {
                if (dispatch) dispatch(state.tr.replaceSelectionWith(schema.nodes.divider.create()));
                return true;
            }
        }
    }
}
