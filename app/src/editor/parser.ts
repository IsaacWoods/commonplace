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
    default:
      throw new Error(`Can't find parser for block of type ${block.type}`);
  }
}

function parseInline(schema: Schema, inline: Inline) {
  switch (inline.type) {
    case "Text":
      return schema.text(inline.text, []);
    default:
      throw new Error(`Can't find parser for inline of type ${inline.type}`);
  }
}
