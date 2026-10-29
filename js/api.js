// Fetch JSON data from the data folder.
export async function fetchJSON(fileName) {
    const response = await fetch(`data/${fileName}`);
    if (!response.ok) {
        throw new Error(`Could not load ${fileName} (HTTP ${response.status}).`);
    }
    return response.json();
}
