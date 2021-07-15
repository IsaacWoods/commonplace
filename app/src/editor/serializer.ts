import { Node, Mark as ProseMark } from 'prosemirror-model';
import { ZettelContent, Block, Inline, ListItem, Mark } from '../zettel';

export default function serializeDoc(content: Node): ZettelContent {
    let blocks = [];

    // `Node` doesn't have a `map` :(
    content.forEach((node, _, i) => {
        blocks.push(serializeBlock(node));
    });

    return blocks;
}

function serializeBlock(node: Node): Block {
    switch (node.type.name) {
        case "paragraph": {
            let inlines = [];
            node.content.forEach((node, _, i) => { inlines.push(serializeInline(node)); });
            return { type: "Paragraph", inlines };
        }
        case "heading": {
            let inlines = [];
            node.content.forEach((node, _, i) => { inlines.push(serializeInline(node)); });
            return { type: "Heading", level: node.attrs.level, inlines };
        }
        case "divider": {
            return { type: "Divider" };
        }
        case "list": {
            let items = [];
            node.content.forEach((node, _, i) => { items.push(serializeListItem(node)); });
            return { type: "List", items };
        }
        default:
            throw new Error(`Unrecognized node type while serializing a block: ${node.type.name}`);
    }
}

function serializeInline(node: Node): Inline {
    switch (node.type.name) {
        case "text":
            const { marks, link_href } = serializeMarks(node.marks);
            if (link_href === null) {
                return {
                    type: "Text",
                    text: node.text,
                    marks,
                };
            } else {
                return {
                    type: "Link",
                    text: node.text,
                    href: link_href,
                    marks,
                };
            }
        default:
            throw new Error(`Unrecognized node type while serializing an inline: ${node.type.name}`);
    }
}

function serializeListItem(node: Node): ListItem {
    let blocks = [];
    node.content.forEach((node, _, i) => { blocks.push(serializeBlock(node)); });
    return { blocks };
}

type MarksParse = {
    marks: Mark[],
    link_href: null | string,
}

function serializeMarks(prose_marks: ProseMark[]): MarksParse {
    let link_href = null;
    const marks = prose_marks.flatMap((mark): Mark[] => {
        switch (mark.type.name) {
            case "bold":
                return ["Bold"];
            case "italic":
                return ["Italic"];
            case "strikethrough":
                return ["Strikethrough"];
            case "highlight":
                return ["Highlight"];
            case "link":
                link_href = mark.attrs.href;
                return [];
            default:
                throw new Error(`Unrecognized mark type: ${mark.type.name}`);
        }
    });

    return { marks, link_href };
}
