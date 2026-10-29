
const settings = {
    events: {
        file: "events.json",
        fields: ["title", "category", "date", "venue"]
    },
    students: {
        file: "students.json",
        fields: ["id", "name", "department", "year", "email", "status"]
    },
    faqs: {
        file: "faqs.json",
        fields: ["question", "category", "answer"]
    }
};

const type = document.body.dataset.page;
const config = settings[type];

const list = document.getElementById("records");
const search = document.getElementById("search");
const filter = document.getElementById("filter");
const sort = document.getElementById("sort");
const info = document.getElementById("pageInfo");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const message = document.getElementById("message");

let data = [];
let page = 1;
const pageSize = 6;

async function loadRecords() {
    try {
        const response = await fetch(`data/${config.file}`);

        if (!response.ok) {
            throw new Error("Could not load JSON data.");
        }

        data = await response.json();

        const filterValues = [
            ...new Set(data.map(item => item.category || item.department))
        ].sort();

        filterValues.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            filter.append(option);
        });

        config.fields.forEach(key => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent =
                key.charAt(0).toUpperCase() + key.slice(1);
            sort.append(option);
        });

        search.addEventListener("input", resetPage);
        filter.addEventListener("change", resetPage);
        sort.addEventListener("change", resetPage);

        prev.addEventListener("click", () => {
            if (page > 1) {
                page--;
                render();
            }
        });

        next.addEventListener("click", () => {
            page++;
            render();
        });

        message.hidden = true;
        render();

    } catch (error) {
        message.textContent =
            "Unable to load records. Run the project using VS Code Live Server.";
    }
}

function resetPage() {
    page = 1;
    render();
}

function render() {
    const term = search.value.toLowerCase().trim();

    let result = data.filter(item =>
        JSON.stringify(item).toLowerCase().includes(term)
    );

    if (filter.value) {
        result = result.filter(item =>
            (item.category || item.department) === filter.value
        );
    }

    if (sort.value) {
        result.sort((a, b) =>
            String(a[sort.value] ?? "").localeCompare(
                String(b[sort.value] ?? ""),
                undefined,
                { numeric: true }
            )
        );
    }

    const totalPages = Math.max(1, Math.ceil(result.length / pageSize));
    page = Math.min(page, totalPages);

    const visible = result.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    list.replaceChildren();

    if (visible.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No records found.";
        list.append(empty);
    } else if (type === "students") {
        renderStudentTable(visible);
    } else {
        renderCards(visible);
    }

    info.textContent =
        `Page ${page} of ${totalPages} - ${result.length} records`;

    prev.disabled = page === 1;
    next.disabled = page === totalPages;
}

function renderStudentTable(records) {
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    config.fields.forEach(key => {
        const th = document.createElement("th");
        th.textContent = key.toUpperCase();
        headRow.append(th);
    });

    thead.append(headRow);
    table.append(thead);

    const tbody = document.createElement("tbody");

    records.forEach(record => {
        const row = document.createElement("tr");

        config.fields.forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = record[key];
            row.append(cell);
        });

        tbody.append(row);
    });

    table.append(tbody);
    wrap.append(table);
    list.append(wrap);
}

function renderCards(records) {
    records.forEach(record => {
        const card = document.createElement("article");
        card.className = "record";

        const title = document.createElement("h3");
        title.textContent = record.title || record.question;
        card.append(title);

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = record.category;
        card.append(badge);

        Object.entries(record).forEach(([key, value]) => {
            if (["title", "question", "category", "id"].includes(key)) {
                return;
            }

            const p = document.createElement("p");
            p.textContent =
                key.charAt(0).toUpperCase() + key.slice(1) + ": " + value;
            card.append(p);
        });

        list.append(card);
    });
}

loadRecords();
