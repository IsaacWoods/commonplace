import { Functionality, markInputRule } from '../functionality';
import { toggleMark } from 'prosemirror-commands';

export default class Highlight extends Functionality {
    mark() {
        return {
            name: "highlight",
            schema: {
                toDOM: () => ["mark"],
                parseDOM: [
                    { tag: "mark" },
                ],
            }
        }
    }

    keys(schema) {
        return {
            "Mod-h": toggleMark(schema.marks.highlight),
        };
    }

    inputRules(schema) {
        return [
            markInputRule(/(?:==)([^=]+)(?:==)/, schema.marks.highlight),
        ];
    }
}
