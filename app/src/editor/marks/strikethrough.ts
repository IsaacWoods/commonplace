import { Functionality, markInputRule } from '../functionality';
import { toggleMark } from 'prosemirror-commands';

export default class Strikethrough extends Functionality {
    mark() {
        return {
            name: "strikethrough",
            schema: {
                toDOM: () => ["s"],
                parseDOM: [
                    { tag: "s" },
                    { tag: "del" },
                    { style: "text-decoration", getAttrs: value => (value === "line-through") },
                ],
            }
        }
    }

    keys(schema) {
        return {
            "Mod-d": toggleMark(schema.marks.strikethrough),
        };
    }

    inputRules(schema) {
        return [
            markInputRule(/~([^~]+)~/, schema.marks.strikethrough),
        ];
    }
}
