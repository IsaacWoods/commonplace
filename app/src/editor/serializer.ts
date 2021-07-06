import { Node, Mark as ProseMark } from 'prosemirror-model';
import { ZettelContent, Block, Inline, ListItem, Mark, MarkType } from '../zettel';

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
            return {
                type: "Text",
                text: node.text,
                marks: node.marks.map((mark) => serializeMark(mark)),
            };
        default:
            throw new Error(`Unrecognized node type while serializing an inline: ${node.type.name}`);
    }
}

function serializeListItem(node: Node): ListItem {
    let blocks = [];
    node.content.forEach((node, _, i) => { blocks.push(serializeBlock(node)); });
    return { blocks };
}

function serializeMark(mark: ProseMark): Mark {
    switch (mark.type.name) {
        case "bold":
            return { type: "Bold" };
        case "italic":
            return { type: "Italic" };
        case "strikethrough":
            return { type: "Strikethrough" };
        case "highlight":
            return { type: "Highlight" };
        case "link":
            return {
                type: "Link",
                href: mark.attrs.href,
            };
        default:
            throw new Error(`Unrecognized mark type: ${mark.type.name}`);
    }
}
