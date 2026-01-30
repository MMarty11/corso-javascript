let currentOffset = 0;
let currentPokemonList = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPokemon(0);
});

async function loadPokemon(offset = 0) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
        if (!response.ok){
            throw new Error("Errore nel caricamento");
        }

        const data = await response.json();
        currentOffset = offset;

        console.log(data);

        const pokemonPromises = data.results.map(async (pokemon, index) => {
            const detailResponse = await fetch(pokemon.url);
            const detail = await detailResponse.json();
            return {
                ...detail,
                listIndex: index
            };
        });

        console.log(pokemonPromises);
        
        currentPokemonList = await Promise.all(pokemonPromises);
        
        displayPokemonTable(currentPokemonList);
        updatePagination(data, offset);

        console.log(currentPokemonList);
       
    } catch (error) {
        console.error(error);
    }
}

function displayPokemonTable(pokemonList) {
    const tbody = document.getElementById("pokemonTableBody");
    tbody.innerHTML = '';

    pokemonList.forEach((pokemon, index) => {
        const row = document.createElement('tr')
        //row.onclick = () => selectPokemon()
        row.innerHTML = `
            <td> 
                <img src="${pokemon.sprites.front_default}"
                     alt="{pokemon.name}"
                     class="pokemon-image"
            </td>
            <td class="pokemon-name">${pokemon.name}</td>
            <td class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</td>
            <td class="pokemon-types">${pokemon.types}</td>
            <td>${(pokemon.height / 10).toFixed(1)}m</td>
            <td>${(pokemon.weight / 10).toFixed(1)}kg</td>
        `

        tbody.appendChild(row);
    });
}

function updatePagination(data, offset) {
    const pageInfo = document.getElementById("pageInfo");
    const currentPage = Math.floor(offset/20) + 1;
    const totalPages = Math.ceil(data.count/20);

    pageInfo.textContent = `Pagina ${currentPage} di ${totalPages} (${data.count} Pokemon Totali)`;
    
}
