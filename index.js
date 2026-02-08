let currentOffset = 0;
let currentPokemonList = [];

let selectedPokemonId = null;
const sidePanel = document.getElementById("sidePanel");
const panelContent = document.getElementById("panelContent");
const closePanelBtn = document.getElementById("closePanel");

document.addEventListener("DOMContentLoaded", () => {
  loadPokemon(0);
});

async function loadPokemon(offset = 0) {
  try {
    if (currentOffset == 0 && offset == -20) currentOffset = 0;
    else if (offset == 0) currentOffset = 0;
    else currentOffset += offset;

    console.log(offset, currentOffset)

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${currentOffset}`);
    if (!response.ok) {
      throw new Error("Errore nel caricamento");
    }

    const data = await response.json();

    //console.log(data);

    const pokemonPromises = data.results.map(async (pokemon, index) => {
      const detailResponse = await fetch(pokemon.url);
      const detail = await detailResponse.json();
      return {
        ...detail,
        listIndex: index
      };
    });

    //console.log(pokemonPromises);

    currentPokemonList = await Promise.all(pokemonPromises);

    displayPokemonTable(currentPokemonList);
    updatePagination(data, currentOffset);

    //console.log(currentPokemonList);

  } catch (error) {
    console.error(error);
  }
}

function displayPokemonTable(pokemonList) {
  const tbody = document.getElementById("pokemonTableBody");
  tbody.innerHTML = '';

  pokemonList.forEach((pokemon) => {
    // 🔹 GENERA I BADGE DEI TIPI CON LE CLASSI CSS 🔹
    const typesHTML = pokemon.types
      .map(typeInfo => {
        const typeName = typeInfo.type.name; // Es: "grass", "fire", ecc.

        // Ritorna un <span> con la classe GENERICA + la classe SPECIFICA del tipo
        return `<span class="type-badge type-${typeName}">${typeName}</span>`;
      })
      .join('');

    const row = document.createElement('tr');
    row.innerHTML = `
      <td> 
        <img src="${pokemon.sprites.front_default}"
             alt="${pokemon.name}"
             class="pokemon-image"
      </td>
      <td class="pokemon-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</td>
      <td class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</td>
      <td class="pokemon-types">${typesHTML}</td>
      <td class="pokemon-height">${(pokemon.height / 10).toFixed(1)}m</td>
      <td class="pokemon-weight">${(pokemon.weight / 10).toFixed(1)}kg</td>
    `;

    row.addEventListener("click", () => toggleSidePanel(pokemon, row));

    tbody.appendChild(row);
  });
}

function updatePagination(data, offset) {
  const pageInfo = document.getElementById("pageInfo");
  const currentPage = Math.floor(offset / 20) + 1;
  const totalPages = Math.ceil(data.count / 20)

  pageInfo.textContent = `Pagina ${currentPage} di ${totalPages} (${data.count} Pokemon Totali)`;

}

/* SIDE PANEL */
function toggleSidePanel(pokemon, row) {
  // se clicco lo stesso pokemon → chiudi
  if (selectedPokemonId === pokemon.id) {
    closeSidePanel();
    return;
  }

  // rimuove highlight dalle altre righe
  document.querySelectorAll("tr.active").forEach(r => r.classList.remove("active"));

  selectedPokemonId = pokemon.id;
  row.classList.add("active");

  panelContent.innerHTML = `
    <div class="panel-hero">
      <img src="${pokemon.sprites.other['official-artwork'].front_default}">
    </div>

    <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
    <p class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</p>

    <div style="margin:4px 0">
      ${pokemon.types.map(t => `
        <span class="type-badge type-${t.type.name}">
          ${t.type.name}
        </span>
      `).join("")}
    </div>

    <div class="panel-section">
      <h4>Statistiche</h4>
      ${pokemon.stats.map(stat => `
        <div class="stat-row">
          <span class="stat-name">${stat.stat.name}</span>
          <span class="stat-base">${stat.base_stat}</span>
        </div>
      `).join("")}
    </div>
  `;

  sidePanel.classList.add("open");
}

closePanelBtn.addEventListener("click", closeSidePanel);

function closeSidePanel() {
  sidePanel.classList.remove("open");
  selectedPokemonId = null;

  document.querySelectorAll("tr.active").forEach(r => r.classList.remove("active"));
}