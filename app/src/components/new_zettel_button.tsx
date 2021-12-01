import * as React from 'react';
import Button from './button';
import { useNavigate } from 'react-router-dom';
import { create_zettel } from '../zettel';

export default function NewZettelButton() {
    let navigate = useNavigate();

    const onClick = async () => {
        const id = await create_zettel();
        navigate(`/zettel/${id}`);
    };

    return (<Button onClick={onClick}>New Zettel</Button>);
}
