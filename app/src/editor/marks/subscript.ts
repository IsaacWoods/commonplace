import { Functionality, markInputRule } from '../functionality';
import { toggleMark } from 'prosemirror-commands';

export default class Subscript extends Functionality {
    mark() {
        return {
            name: "subscript",
            schema: {
                toDOM: () => ["sub"],
                parseDOM: [
                    { tag: "sub" }
                ],
            }
        };
    }

    keys(schema) {
        return {
            "Mod-=": toggleMark(schema.marks.subscript),
        };
    }
}
