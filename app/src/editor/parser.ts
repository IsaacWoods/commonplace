import { Schema, Node, Mark as ProseMark } from 'prosemirror-model';
import type { ZettelContent, Block, ListItem, Inline, Mark } from '../zettel';

export default function parseZettel(schema: Schema, content: ZettelContent): Node {
    // `doc` nodes must contain at least one block, so don't try to create one with no content in
    if (content.length === 0) {
        return null;
    }

    return schema.node("doc", null, content.map((block) => parseBlock(schema, block)));
}

function parseBlock(schema: Schema, block: Block): Node {
    switch (block.type) {
        case "Paragraph":
            return schema.node("paragraph", null, block.inlines.map((inline) => parseInline(schema, inline)));
        case "Heading":
            return schema.node("heading", { level: block.level }, block.inlines.map((inline) => parseInline(schema, inline)));
        case "Divider":
            return schema.node("divider", null, []);
        default:
            throw new Error(`Can't find parser for block of type ${block.type}`);
    }
}

function parseInline(schema: Schema, inline: Inline) {
    switch (inline.type) {
        case "Text":
            const marks = inline.marks.map((mark) => parseMark(schema, mark));
            return schema.text(inline.text, marks);
        default:
            throw new Error(`Can't find parser for inline of type ${inline.type}`);
    }
}

function parseMark(schema: Schema, mark: Mark): ProseMark {
  switch (mark.type) {
    case "Bold":
      return schema.mark("bold");
    case "Italic":
      return schema.mark("italic");
    case "Strikethrough":
      return schema.mark("strikethrough");
    case "Highlight":
      return schema.mark("highlight");
    case "Link":
      return schema.mark("link", { href: mark.href });
    default:
      throw new Error(`Invalid mark with name: ${mark}`);
  }
}
