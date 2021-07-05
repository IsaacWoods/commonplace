export type Zettel = {
    title: string,
    content: string,
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
