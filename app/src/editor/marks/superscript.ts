import { Functionality, markInputRule } from '../functionality';
import { toggleMark } from 'prosemirror-commands';

export default class Superscript extends Functionality {
    mark() {
        return {
            name: "superscript",
            schema: {
                toDOM: () => ["sup"],
                parseDOM: [
                    { tag: "sup" }
                ],
            }
        };
    }

    keys(schema) {
        return {
            "Mod-Shift-=": toggleMark(schema.marks.superscript),
        };
    }
}
