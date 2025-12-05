// --- DEKLARASI DATA AWAL ---
const ADMIN_USERNAME = "osmakanda";
const ADMIN_PASSWORD = "osmakandamaju";

// Struktur data turnamen (Simpan di localStorage agar tetap ada setelah refresh)
let tournamentData = JSON.parse(localStorage.getItem('mlbbTournamentData')) || {
    teams: [
        { id: 1, name: "SQUAD ALPHA", score: 0 },
        { id: 2, name: "TEAM BETA", score: 0 },
        { id: 3, name: "CYBER KNIGHTS", score: 0 },
        { id: 4, name: "NEON GHOSTS", score: 0 },
        { id: 5, name: "GLOW UP", score: 0 },
        { id: 6, name: "FUTURE LEGENDS", score: 0 },
        { id: 7, name: "BLACK DRAGON", score: 0 },
        { id: 8, name: "OSMAKANDA GOAT", score: 0 },
    ],
    // Struktur pertandingan sederhana: [id_babak, id_pertandingan, id_tim_1, id_tim_2, skor_1, skor_2, pemenang_id]
    matches: [
        // Round 1
        { id: 'R1-M1', round: 1, team1Id: 1, team2Id: 8, score1: 0, score2: 0, winnerId: null },
        { id: 'R1-M2', round: 1, team1Id: 4, team2Id: 5, score1: 0, score2: 0, winnerId: null },
        { id: 'R1-M3', round: 1, team1Id: 2, team2Id: 7, score1: 0, score2: 0, winnerId: null },
        { id: 'R1-M4', round: 1, team1Id: 3, team2Id: 6, score1: 0, score2: 0, winnerId: null },
        
        // Round 2 (Semi Final - Tim ID 99 menandakan Placeholder, akan diganti oleh pemenang)
        { id: 'R2-M1', round: 2, team1Id: 99, team2Id: 99, score1: 0, score2: 0, winnerId: null, source1: 'R1-M1', source2: 'R1-M2' },
        { id: 'R2-M2', round: 2, team1Id: 99, team2Id: 99, score1: 0, score2: 0, winnerId: null, source1: 'R1-M3', source2: 'R1-M4' },

        // Round 3 (Final)
        { id: 'R3-M1', round: 3, team1Id: 99, team2Id: 99, score1: 0, score2: 0, winnerId: null, source1: 'R2-M1', source2: 'R2-M2' },
    ]
};

// --- FUNGSI UTILITY ---
function getTeamName(id) {
    if (id === 99) return "TBD";
    const team = tournamentData.teams.find(t => t.id === id);
    return team ? team.name : "Team Not Found";
}

function saveTournamentData() {
    localStorage.setItem('mlbbTournamentData', JSON.stringify(tournamentData));
}


// --- FUNGSI BRACKET DISPLAY (INDEX.HTML) ---

function createMatchupElement(match) {
    const team1Name = getTeamName(match.team1Id);
    const team2Name = getTeamName(match.team2Id);

    const matchDiv = document.createElement('div');
    matchDiv.className = 'matchup';
    matchDiv.id = `display-${match.id}`;

    const team1Class = match.winnerId === match.team1Id ? 'team-slot winner' : 'team-slot';
    const team2Class = match.winnerId === match.team2Id ? 'team-slot winner' : 'team-slot';

    matchDiv.innerHTML = `
        <div class="${team1Class}">
            <span>${team1Name}</span>
            <span class="score">${match.score1}</span>
        </div>
        <div class="${team2Class}">
            <span>${team2Name}</span>
            <span class="score">${match.score2}</span>
        </div>
    `;
    return matchDiv;
}

function loadBracketDisplay() {
    const container = document.getElementById('bracket-container');
    if (!container) return; // Pastikan kita berada di index.html

    container.innerHTML = '';
    const maxRound = Math.max(...tournamentData.matches.map(m => m.round));

    for (let r = 1; r <= maxRound; r++) {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        roundDiv.id = `round-${r}`;
        
        roundDiv.innerHTML = `<h3 class="round-title neon-text">ROUND ${r}</h3>`;

        const matchesInRound = tournamentData.matches.filter(m => m.round === r);
        matchesInRound.forEach(match => {
            roundDiv.appendChild(createMatchupElement(match));
        });
        
        container.appendChild(roundDiv);
    }
}


// --- FUNGSI ADMIN PANEL (ADMIN.HTML) ---

// 1. Login Logic
function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const message = document.getElementById('login-message');

    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
        // Berhasil login
        localStorage.setItem('adminLoggedIn', 'true');
        message.textContent = 'Login Berhasil!';
        message.style.color = 'var(--color-neon-blue)';
        showAdminPanel();
    } else {
        // Gagal login
        message.textContent = 'Username atau Password salah!';
        message.style.color = 'var(--color-error)';
    }
}

function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
}

function showAdminPanel() {
    const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');

    if (!loginContainer || !adminPanel) return; // Pastikan elemen ada

    if (loggedIn) {
        loginContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAdminTeamList();
        loadAdminMatchList();
    } else {
        loginContainer.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
}

// 2. Kelola Tim
function loadAdminTeamList() {
    const listContainer = document.getElementById('team-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    tournamentData.teams.forEach(team => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'form-group team-edit-row';
        teamDiv.innerHTML = `
            <label class="neon-text">ID ${team.id}:</label>
            <input type="text" id="team-${team.id}-name" value="${team.name}" data-team-id="${team.id}" class="team-name-input">
            <button class="neon-button small-button" onclick="saveTeamName(${team.id})">Simpan</button>
        `;
        listContainer.appendChild(teamDiv);
    });
}

function saveTeamName(teamId) {
    const input = document.getElementById(`team-${teamId}-name`);
    const newName = input.value.trim();
    if (newName) {
        const team = tournamentData.teams.find(t => t.id === teamId);
        if (team) {
            team.name = newName;
            saveTournamentData();
            alert(`Nama tim ID ${teamId} berhasil diubah menjadi ${newName}`);
            loadAdminMatchList(); // Refresh daftar pertandingan
        }
    } else {
        alert("Nama tim tidak boleh kosong.");
    }
}

// 3. Kelola Pertandingan
function loadAdminMatchList() {
    const listContainer = document.getElementById('match-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    tournamentData.matches.forEach(match => {
        const team1Name = getTeamName(match.team1Id);
        const team2Name = getTeamName(match.team2Id);
        
        const matchDiv = document.createElement('div');
        matchDiv.className = 'neon-panel small-panel';
        matchDiv.innerHTML = `
            <h4 class="neon-text">Match ID: ${match.id} (Round ${match.round})</h4>
            <div class="form-group">
                <label class="neon-text">${team1Name} (ID: ${match.team1Id}) Score:</label>
                <input type="number" id="score1-${match.id}" value="${match.score1}" min="0" data-match-id="${match.id}" data-team-id="${match.team1Id}">
            </div>
            <div class="form-group">
                <label class="neon-text">${team2Name} (ID: ${match.team2Id}) Score:</label>
                <input type="number" id="score2-${match.id}" value="${match.score2}" min="0" data-match-id="${match.id}" data-team-id="${match.team2Id}">
            </div>
            <p>Pemenang Saat Ini: ${getTeamName(match.winnerId) || 'Belum Ditentukan'}</p>
        `;
        listContainer.appendChild(matchDiv);
    });
}

function updateBracketData() {
    // 1. Ambil Data Skor Terbaru dari Input
    tournamentData.matches.forEach(match => {
        const score1Input = document.getElementById(`score1-${match.id}`);
        const score2Input = document.getElementById(`score2-${match.id}`);
        
        if (score1Input && score2Input) {
            match.score1 = parseInt(score1Input.value) || 0;
            match.score2 = parseInt(score2Input.value) || 0;

            // Tentukan Pemenang
            if (match.score1 > match.score2) {
                match.winnerId = match.team1Id;
            } else if (match.score2 > match.score1) {
                match.winnerId = match.team2Id;
            } else {
                match.winnerId = null; // Seri
            }
        }
    });

    // 2. Update Bracket (Lolos ke Babak Selanjutnya)
    const maxRound = Math.max(...tournamentData.matches.map(m => m.round));
    for (let r = 1; r < maxRound; r++) {
        const nextRound = r + 1;
        const currentRoundMatches = tournamentData.matches.filter(m => m.round === r);
        const nextRoundMatches = tournamentData.matches.filter(m => m.round === nextRound);

        // Pasangkan pemenang ke pertandingan di babak berikutnya
        for (let i = 0; i < currentRoundMatches.length; i += 2) {
            const match1 = currentRoundMatches[i];
            const match2 = currentRoundMatches[i + 1];

            // Cari pertandingan di babak berikutnya yang menampung pemenang dari match1 dan match2
            const nextMatch = nextRoundMatches.find(m => m.source1 === match1.id && m.source2 === match2.id);

            if (nextMatch) {
                nextMatch.team1Id = match1.winnerId || 99; // 99: TBD
                nextMatch.team2Id = match2.winnerId || 99; // 99: TBD
                
                // Reset skor pertandingan babak berikutnya jika salah satu tim berubah
                nextMatch.score1 = 0;
                nextMatch.score2 = 0;
                nextMatch.winnerId = null;
            }
        }
    }
    
    saveTournamentData();
    alert("Data skor dan bracket berhasil diupdate dan disimpan!");
    loadAdminMatchList(); // Muat ulang daftar pertandingan admin
}


// 4. Inisialisasi
function initAdminPanel() {
    // Event Listeners
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    const updateBracketButton = document.getElementById('update-bracket-btn');
    if (updateBracketButton) {
        updateBracketButton.addEventListener('click', updateBracketData);
    }
    
    // Add Team Sederhana (Contoh)
    const addTeamButton = document.getElementById('add-team-btn');
    if (addTeamButton) {
        addTeamButton.addEventListener('click', () => {
            const newName = prompt("Masukkan nama tim baru:");
            if (newName && newName.trim()) {
                const newId = Math.max(...tournamentData.teams.map(t => t.id)) + 1;
                tournamentData.teams.push({ id: newId, name: newName.trim(), score: 0 });
                saveTournamentData();
                alert(`Tim ${newName.trim()} berhasil ditambahkan dengan ID ${newId}.`);
                loadAdminTeamList();
            }
        });
    }

    // Tampilkan panel yang sesuai
    showAdminPanel();
      }
