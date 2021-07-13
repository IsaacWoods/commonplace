import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { create_zettel } from '../zettel';

export default function NewZettelButton() {
    let history = useHistory();

    const onClick = async () => {
        const id = await create_zettel();
        history.push(`/zettel/${id}`);
    };

    return (<button onClick={onClick}>New Zettel</button>);
}
