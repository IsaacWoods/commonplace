import * as React from 'react';
import Button from './button';
import { useHistory } from 'react-router-dom';
import { create_zettel } from '../zettel';

export default function NewZettelButton() {
    let history = useHistory();

    const onClick = async () => {
        const id = await create_zettel();
        history.push(`/zettel/${id}`);
    };

    return (<Button onClick={onClick}>New Zettel</Button>);
}
