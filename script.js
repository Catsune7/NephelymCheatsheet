
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    initializeCheatsheet(data);
  });
      const leftColumn = document.getElementById("leftColumn");
      const rightColumn = document.getElementById("rightColumn");
      const detailsBox = document.getElementById("detailsBox");
      const searchInput = document.getElementById("searchInput");
      let currentSelected = null;
      // Build everything once
      const allButtons = [];
      Object.keys(data).sort((a, b) => a === "Hybrid" ? -1 : b === "Hybrid" ? 1 : a.localeCompare(b)).forEach(species => {
        const group = document.createElement("div");
        group.className = "species-group";
        group.innerHTML = `
			<h2>${species}</h2>`;
        const list = document.createElement("div");
        list.className = "variant-list";
        data[species].forEach(entry => {
          const button = document.createElement("div");
          button.className = "variant-item";
          button.textContent = entry.Race;
          button.dataset.search = Object.values(entry).join(" ").toLowerCase();
          button.addEventListener("click", () => {
            document.querySelectorAll(".variant-item").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            currentSelected = button;
            let html = `
			<h2>${entry.Race} (${entry.Species})</h2>
			<p>
				<strong>Gender:</strong> ${entry.Gender}
			</p>
			<p>
				<strong>Size:</strong> ${entry.Size}
			</p>`;
            if (entry["Is Hybrid"] === "Yes") {
              html += `
			<p>
				<strong>Hybrid of:</strong> ${entry["Hybrid of"]}
			</p>`;
            } else {
              html += `
			<p>
				<strong>Location:</strong> ${entry.Location}
			</p>
			<p>
				<strong>Preferred Liquids:</strong>
				<br>${
                       entry["Preferred Liquids"].split(", ").map(liquid => `
					<span class="essence-tag">${liquid}</span>`).join(" ")
                     }
				</p>
				<p>
					<strong>Essence Levels:</strong>
					<br>
						<span class="essence-tag">2: ${entry["Essence 2"]}</span>
						<span class="essence-tag">3: ${entry["Essence 3"]}</span>
						<span class="essence-tag">4: ${entry["Essence 4"]}</span>
						<span class="essence-tag">5: ${entry["Essence 5"]}</span>
					</p>`;
            }
            detailsBox.innerHTML = html;
            detailsBox.classList.remove("hidden");
            detailsBox.scrollIntoView({
              behavior: "smooth"
            });
          });
          allButtons.push(button);
          list.appendChild(button);
        });
        group.appendChild(list);
        if (species === "Hybrid") {
          leftColumn.appendChild(group);
        } else {
          rightColumn.appendChild(group);
        }
      });
      searchInput.addEventListener("input", () => {
        const value = searchInput.value.trim().toLowerCase();
        allButtons.forEach(btn => {
          if (value && btn.dataset.search.includes(value)) {
            btn.classList.add("highlight");
          } else {
            btn.classList.remove("highlight");
          }
        });
      });

      function clearSearch() {
        searchInput.value = "";
        allButtons.forEach(btn => btn.classList.remove("highlight"));
      }