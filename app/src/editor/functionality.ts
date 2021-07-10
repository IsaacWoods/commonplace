import { EditorState, Plugin } from 'prosemirror-state';
import { Schema, Mark, MarkType } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { inputRules, InputRule } from 'prosemirror-inputrules';
import { gapCursor } from 'prosemirror-gapcursor';

export type Command = (state: EditorState, dispatch) => boolean;
export type CommandConstructor = (attrs) => ((state: EditorState, dispatch) => boolean);

type NodeEntry = { name: string, schema: unknown };
type MarkEntry = { name: string, schema: unknown };

// A `Functionality` implements something the editor wants to support. This may translate into Prosemirror key
// bindings, plugins, commands, nodes, marks, etc. This allows better code organisation and understandability by
// centralising all of the parts that enable a contained piece of functionality.
export class Functionality {
    plugins(schema: Schema): Plugin[] {
        return [];
    }

    keys(schema: Schema) {
        return {};
    }

    inputRules(schema: Schema): InputRule[] {
        return [];
    }

    commands(schema: Schema): Record<string, Command | CommandConstructor> {
        return {};
    }

    node(): NodeEntry | null {
        return null;
    }

    mark(): MarkEntry | null {
        return null;
    }
}

// This collects a bunch of `Functionality`s, and constructs the final keymap and set of plugins we pass to
// Prosemirror.
export default class Functionalities {
    functionalities: Functionality[];

    constructor(functionalities: Functionality[] = []) {
        this.functionalities = functionalities;
    }

    plugins(schema: Schema): Plugin[] {
        const keymaps = [
            ...this.functionalities.map(functionality => functionality.keys(schema)),
            baseKeymap,
        ].map(keys => keymap(keys));

        const input_rules = this.functionalities
            .map(functionality => functionality.inputRules(schema))
            .reduce((allInputRules, inputRules) => [ ...allInputRules, ...inputRules ], [])

        const from_functionalities = this.functionalities
            .map(functionality => functionality.plugins(schema))
            .reduce((allPlugins, plugins) => [ ...allPlugins, ...plugins ], []);

        return [
            ...from_functionalities,
            ...keymaps,
            inputRules({ rules: input_rules }),
            gapCursor(),
        ];
    }

    schema(): Schema {
        const nodes = this.functionalities
            .map(functionality => functionality.node())
            .filter(node => (node !== null))
            .reduce((allNodes, node) => ({ ...allNodes, [node.name]: node.schema }), {});
        const marks = this.functionalities
            .map(functionality => functionality.mark())
            .filter(mark => (mark !== null))
            .reduce((allMarks, mark) => ({ ...allMarks, [mark.name]: mark.schema }), {});

        return new Schema({ nodes, marks });
    }

    commands(schema: Schema): Record<string, Command | CommandConstructor> {
        return this.functionalities
            .map(functionality => functionality.commands(schema))
            .reduce((allCommands, commands) => ({ ...allCommands, ...commands }), {});
    }
}

export function markInputRule(pattern: RegExp, markType: MarkType, getAttrs?: (match) => Record<string, unknown>): InputRule {
    return new InputRule(pattern, (state, match, start, end) => {
        const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
        const { tr } = state;

        if (match[1]) {
            const textStart = start + match[0].indexOf(match[1]);
            const textEnd = textStart + match[1].length;
            if (textEnd < end) tr.delete(textEnd, end);
            if (textStart > start) tr.delete(start, textStart);
            end = start + match[1].length;
        }

        tr.addMark(start, end, markType.create(attrs));
        tr.removeStoredMark(markType);
        return tr;
    });
}

const isMac = /Mac/.test(navigator.platform);

export function isModKey(event: KeyboardEvent | MouseEvent): boolean {
    return (isMac ? event.metaKey : event.ctrlKey);
}
