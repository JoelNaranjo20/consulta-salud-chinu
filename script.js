// ==============================
// Secretaría de Salud - Chinú, Córdoba
// Consulta de Estado de Afiliación
// ==============================

// --- Configuration ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'salud2026';
const ROWS_PER_PAGE = 25;

// --- State ---
let allData = [];
let filteredData = [];
let currentPage = 1;
let isLoggedIn = false;

// --- DOM Elements ---
const publicView = document.getElementById('publicView');
const adminView = document.getElementById('adminView');
const loginModal = document.getElementById('loginModal');

// Public
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const resultsTitle = document.getElementById('resultsTitle');
const btnClearResults = document.getElementById('btnClearResults');
const btnAdminLogin = document.getElementById('btnAdminLogin');



// Login
const loginForm = document.getElementById('loginForm');
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const loginError = document.getElementById('loginError');
const btnCloseModal = document.getElementById('btnCloseModal');
const togglePass = document.getElementById('togglePass');

// Admin
const adminSearchInput = document.getElementById('adminSearchInput');
const filterTipoId = document.getElementById('filterTipoId');
const filterEstado = document.getElementById('filterEstado');
const filterNivel = document.getElementById('filterNivel');
const btnAdminFilter = document.getElementById('btnAdminFilter');
const btnAdminClear = document.getElementById('btnAdminClear');
const btnExportCSV = document.getElementById('btnExportCSV');
const adminTableBody = document.getElementById('adminTableBody');
const tableInfo = document.getElementById('tableInfo');
const btnPrevPage = document.getElementById('btnPrevPage');
const btnNextPage = document.getElementById('btnNextPage');
const pageNumbers = document.getElementById('pageNumbers');
const btnBackToPublic = document.getElementById('btnBackToPublic');
const btnLogout = document.getElementById('btnLogout');

// Admin stats
const adminStatTotal = document.getElementById('adminStatTotal');
const adminStatAfiliados = document.getElementById('adminStatAfiliados');
const adminStatNoAfiliados = document.getElementById('adminStatNoAfiliados');
const adminStatNiveles = document.getElementById('adminStatNiveles');

// ==============================
// Data Loading
// ==============================
// Solo inicializamos estados vacíos. La carga se hace por API.
async function loadData() {
  allData = [];
  filteredData = [];
}

// ==============================
// Public View
// ==============================
function updatePublicStats() {
  // Stats section removed from public view
}

function animateCounter(el, target) {
  let current = 0;
  const duration = 1200;
  const step = target / (duration / 16);
  
  function update() {
    current += step;
    if (current >= target) {
      el.textContent = target.toLocaleString('es-CO');
      return;
    }
    el.textContent = Math.floor(current).toLocaleString('es-CO');
    requestAnimationFrame(update);
  }
  update();
}

async function searchPublic() {
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }

  // Use the new secure API
  btnSearch.disabled = true;
  btnSearch.textContent = 'Buscando...';

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Error en búsqueda');
    const results = await res.json();
    showResults(results, query);
  } catch (e) {
    console.error(e);
    alert('Ocurrió un error consultando el servidor.');
  } finally {
    btnSearch.disabled = false;
    btnSearch.textContent = 'Consultar';
  }
}

function showResults(results, query) {
  resultsSection.classList.remove('hidden');
  resultsTitle.textContent = ''; // Título removido a petición del usuario

  if (results.length === 0) {
    resultsContent.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        <h4>No se encontraron resultados</h4>
        <p>No hay registros que coincidan con el documento "${query}". Verifique el número e intente nuevamente.</p>
      </div>
    `;
    return;
  }

  resultsContent.innerHTML = results.map(r => {
    const fullName = [r.NOMBRE1, r.NOMBRE2, r.APELLIDO1, r.APELLIDO2].filter(Boolean).join(' ');
    const isAfiliado = r.ESTADO && r.ESTADO.includes('AFILIADO RS');
    const badgeClass = isAfiliado ? 'status-block-afiliado' : 'status-block-no-afiliado';
    const estadoText = isAfiliado ? 'Afiliado' : 'No Afiliado';

    let alertHtml = '';
    if (!isAfiliado) {
      alertHtml = `
      <div class="result-alert">
        <svg class="result-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>No se encuentra afiliado. Por favor acérquese a la Secretaría de Salud para solucionar el problema con su afiliación.</p>
      </div>`;
    }

    return `
      <div class="result-card">
        <div class="result-card-header" style="flex-direction: column; align-items: flex-start; padding-bottom: 0; border-bottom: none;">
          <div class="result-name-big">${fullName}</div>
          <div class="result-doc">${r.TIPO_ID || ''} — ${r.ID_USUARIO || ''}</div>
          <div class="result-status-block ${badgeClass}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
              ${isAfiliado ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
            </svg>
            ${estadoText}
          </div>
        </div>
        ${alertHtml}
      </div>
    `;
  }).join('');

  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearResults() {
  resultsSection.classList.add('hidden');
  resultsContent.innerHTML = '';
  searchInput.value = '';
  searchInput.focus();
}

// ==============================
// Login / Auth
// ==============================
function openLoginModal() {
  loginModal.classList.remove('hidden');
  loginUser.value = '';
  loginPass.value = '';
  loginError.classList.add('hidden');
  setTimeout(() => loginUser.focus(), 100);
}

function closeLoginModal() {
  loginModal.classList.add('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const user = loginUser.value.trim();
  const pass = loginPass.value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    });

    if (res.ok) {
      const data = await res.json();
      allData = data;
      filteredData = [...allData];
      
      isLoggedIn = true;
      closeLoginModal();
      switchToAdmin();
    } else {
      loginError.classList.remove('hidden');
      loginPass.value = '';
      loginPass.focus();
    }
  } catch (e) {
    console.error(e);
    alert('Error al conectar con el servidor.');
  }
}

function logout() {
  isLoggedIn = false;
  switchToPublic();
}

function switchToAdmin() {
  publicView.classList.remove('active');
  adminView.classList.add('active');
  window.scrollTo(0, 0);
  updateAdminStats();
  applyAdminFilters();
}

function switchToPublic() {
  adminView.classList.remove('active');
  publicView.classList.add('active');
  window.scrollTo(0, 0);
}

function togglePassword() {
  const isPassword = loginPass.type === 'password';
  loginPass.type = isPassword ? 'text' : 'password';
}

// ==============================
// Admin View
// ==============================
function updateAdminStats() {
  const total = allData.length;
  const afiliados = allData.filter(r => r.ESTADO && r.ESTADO.includes('AFILIADO RS')).length;
  const noAfiliados = total - afiliados;
  const niveles = new Set(allData.map(r => r.NIVEL_SISBEN).filter(Boolean)).size;

  adminStatTotal.textContent = total.toLocaleString('es-CO');
  adminStatAfiliados.textContent = afiliados.toLocaleString('es-CO');
  adminStatNoAfiliados.textContent = noAfiliados.toLocaleString('es-CO');
  adminStatNiveles.textContent = niveles;
}

function applyAdminFilters() {
  const search = adminSearchInput.value.trim().toUpperCase();
  const tipoId = filterTipoId.value;
  const estado = filterEstado.value;
  const nivel = filterNivel.value;

  filteredData = allData.filter(r => {
    // Search
    if (search) {
      const docStr = String(r.ID_USUARIO || '').toUpperCase();
      const name = [r.NOMBRE1, r.NOMBRE2, r.APELLIDO1, r.APELLIDO2].filter(Boolean).join(' ').toUpperCase();
      if (!docStr.includes(search) && !name.includes(search)) return false;
    }
    // Tipo ID
    if (tipoId && r.TIPO_ID !== tipoId) return false;
    // Estado
    if (estado && r.ESTADO !== estado) return false;
    // Nivel
    if (nivel && r.NIVEL_SISBEN !== nivel) return false;

    return true;
  });

  currentPage = 1;
  renderAdminTable();
}

function clearAdminFilters() {
  adminSearchInput.value = '';
  filterTipoId.value = '';
  filterEstado.value = '';
  filterNivel.value = '';
  filteredData = [...allData];
  currentPage = 1;
  renderAdminTable();
}

function renderAdminTable() {
  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;
  const pageData = filteredData.slice(start, end);

  tableInfo.textContent = `Mostrando ${start + 1}–${Math.min(end, filteredData.length)} de ${filteredData.length} registros`;

  if (pageData.length === 0) {
    adminTableBody.innerHTML = `
      <tr>
        <td colspan="14" style="text-align:center; padding:40px; color:var(--text-muted);">
          No se encontraron registros con los filtros seleccionados.
        </td>
      </tr>
    `;
  } else {
    adminTableBody.innerHTML = pageData.map((r, i) => {
      const isAfiliado = r.ESTADO && r.ESTADO.includes('AFILIADO RS');
      const badgeClass = isAfiliado ? 'table-badge-success' : 'table-badge-danger';
      const estadoShort = isAfiliado ? 'Afiliado' : 'No Afiliado';

      return `
        <tr>
          <td>${start + i + 1}</td>
          <td>${r.TIPO_ID || ''}</td>
          <td><strong>${r.ID_USUARIO || ''}</strong></td>
          <td>${r.APELLIDO1 || ''}</td>
          <td>${r.APELLIDO2 || ''}</td>
          <td>${r.NOMBRE1 || ''}</td>
          <td>${r.NOMBRE2 || ''}</td>
          <td>${r.DIR_USU || ''}</td>
          <td>${r.TEL_USU || ''}</td>
          <td>${r.NIVEL_SISBEN || ''}</td>
          <td>${r.POBLA_SIS || ''}</td>
          <td><span class="table-badge ${badgeClass}">${estadoShort}</span></td>
          <td>${r.ARCHIVO || ''}</td>
          <td style="white-space:normal; max-width:200px;">${r.ACCION_SOLICITUD || ''}</td>
        </tr>
      `;
    }).join('');
  }

  // Pagination
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  btnPrevPage.disabled = currentPage <= 1;
  btnNextPage.disabled = currentPage >= totalPages;

  // Generate page numbers
  let pages = [];
  const maxVisible = 5;
  let startP = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endP = Math.min(totalPages, startP + maxVisible - 1);
  if (endP - startP < maxVisible - 1) {
    startP = Math.max(1, endP - maxVisible + 1);
  }

  if (startP > 1) {
    pages.push(1);
    if (startP > 2) pages.push('...');
  }

  for (let i = startP; i <= endP; i++) {
    pages.push(i);
  }

  if (endP < totalPages) {
    if (endP < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  pageNumbers.innerHTML = pages.map(p => {
    if (p === '...') {
      return `<span class="page-num" style="cursor:default; opacity:0.5;">…</span>`;
    }
    return `<button class="page-num ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
  }).join('');
}

function goToPage(page) {
  currentPage = page;
  renderAdminTable();
  document.querySelector('.admin-table-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderAdminTable();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderAdminTable();
  }
}

// ==============================
// Export CSV
// ==============================
function exportCSV() {
  const headers = ['TIPO_ID', 'ID_USUARIO', 'APELLIDO1', 'APELLIDO2', 'NOMBRE1', 'NOMBRE2', 'DIR_USU', 'TEL_USU', 'NIVEL_SISBEN', 'POBLA_SIS', 'ESTADO', 'ARCHIVO', 'ACCION_SOLICITUD'];
  const csvRows = [headers.join(',')];

  filteredData.forEach(r => {
    const row = headers.map(h => {
      let val = String(r[h] || '').replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(row.join(','));
  });

  const csv = '\uFEFF' + csvRows.join('\n'); // BOM for Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export_salud_chinu_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==============================
// Event Listeners
// ==============================
btnSearch.addEventListener('click', searchPublic);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchPublic();
});
btnClearResults.addEventListener('click', clearResults);
btnAdminLogin.addEventListener('click', openLoginModal);
btnCloseModal.addEventListener('click', closeLoginModal);
loginForm.addEventListener('submit', handleLogin);
togglePass.addEventListener('click', togglePassword);

// Admin
btnAdminFilter.addEventListener('click', applyAdminFilters);
adminSearchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') applyAdminFilters();
});
btnAdminClear.addEventListener('click', clearAdminFilters);
btnExportCSV.addEventListener('click', exportCSV);
btnPrevPage.addEventListener('click', prevPage);
btnNextPage.addEventListener('click', nextPage);
btnBackToPublic.addEventListener('click', switchToPublic);
btnLogout.addEventListener('click', logout);

// Close modal on overlay click
loginModal.addEventListener('click', e => {
  if (e.target === loginModal) closeLoginModal();
});

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !loginModal.classList.contains('hidden')) {
    closeLoginModal();
  }
});

// ==============================
// Init
// ==============================
loadData();
