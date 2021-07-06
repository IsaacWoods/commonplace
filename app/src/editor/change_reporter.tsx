import * as React from 'react';
import { debounce } from 'lodash';
import serializeDoc from './serializer';
import { useEditor } from '.';
import type { ZettelContent } from '../zettel';

type Props = {
    onChange: (content: ZettelContent) => void;
}

/*
 * Reports changes to the Prosemirror document to the passed `onChange` function. Calls to this function are
 * debounced to avoid excessive serialization of the document.
 */
export default function ChangeReporter({ onChange }: Props) {
    const { state } = useEditor();

    const debouncedOnChange = React.useCallback(debounce((doc) => {
        onChange(serializeDoc(doc));
    }, 300), [onChange]);

    React.useEffect(() => debouncedOnChange(state.doc), [state.doc]);

    return null;
}
