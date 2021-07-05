import * as React from 'react';
import { useParams } from 'react-router-dom';

export default function Zettel() {
    const { id } = useParams<{ id: string }>();
    return (<h1>Zettel {id} goes here</h1>);
}
