import { Functionality } from '../functionality';
import { InputRule } from 'prosemirror-inputrules';

export default class Image extends Functionality {
    node() {
        return {
            name: "image",
            schema: {
                attrs: {
                    src: { default: "" },
                    alt: { default: "" },
                },
                content: "text*",
                group: "block",
                selectable: true,
                draggable: true,
                toDOM: (node) => ["img", { src: node.attrs.src, alt: node.attrs.alt }, 0],
                parseDOM: [ { tag: "img", getAttrs(dom) { return { src: dom.src, alt: dom.alt } } } ],
            }
        };
    }

    inputRules(schema) {
        return [
            new InputRule(/!\[(?<alt>[^\][]*?)]\((?<src>[^\][]*?)\)$/, (state, match, start, end) => {
                const [, alt, src] = match;
                const { tr } = state;

                tr.replaceWith(start, end, schema.nodes.image.create({ src, alt }));
                return tr;
            }),
        ];
    }
}
