import * as React from 'react';

export type Zettel = {
    title: string,
    content: ZettelContent,
}

export type ZettelContent = Block[];

export type Block = {
    type: "Paragraph" | "Heading" | "Divider" | "List" | "Image",
    inlines?: Inline[],
    items?: ListItem[],

    // For headings
    level?: number,

    // For images
    src?: string,
    alt?: string,
}

export type Inline = {
    type: "Text" | "Link",
    text?: string,
    href?: string,
    marks?: Mark[],
}

export type ListItem = {
    blocks: Block[],
}

export type Mark = "Bold" | "Italic" | "Strikethrough" | "Highlight" | "Subscript" | "Superscript";

// This is returned by endpoints that are not called for a specific Zettel ID. The title and content may be
// missing, depending on the endpoint and various options, to save them being fetched and sent if not needed.
export type ZettelResult = {
    id: number,
    title?: string,
    content?: ZettelContent,
}

export async function create_zettel(): Promise<number> {
    let response = await fetch("/api/zettel.create/", {
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

export async function fetch_zettel(id: number): Promise<Zettel> {
    console.log("Getting zettel with id: ", id);

    let response = await fetch(`/api/zettel.fetch/${id}`);

    if (response.status === 200) {
        let zettel = await response.json();
        return { title: zettel.title, content: zettel.content };
    } else if (response.status === 404) {
        throw new Error(`There is no Zettel with ID: ${id}`);
    } else {
        throw new Error(`Failed to fetch Zettel: ${response}`);
    }
}

export async function update_zettel(id: number, zettel: Zettel) {
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

export async function list_zettels(): Promise<ZettelResult[]> {
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
const { Provider } = ZettelContext;

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

    return (<Provider value={{ state, dispatch }}>{children}</Provider>);
}
