import { Functionality, markInputRule } from '../functionality';
import { toggleMark } from 'prosemirror-commands';

export default class Bold extends Functionality {
    mark() {
        return {
            name: "bold",
            schema: {
                toDOM: () => ["strong"],
                parseDOM: [
                    { tag: "b" },
                    { tag: "strong" },
                    { style: "font-style", getAttrs: value => (value === "bold") },
                ],
            }
        }
    }

    keys(schema) {
        return {
            "Mod-b": toggleMark(schema.marks.bold),
        };
    }

    inputRules(schema) {
        return [
            markInputRule(/(?:\*\*)([^*]+)(?:\*\*)$/, schema.marks.bold),
        ];
    }
}
