import { Functionality } from '../functionality';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { setBlockType } from 'prosemirror-commands';

const LEVELS = [1, 2, 3, 4, 5, 6];

export default class Heading extends Functionality {
    node() {
        return {
            name: "heading",
            schema: {
                attrs: {
                    level: { default: 1 },
                },
                content: "inline*",
                group: "block",
                toDOM: (node) => [`h${node.attrs.level}`, 0],
                parseDOM: LEVELS.map((level) => ({ tag: `h${level}`, attrs: { level } })),
            }
        }
    }

    inputRules(schema) {
        return LEVELS.map((level) => textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), schema.nodes.heading, () => ({ level })));
    }

    commands(schema) {
        return {
            insertHeader: ({ level }) => setBlockType(schema.nodes.heading, { level }),
        }
    }
}
