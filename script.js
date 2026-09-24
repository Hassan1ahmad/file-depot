const fileGrid = document.querySelector("#file-grid");
const emptyState = document.querySelector("#empty-state");
const countLabel = document.querySelector("#file-count");
const updatedLabel = document.querySelector("#updated");
const searchInput = document.querySelector("#search");
let files = [];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderFiles() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleFiles = files.filter((file) => file.name.toLowerCase().includes(query));
  fileGrid.innerHTML = visibleFiles.map((file, index) => `
    <article class="file-card" style="animation-delay: ${index * 70}ms">
      <div>
        <div class="file-top"><span class="file-type">${file.extension}</span><span class="file-index">${String(index + 1).padStart(2, "0")}</span></div>
        <h3>${file.name}</h3>
        <div class="file-meta">${formatBytes(file.size)} <span aria-hidden="true">&middot;</span> ${file.modified}</div>
      </div>
      <a class="download" href="${file.url}" download>Download <span aria-hidden="true">&darr;</span></a>
    </article>
  `).join("");

  const hasResults = visibleFiles.length > 0;
  fileGrid.hidden = !hasResults;
  emptyState.hidden = hasResults || files.length > 0;
  countLabel.textContent = query ? `${visibleFiles.length} matching ${visibleFiles.length === 1 ? "file" : "files"}` : `${files.length} ${files.length === 1 ? "file" : "files"}`;
}

async function loadFiles() {
  try {
    const response = await fetch("/api/files");
    if (!response.ok) throw new Error("Directory unavailable");
    files = await response.json();
    updatedLabel.textContent = `UPDATED ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    renderFiles();
  } catch (error) {
    fileGrid.hidden = true;
    emptyState.hidden = false;
    countLabel.textContent = "Directory unavailable";
    updatedLabel.textContent = "START LOCAL SERVER TO CONNECT";
  }
}

searchInput.addEventListener("input", renderFiles);
loadFiles();