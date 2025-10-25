// Nephelym Cheat Sheet — fully self-contained script.js

function initializeCheatsheet(data) {
  const leftColumn = document.getElementById("leftColumn");
  const rightColumn = document.getElementById("rightColumn");
  const detailsBox = document.getElementById("detailsBox");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");

  // ---- helpers ----
  function clearHighlights() {
    document.querySelectorAll(".variant-item").forEach((btn) => {
      btn.classList.remove("highlight");
    });
  }

  function formatParents(parentsArr, fallbackText) {
    // parentsArr: [{partnerSpecies, partnerRaces?}] -> "Species (Race1, Race2), SpeciesB"
    if (!Array.isArray(parentsArr) || parentsArr.length === 0) {
      return fallbackText || "";
    }
    const parts = parentsArr.map((p) => {
      const species = p.partnerSpecies || "";
      const races = Array.isArray(p.partnerRaces) ? p.partnerRaces.filter(Boolean) : [];
      if (races.length > 0) {
        return `${species} (${races.join(", ")})`;
        
      }
      return species;
    });
    return parts.join(", ");
  }

  function formatPairingRule(rule) {
    // rule: { partnerSpecies, partnerRaces?, hybrid }
    const species = rule.partnerSpecies || "";
    const races = Array.isArray(rule.partnerRaces) ? rule.partnerRaces.filter(Boolean) : [];
    const partner = races.length ? `${species} (${races.join(", ")})` : species;
    return `with ${partner} → ${rule.hybrid}`;
  }

  function buildDetails(entry) {
    let html = `<h2>${entry.Race} (${entry.Species})</h2>`;
    if (entry.Gender) html += `<p><strong>Gender:</strong> ${entry.Gender}</p>`;
    if (entry.Size) html += `<p><strong>Size:</strong> ${entry.Size}</p>`;

    // Hybrids
    if (entry["Is Hybrid"] === "Yes") {
      const parentsFormatted = formatParents(entry.Parents, entry["Hybrid of"]);
      if (parentsFormatted) {
        html += `<p><strong>Hybrid of:</strong> ${parentsFormatted}</p>`;
      }
    }

    // Hybrid Pairings for non-hybrids
    if (entry["Is Hybrid"] !== "Yes" && Array.isArray(entry["Hybrid Pairings"])) {
      const lines = entry["Hybrid Pairings"].map(formatPairingRule);
      if (lines.length) {
        html += `<div class="hybrid-pairings"><strong>Can make Hybrids:</strong><ul>`;
        html += lines.map((l) => `<li>${l}</li>`).join("");
        html += `</ul></div>`;
      }
    }

    return html;
  }

  function search() {
    const query = searchInput.value.trim().toLowerCase();
    clearHighlights();
    if (!query) return;
    document.querySelectorAll(".variant-item").forEach((btn) => {
      if ((btn.dataset.search || "").includes(query)) {
        btn.classList.add("highlight");
        btn.scrollIntoView({ block: "nearest" });
      }
    });
  }

  searchInput.addEventListener("input", search);
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearHighlights();
  });

  // ---- render groups ----
  const speciesOrder = Object.keys(data);
  speciesOrder.forEach((species) => {
    const group = document.createElement("div");
    group.className = "species-group";

    const header = document.createElement("h2");
    header.textContent = species;
    group.appendChild(header);

    const list = document.createElement("div");
    list.className = "variant-list";

    (data[species] || []).forEach((entry) => {
      const btn = document.createElement("div");
      btn.className = "variant-item";
      btn.textContent = entry.Race;

      // Build a searchable string from all known fields
      const fields = [
        entry.Race,
        entry.Species,
        entry.Gender,
        entry.Size,
        entry["Hybrid of"],
      ];

      if (Array.isArray(entry.Parents)) {
        fields.push(formatParents(entry.Parents));
      }
      if (Array.isArray(entry["Hybrid Pairings"])) {
        entry["Hybrid Pairings"].forEach((rule) => fields.push(formatPairingRule(rule)));
      }

      btn.dataset.search = fields.filter(Boolean).join(" ").toLowerCase();

      btn.addEventListener("click", () => {
        document.querySelectorAll(".variant-item").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        const html = buildDetails(entry);
        detailsBox.innerHTML = html;
        detailsBox.classList.remove("hidden");
        detailsBox.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      list.appendChild(btn);
    });

    group.appendChild(list);
    const target = species === "Hybrid" ? leftColumn : rightColumn;
    target.appendChild(group);
  });
}

// Expose clearSearch for the inline onclick in index.html
function clearSearch() {
  const input = document.getElementById("searchInput");
  if (input) input.value = "";
  document.querySelectorAll(".variant-item").forEach((btn) => btn.classList.remove("highlight"));
}

// bootstrap
window.addEventListener("DOMContentLoaded", () => {
  fetch("./assets/data.json")
    .then((r) => r.json())
    .then((data) => initializeCheatsheet(data));
});
