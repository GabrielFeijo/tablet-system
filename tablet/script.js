let currentSection = 'search';

const sectionTitles = {
	search: 'Buscar Jogador',
	nearby: 'Jogadores Próximos',
	history: 'Histórico',
	rg: 'Registro Geral',
	vehicles: 'Veículos',
	fines: 'Multas',
	prison: 'Prender Jogador',
};

function showSection(sectionName) {
	const sections = document.querySelectorAll('.section');
	sections.forEach((section) => {
		section.classList.remove('active');
	});

	const navBtns = document.querySelectorAll('.nav-btn');
	navBtns.forEach((btn) => {
		btn.classList.remove('active');
	});

	const targetSection = document.getElementById(sectionName);
	if (targetSection) {
		targetSection.classList.add('active');
	}

	const targetBtn = document.querySelector(
		`[onclick*="showSection('${sectionName}')"]`
	);
	if (targetBtn) {
		targetBtn.classList.add('active');
	}

	const pageTitle = document.getElementById('page-title');
	if (pageTitle && sectionTitles[sectionName]) {
		pageTitle.textContent = sectionTitles[sectionName];
	}

	currentSection = sectionName;
}

function closeTablet() {
	if (window.mtaSendData) {
		window.mtaSendData({
			action: 'closeTablet',
		});
	}
}

function openArrestPlayerModal() {
	if (window.mtaSendData) {
		window.mtaSendData({
			action: 'arrestPlayer',
		});
	}
}

function openNearbyPlayersModal() {
	if (window.mtaSendData) {
		window.mtaSendData({
			action: 'getNearbyPlayers',
		});
	}
}

function searchPlayer() {
	const playerID = document.getElementById('playerID').value;

	if (!playerID || playerID <= 0) {
		showMessage('error', 'Digite um ID válido!');
		return;
	}

	if (window.mtaSendData) {
		window.mtaSendData({
			action: 'searchPlayer',
			playerID: parseInt(playerID),
		});
	}

	showMessage('info', 'Buscando jogador...');
}

function displayPlayerData(data) {
	const resultsDiv = document.getElementById('player-results');

	if (!data) {
		resultsDiv.innerHTML = `
                    <div class="card">
                        <div class="empty-state">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill-slash" viewBox="0 0 16 16">
							<path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465m-4.56-1.096a3.5 3.5 0 1 1 4.949 4.95 3.5 3.5 0 0 1-4.95-4.95ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
						</svg>
                            <p>Jogador não encontrado!</p>
                        </div>
                    </div>
                `;
		return;
	}

	const licenseData = JSON.parse(data.License || '[[0, 0]]');

	resultsDiv.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
							<path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
						</svg>
                        <h3 class="card-title">Informações do Jogador</h3>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">ID:</span>
                            <span class="info-value">${data.id || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nome:</span>
                            <span class="info-value">${
															data.charname || 'N/A'
														}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status:</span>
                            <span class="info-value ${
															data.online ? 'status-online' : 'status-offline'
														}">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
								<circle cx="8" cy="8" r="8"/>
							</svg>
                                ${data.online ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Veículos:</span>
                            <span class="info-value">${
															data.vehicles || 0
														}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Habilitação:</span>
                            <span class="info-value">
                                <span class="badge ${
																	licenseData[0][0] === 1
																		? 'badge-success'
																		: 'badge-danger'
																}">
                                    ${
																			licenseData[0][0] === 1
																				? 'Possui'
																				: 'Não Possui'
																		}
                                </span>
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Porte de Arma:</span>
                            <span class="info-value">
                                <span class="badge ${
																	licenseData[0][1] === 1
																		? 'badge-success'
																		: 'badge-danger'
																}">
                                    ${
																			licenseData[0][1] === 1
																				? 'Possui'
																				: 'Não Possui'
																		}
                                </span>
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Emprego:</span>
                            <span class="info-value">${(
															data.job || 'N/A'
														).replace(/([a-z])([A-Z])/g, '$1 $2')}</span>
                        </div>
                    </div>
                </div>
            `;
}

function displayPlayerFines(fines) {
	const resultsDiv = document.getElementById('fines-results');

	if (!fines) {
		resultsDiv.innerHTML = `
                    <div class="empty-state">
                        	<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-archive-fill"
							viewBox="0 0 16 16"
						>
							<path
								d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8z"
							/>
						</svg>
                        <p>Jogador não encontrado!</p>
                    </div>
                `;
		return;
	}

	const finesData = Object.values(fines);

	if (!Array.isArray(finesData) || finesData.length === 0) {
		resultsDiv.innerHTML = `
                    <div class="empty-state">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-archive-fill"
							viewBox="0 0 16 16"
						>
							<path
								d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8z"
							/>
						</svg>
                        <p>Nenhuma multa registrada</p>
                    </div>
                `;
		return;
	}

	let finesHtml = finesData
		.map(
			(fine, index) => `
                <div class="fine-card">
                    <div class="fine-header">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-archive-fill"
							viewBox="0 0 16 16"
						>
							<path
								d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8z"
							/>
						</svg>
                        Multa #${index + 1}
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Condutor:</span>
                            <span class="info-value">${fine.drvv}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Proprietário:</span>
                            <span class="info-value">${fine.dono}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Motivo:</span>
                            <span class="info-value">${fine.motivo}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Placa:</span>
                            <span class="info-value">${fine.placa}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Valor:</span>
                            <span class="info-value">R$ ${parseFloat(
															fine.valor
														).toLocaleString('pt-BR', {
															minimumFractionDigits: 2,
														})}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Oficial:</span>
                            <span class="info-value">${fine.nome}</span>
                        </div>
                    </div>
                </div>
            `
		)
		.join('');

	resultsDiv.innerHTML = finesHtml;
}

function displayPlayerVehicles(vehicles) {
	const resultsDiv = document.getElementById('vehicles-results');

	if (!vehicles) {
		resultsDiv.innerHTML = `
                    <div class="empty-state">
                        <svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-car-front-fill"
							viewBox="0 0 16 16"
						>
							<path
								d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z"
							/>
						</svg>
                        <p>Jogador não encontrado!</p>
                    </div>
                `;
		return;
	}

	const vehiclesData = Object.values(vehicles);

	if (!Array.isArray(vehiclesData) || vehiclesData.length === 0) {
		resultsDiv.innerHTML = `
                    <div class="empty-state">
                        <svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-car-front-fill"
							viewBox="0 0 16 16"
						>
							<path
								d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z"
							/>
						</svg>
                        <p>Nenhum veículo registrado</p>
                    </div>
                `;
		return;
	}

	let vehiclesHtml = vehiclesData
		.map((vehicle) => {
			let colorArray = [0, 0, 0];
			try {
				const parsed = JSON.parse(vehicle.color);
				if (Array.isArray(parsed) && parsed[0]) {
					colorArray = parsed[0].slice(0, 3);
				}
			} catch (e) {
				console.warn('Erro ao parsear cor:', e);
			}

			const rgbString = `rgb(${colorArray.join(',')})`;

			return `
                    <div class="vehicle-card">
                        <div class="vehicle-header">
                            <svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-car-front-fill"
							viewBox="0 0 16 16"
						>
							<path
								d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z"
							/>
						</svg>
                            ${vehicle.realName || 'Veículo Desconhecido'}
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">ID:</span>
                                <span class="info-value">${vehicle.id}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Placa:</span>
                                <span class="info-value">${
																	vehicle.rendszam
																}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Valor Estimado:</span>
                                <span class="info-value">R$ ${(
																	vehicle.realValue || 0
																).toLocaleString('pt-BR', {
																	minimumFractionDigits: 2,
																})}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Cor Principal:</span>
                                <span class="info-value">
                                    <span class="color-indicator" style="background: ${rgbString};"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                `;
		})
		.join('');

	resultsDiv.innerHTML = vehiclesHtml;
}

function displayPlayerRecord(records) {
	console.log('Antecedentes:', records);
}

function displayNearbyPlayers(players) {
	const resultsDiv = document.getElementById('nearby-results');

	if (
		!Array.isArray(players) ||
		players.length === 0 ||
		!Array.isArray(players[0]) ||
		players[0].length === 0
	) {
		resultsDiv.innerHTML = `
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
							<path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
						</svg>
                        <p>Nenhum jogador próximo encontrado</p>
                    </div>
                `;
		return;
	}

	let playersHtml = players[0]
		.map(
			(player) => `
                <div class="player-card">
                    <div class="player-header">
                     	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
							<path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
						</svg>
                        ${player.name || 'Jogador Desconhecido'}
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">ID:</span>
                            <span class="info-value">${player.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Distância:</span>
                            <span class="info-value">${player.distance}m</span>
                        </div>
                    </div>
                </div>
            `
		)
		.join('');

	resultsDiv.innerHTML = playersHtml;
}

function loadPlayerForArrest() {
	const arrestPlayerID = document.getElementById('arrestPlayerID').value;

	window.mtaSendData({
		action: 'playerForArrest',
		playerID: parseInt(arrestPlayerID),
	});
}

function getPrisonStatus(data) {
	if (data.adminjail === 1) return 'Preso (Administrativamente)';
	if (data.jail === 1) return 'Preso (Policial)';
	return 'Livre';
}

function displayArrestedPlayer(data) {
	const infoContainer = document.getElementById('arrestPlayerInfo');
	const formContainer = document.querySelector('.arrest-form');

	if (!data || !data.id) {
		showMessage('error', 'Jogador não encontrado para apreensão!');
		if (infoContainer) infoContainer.classList.add('hidden');
		if (formContainer) formContainer.classList.add('hidden');
		return;
	}

	if (infoContainer) infoContainer.classList.remove('hidden');

	if (data.adminjail !== 1 && data.jail !== 1) {
		if (formContainer) formContainer.classList.remove('hidden');
	} else {
		if (formContainer) formContainer.classList.add('hidden');
		showMessage('error', 'Jogador já está preso!');
	}

	const nameElement = document.getElementById('arrestPlayerName');
	const prisonElement = document.getElementById('arrestPlayerPrison');

	if (nameElement) nameElement.textContent = data.charname || 'Desconhecido';
	if (prisonElement) {
		const status = getPrisonStatus(data);
		prisonElement.textContent = status;
		prisonElement.className = `info-value ${
			status === 'Livre' ? 'status-online' : 'status-offline'
		}`;
	}
}

function setLeaderStatus(isLeader) {
	console.log('É líder:', isLeader);
}

function executeArrest() {
	const playerID = document.getElementById('playerID').value;
	if (!playerID || playerID <= 0) {
		showMessage('error', 'Nenhum jogador selecionado');
		return;
	}

	const time = document.getElementById('arrestTime').value;
	const articles = document.getElementById('arrestArticles').value;
	const description = document.getElementById('arrestDescription').value;

	if (!time || isNaN(time) || time < 1 || time > 999) {
		showMessage('error', 'Tempo de prisão inválido (1-999 minutos)');
		return;
	}

	if (!articles || articles.trim() === '') {
		showMessage('error', 'Informe os artigos violados');
		return;
	}

	if (!description || description.trim() === '') {
		showMessage('error', 'Informe a descrição do crime');
		return;
	}

	if (window.mtaSendData) {
		window.mtaSendData({
			action: 'arrestPlayer',
			playerID: parseInt(playerID),
			time: time,
			articles: articles,
			description: description,
		});
	}

	showMessage('info', 'Processando prisão...');
}

function showMessage(type, message) {
	const existingMessage = document.querySelector('.message');
	if (existingMessage) {
		existingMessage.remove();
	}

	const messageDiv = document.createElement('div');
	messageDiv.className = `message ${type}`;

	const icon =
		type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info';

	const icons = {
		check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
						<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
					</svg>`,
		exclamation: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
						<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
					</svg>`,
		info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
						<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
					</svg>`,
	};

	messageDiv.innerHTML = `
          		${icons[icon]}
                <span style="margin-left: 0.5rem;">${message}</span>
            `;

	document.body.appendChild(messageDiv);

	setTimeout(() => {
		if (messageDiv.parentNode) {
			messageDiv.style.animation = 'slideInRight 0.3s ease reverse';
			setTimeout(() => messageDiv.remove(), 300);
		}
	}, 4000);
}

document.addEventListener('DOMContentLoaded', function () {
	console.log('Tablet carregado!');
	showMessage('success', 'Tablet inicializado com sucesso!');
});

document.getElementById('playerID').addEventListener('keypress', function (e) {
	if (e.key === 'Enter') {
		searchPlayer();
	}
});

document.querySelectorAll('.scrollable').forEach((element) => {
	element.style.scrollBehavior = 'smooth';
});

function showLoading(containerId) {
	const container = document.getElementById(containerId);
	if (container) {
		container.innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        <span>Carregando...</span>
                    </div>
                `;
	}
}

const originalSearchPlayer = searchPlayer;
searchPlayer = function () {
	showLoading('player-results');
	originalSearchPlayer();
};
