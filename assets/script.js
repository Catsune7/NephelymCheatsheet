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
      if ((btn.dataset.search || "").includes(query)) {
        btn.classList.add("highlight");
      }
    });
  }

  searchInput.addEventListener("input", search);
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    search();
  });

  function formatParents(parentsArr, fallbackText) {
    if (!Array.isArray(parentsArr) || parentsArr.length === 0) {
      return fallbackText || "";
    }
    const parts = parentsArr.map(p => {
      const species = p.partnerSpecies || "";
      const races = Array.isArray(p.partnerRaces) ? p.partnerRaces.filter(Boolean) : [];
      return races.length ? `${species} (${races.join(", ")})` : species;
    });
    return parts.join(", ");
  }

  function formatPairingRule(rule) {
    const species = rule.partnerSpecies || "";
    const races = Array.isArray(rule.partnerRaces) ? rule.partnerRaces.filter(Boolean) : [];
    const partner = races.length ? `${species} (${races.join(", ")})` : species;
    return `with ${partner} → ${rule.hybrid}`;
  }

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
      
	  const searchTokens = [];

      // 1) Keep original flat values
      searchTokens.push(Object.values(entry).join(" "));
      
      // 2) Include normalized parents (for hybrid entries), e.g., "Bovaur (Ayrshire, Bull), Demon"
      if (Array.isArray(entry.Parents)) {
        searchTokens.push(formatParents(entry.Parents, entry["Hybrid of"]));
      } else if (entry["Hybrid of"]) {
        searchTokens.push(entry["Hybrid of"]);
      }
      
      // 3) Include Hybrid Pairings detail so searching a HYBRID (e.g., "Unicorn") finds the PARENTS
      if (Array.isArray(entry["Hybrid Pairings"])) {
        entry["Hybrid Pairings"].forEach(rule => {
      	// hybrid name itself (e.g., "Unicorn")
      	if (rule.hybrid) searchTokens.push(rule.hybrid);
      	// partner species/races (so searches like "Bovaur Minotaur" match)
      	if (rule.partnerSpecies) searchTokens.push(rule.partnerSpecies);
      	if (Array.isArray(rule.partnerRaces)) searchTokens.push(...rule.partnerRaces);
      	// and a readable composed line
      	searchTokens.push(formatPairingRule(rule));
        });
      }

      btn.dataset.search = searchTokens.filter(Boolean).join(" ").toLowerCase();

      btn.addEventListener("click", () => {
        document.querySelectorAll(".variant-item").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");

        let html = `<h2>${entry.Race} (${entry.Species})</h2>
                    <p><strong>Gender:</strong> ${entry.Gender}</p>
                    <p><strong>Size:</strong> ${entry.Size}</p>`;

        if (entry["Is Hybrid"] === "Yes") {
          const parentsFormatted = formatParents(entry.Parents, entry["Hybrid of"]);
          if (parentsFormatted) {
            html += `<p><strong>Hybrid of:</strong> ${parentsFormatted}</p>`;
          }
        } else {
          html += `<p><strong>Location:</strong> ${entry.Location}</p>`;
          const liquidsStr = typeof entry["Preferred Liquids"] === "string"
            ? entry["Preferred Liquids"]
            : Array.isArray(entry["Preferred Liquids"])
              ? entry["Preferred Liquids"].join(", ")
              : ""; // guard
          html += `<p><strong>Preferred Liquids:</strong><br>
                   ${liquidsStr.split(", ").filter(Boolean).map(x => `<span class="essence-tag">${x}</span>`).join(" ")}</p>`;
          html += `<p><strong>Essence Levels:</strong><br>
                   <span class="essence-tag">2: ${entry["Essence 2"]}</span>
                   <span class="essence-tag">3: ${entry["Essence 3"]}</span>
                   <span class="essence-tag">4: ${entry["Essence 4"]}</span>
                   <span class="essence-tag">5: ${entry["Essence 5"]}</span></p>`;

          if (Array.isArray(entry["Hybrid Pairings"]) && entry["Hybrid Pairings"].length) {
            const lines = entry["Hybrid Pairings"].map(formatPairingRule);
            html += `<div class="hybrid-pairings"><strong>Can make Hybrids:</strong><ul>`;
            html += lines.map(l => `<li>${l}</li>`).join("");
            html += `</ul></div>`;
          }
        }

        detailsBox.innerHTML = html;
        detailsBox.classList.remove("hidden");
        detailsBox.scrollIntoView({ behavior: "smooth" });
      });

      list.appendChild(btn);
    });

    group.appendChild(list);
    const target = species === "Hybrid" ? leftColumn : rightColumn;
    target.appendChild(group);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("./assets/data.json")
    .then(r => r.json())
    .then(data => initializeCheatsheet(data));
});
