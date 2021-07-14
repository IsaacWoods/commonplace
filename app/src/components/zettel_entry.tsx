import * as React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { fetch_zettel, update_zettel, ZettelCache } from '../zettel';

type Props = {
    id: number,
}

/*
 * A `ZettelEntry` component can be used when creating a list of Zettels. It takes a Zettel ID and presents a nice
 * entry with the Zettel's title and a link to the editor scene for that Zettel.
 */
export default function ZettelEntry(props: Props) {
    const zettelCache = React.useContext(ZettelCache);
    const [zettel, setZettel] = React.useState(null);

    React.useEffect(() => {
        // TODO: we should probably abstract this out at some point (or use React Suspense to do it properly?)
        const zettel = zettelCache.state.zettels.get(props.id);
        if (zettel) {
            setZettel(zettel);
            return;
        }

        fetch_zettel(props.id).then((result) => {
            setZettel(result);
            zettelCache.dispatch({ type: "updateZettel", id: props.id, zettel: result });
        }).catch((error) => {
            console.log("Error: ", error);
        });
    }, [props.id]);

    return (<NavLink to={`/zettel/${props.id}`}>{zettel ? zettel.title : "Loading"}</NavLink>);
}
