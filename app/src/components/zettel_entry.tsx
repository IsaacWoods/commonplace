import * as React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { fetch_zettel, update_zettel } from '../zettel';

type Props = {
    id: number,
}

/*
 * A `ZettelEntry` component can be used when creating a list of Zettels. It takes a Zettel ID and presents a nice
 * entry with the Zettel's title and a link to the editor scene for that Zettel.
 */
export default function ZettelEntry(props: Props) {
    const [zettel, setZettel] = React.useState(null);

    React.useEffect(() => {
        fetch_zettel(props.id).then((result) => {
            setZettel(result);
        }).catch((error) => {
            console.log("Error: ", error);
        });
    }, [props.id]);

    return (<NavLink to={`/zettel/${props.id}`}>{zettel ? zettel.title : "Loading"}</NavLink>);
}
