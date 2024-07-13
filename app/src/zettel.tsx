import * as React from 'react';

export async function create_zettel() {
    let response = await fetch("/api/zettel.create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (response.status === 200) {
        let id = parseInt(await response.text());
        return id;
    } else {
        throw new Error(`Failed to create new Zettel: ${response}`);
    }
}

export async function fetch_zettel(id: number) {
    console.log("Getting zettel with id: ", id);

    let response = await fetch(`/api/zettel.fetch/${id}`);

    if (response.status === 200) {
        let zettel = await response.json();
        console.log("Zettel: ", zettel);
        return { title: zettel.title, content: zettel.content };
    } else if (response.status === 404) {
        throw new Error(`There is no Zettel with ID: ${id}`);
    } else {
        throw new Error(`Failed to fetch Zettel: ${response}`);
    }
}

export async function update_zettel(id: number, zettel: any) {
    console.log("Updating zettel: ", id);

    let response = await fetch(`/api/zettel.update/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(zettel),
    });

    if (response.status === 200) {
        console.log("Update was successful");
    } else {
        console.log("Update failed: ", response);
    }
}

export async function list_zettels(): Promise<Object[]> {
    let response = await fetch("/api/zettel.list");

    if (response.status === 200) {
        return response.json();
    } else {
        throw new Error(`Failed to get list of Zettels: ${response}`);
    }
}

export async function search_zettels(query: string): Promise<number[]> {
    let response = await fetch(`/api/zettel.search?query=${query}`);

    if (response.status === 200) {
        return response.json();
    } else {
        throw new Error(`Failed to search Zettels: ${response}`);
    }
}

type ZettelContextState = {
    titles: Map<number, string>,
}

export const ZettelContext = React.createContext({ state: { titles: null }, dispatch: undefined });

type ZettelContextAction = {
    type: string,
    id?: number,
    title?: string,
};

export const ZettelContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer((state: ZettelContextState, action: ZettelContextAction) => {
        switch (action.type) {
            case "updateTitle":
                return { ...state, titles: state.titles.set(action.id, action.title) };
            default:
                throw new Error("Unknown ZettelCache action");
        }
    }, { titles: new Map() });

    return (<ZettelContext.Provider value={{ state, dispatch }}>{children}</ZettelContext.Provider>);
}
