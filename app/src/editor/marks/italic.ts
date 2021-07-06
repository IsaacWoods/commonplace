import { Functionality, markInputRule } from '../functionality';
import { toggleMark } from 'prosemirror-commands';

export default class Italic extends Functionality {
    mark() {
        return {
            name: "italic",
            schema: {
                toDOM: () => ["em"],
                parseDOM: [
                    { tag: "i" },
                    { tag: "em" },
                    { style: "font-style", getAttrs: value => (value === "italic") },
                ],
            }
        }
    }

    keys(schema) {
        return {
            "Mod-i": toggleMark(schema.marks.italic),
        };
    }

    inputRules(schema) {
        return [
            markInputRule(/(?:^|[^*])(\*([^*]+)\*)$/, schema.marks.italic),
        ];
    }
}
