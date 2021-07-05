import { Functionality } from '../functionality';

export default class Doc extends Functionality {
    node() {
        return {
            name: "doc",
            schema: { content: "block+" },
        };
    }
}
