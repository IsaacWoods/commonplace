import { Functionality } from './functionality';
import { history, undo, redo } from 'prosemirror-history';

export default class History extends Functionality {
    plugins() {
        return [
            history(),
        ];
    }

    keys() {
        return {
            "Mod-z": undo,
            "Mod-y": redo,
        };
    }
}
