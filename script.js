const showInput = document.getElementById("showInput");
const fetchShowBtn = document.getElementById("fetchShowBtn");
const searchInput = document.getElementById("searchInput");
const seasonDropdown = document.getElementById("seasonDropdown");
const episodeList = document.getElementById("episodeList");

let allEpisodes = [];
let filteredEpisodes = [];

// Example custom streaming links for some episodes (showId => episodeId => url)
// TVMaze does NOT provide streaming URLs, so you can add your own links here if you want.


// Fetch show and episodes by show name
async function fetchShowEpisodes(showName) {
  try {
    episodeList.innerHTML = "<p>Loading episodes...</p>";
    searchInput.value = "";
    seasonDropdown.innerHTML = '<option value="all">All Seasons</option>';
    searchInput.disabled = true;
    seasonDropdown.disabled = true;

    // Step 1: Get show data
    const showResponse = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(showName)}`);
    if (!showResponse.ok) throw new Error("Show not found");
    const showData = await showResponse.json();

    // Step 2: Get episodes for that show
    const episodesResponse = await fetch(`https://api.tvmaze.com/shows/${showData.id}/episodes`);
    if (!episodesResponse.ok) throw new Error("Episodes not found");
    const episodes = await episodesResponse.json();

    allEpisodes = episodes;
    filteredEpisodes = episodes;

    populateSeasonDropdown(episodes);
    displayEpisodes(episodes, showData.id);

    searchInput.disabled = false;
    seasonDropdown.disabled = false;
  } catch (error) {
    episodeList.innerHTML = `<p style="color:red;">${error.message}</p>`;
    searchInput.disabled = true;
    seasonDropdown.disabled = true;
  }
}

// Display episodes on page with images and links
function displayEpisodes(episodes, showId) {
  episodeList.innerHTML = "";

  if (episodes.length === 0) {
    episodeList.innerHTML = "<p>No episodes found.</p>";
    return;
  }

  episodes.forEach(ep => {
    const card = document.createElement("div");
    card.className = "episode-card";

    // Use episode image if available, else placeholder
    const imgSrc = ep.image ? ep.image.medium : "https://via.placeholder.com/300x180?text=No+Image";

    

    card.innerHTML = `
      <img class="episode-image" src="${imgSrc}" alt="Episode image for ${ep.name}" />
      <h3>${ep.name}</h3>
      <p><strong>Season ${ep.season}, Episode ${ep.number}</strong></p>
      <p>${ep.summary ? ep.summary.replace(/<[^>]+>/g, '') : "No description available."}</p>
      
      
    `;

    episodeList.appendChild(card);
  });
}

// Populate season dropdown options
function populateSeasonDropdown(episodes) {
  const seasons = [...new Set(episodes.map(ep => ep.season))].sort((a,b) => a - b);

  seasons.forEach(seasonNum => {
    const option = document.createElement("option");
    option.value = seasonNum;
    option.textContent = `Season ${seasonNum}`;
    seasonDropdown.appendChild(option);
  });
}

// Filter episodes by search text and season
function filterEpisodes() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedSeason = seasonDropdown.value;

  filteredEpisodes = allEpisodes.filter(ep => {
    const matchesSearch =
      ep.name.toLowerCase().includes(searchTerm) ||
      (ep.summary && ep.summary.toLowerCase().includes(searchTerm));
    const matchesSeason = selectedSeason === "all" || ep.season.toString() === selectedSeason;

    return matchesSearch && matchesSeason;
  });

  // Pass showId from the first episode or null if none
  const showId = allEpisodes.length > 0 ? allEpisodes[0].show?.id || null : null;
  displayEpisodes(filteredEpisodes, showId);
}

// Event listeners
fetchShowBtn.addEventListener("click", () => {
  const showName = showInput.value.trim();
  if (showName) fetchShowEpisodes(showName);
});

searchInput.addEventListener("input", filterEpisodes);
seasonDropdown.addEventListener("change", filterEpisodes);