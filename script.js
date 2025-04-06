function initializeCheatsheet(data) {
	const leftColumn = document.getElementById("leftColumn");
	const rightColumn = document.getElementById("rightColumn");
	const detailsBox = document.getElementById("detailsBox");
	const searchInput = document.getElementById("searchInput");
	const clearBtn = document.getElementById("clearSearch");

	function clearHighlights() {
		document.querySelectorAll(".variant-item").forEach(btn => {
			btn.classList.remove("highlight");
		});
	}

	function search() {
		const query = searchInput.value.trim().toLowerCase();
		clearHighlights();
		if (!query) return;
		document.querySelectorAll(".variant-item").forEach(btn => {
			if (btn.dataset.search.includes(query)) {
				btn.classList.add("highlight");
			}
		});
	}

	searchInput.addEventListener("input", search);
	clearBtn.addEventListener("click", () => {
		searchInput.value = "";
		search();
	});

	const orderedSpecies = Object.keys(data).sort((a, b) =>
		a === "Hybrid" ? -1 : b === "Hybrid" ? 1 : a.localeCompare(b)
	);

	for (const species of orderedSpecies) {
		const group = document.createElement("div");
		group.className = "species-group";

		const title = document.createElement("h2");
		title.textContent = species;
		group.appendChild(title);

		const list = document.createElement("div");
		list.className = "variant-list";

		data[species].forEach(entry => {
			const btn = document.createElement("div");
			btn.className = "variant-item";
			btn.textContent = entry.Race;
			btn.dataset.search = Object.values(entry).join(" ").toLowerCase();

			btn.addEventListener("click", () => {
				document.querySelectorAll(".variant-item").forEach(b => b.classList.remove("selected"));
				btn.classList.add("selected");
				let html = `<h2>${entry.Race} (${entry.Species})</h2>
                    <p><strong>Gender:</strong> ${entry.Gender}</p>
                    <p><strong>Size:</strong> ${entry.Size}</p>`;

				if (entry["Is Hybrid"] === "Yes") {
					if (entry["Hybrid of"]) {
						html += `<p><strong>Hybrid of:</strong> ${entry["Hybrid of"]}</p>`;
					}
				} else {
					html += `<p><strong>Location:</strong> ${entry.Location}</p>`;
					html += `<p><strong>Preferred Liquids:</strong><br>
                   ${entry["Preferred Liquids"].split(", ").map(x => `<span class="essence-tag">${x}</span>`).join(" ")}</p>`;
					html += `<p><strong>Essence Levels:</strong><br>
                   <span class="essence-tag">2: ${entry["Essence 2"]}</span>
                   <span class="essence-tag">3: ${entry["Essence 3"]}</span>
                   <span class="essence-tag">4: ${entry["Essence 4"]}</span>
                   <span class="essence-tag">5: ${entry["Essence 5"]}</span></p>`;
				}

				detailsBox.innerHTML = html;
				detailsBox.classList.remove("hidden");
				detailsBox.scrollIntoView({
					behavior: "smooth"
				});
			});

			list.appendChild(btn);
		});

		group.appendChild(list);
		const target = species === "Hybrid" ? leftColumn : rightColumn;
		target.appendChild(group);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	fetch("data.json")
		.then(r => r.json())
		.then(data => initializeCheatsheet(data));
});
