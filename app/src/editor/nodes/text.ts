import { Functionality } from '../functionality';

export default class Text extends Functionality {
    node() {
        return {
            name: "text",
            schema: { group: "inline" },
        };
    }
}
