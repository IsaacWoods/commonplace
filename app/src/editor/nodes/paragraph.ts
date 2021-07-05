import { Functionality } from '../functionality';

export default class Paragraph extends Functionality {
    node() {
        return {
            name: "paragraph",
            schema: {
                content: "inline*",
                group: "block",
                toDOM: () => ["p", 0],
                parseDOM: [{ tag: "p" }],
            }
        }
    }
}
