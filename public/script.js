document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES E VARIÁVEIS GLOBAIS ---
    // A URL base aponta para o nosso servidor local em português
    const API_BASE_URL = 'http://localhost:3000'; 

    // Elementos da UI
    const stateSelect = document.getElementById('state-select');
    const citySelect = document.getElementById('city-select');
    const cropSelect = document.getElementById('crop-select');
    const analyzeButton = document.getElementById('analyze-button');
    const mapOverlay = document.getElementById('map-overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const guideSeedSelect = document.getElementById('guide-seed-select');
    const seedDetailsContainer = document.getElementById('seed-details-container');
    const quoteSeedSelect = document.getElementById('quote-seed-select');
    const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));
    const modalLoader = document.getElementById('modal-loader');
    const modalContentContainer = document.getElementById('modal-content-container');
    const modalLocationName = document.getElementById('modal-location-name');

    // Variáveis de estado
    let map;
    let marker;
    let selectedCoords = null;
    let quotesChart = null;


    // --- INICIALIZAÇÃO ---

    function initializeMap() {
        map = L.map('map').setView([-14.235, -51.925], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        map.on('click', onMapClick);
    }

    async function loadStates() {
        try {
            // ATUALIZAÇÃO: Chamando a nova rota /api/estados
            const response = await fetch(`${API_BASE_URL}/api/estados`);
            if (!response.ok) throw new Error('Falha ao carregar estados.');
            const states = await response.json();
            
            stateSelect.innerHTML = '<option selected disabled>Selecione um estado</option>';
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state.id;
                // ATUALIZAÇÃO: Usando a chave 'nome' que vem da API
                option.textContent = state.nome; 
                stateSelect.appendChild(option);
            });
        } catch (error) {
            console.error(error);
            stateSelect.innerHTML = '<option>Erro ao carregar</option>';
        }
    }

    async function loadCrops() {
        try {
            // ATUALIZAÇÃO: Chamando a nova rota /api/sementes
            const response = await fetch(`${API_BASE_URL}/api/sementes`);
            if (!response.ok) throw new Error('Falha ao carregar culturas.');
            const seeds = await response.json();
            
            cropSelect.innerHTML = '<option selected disabled>Selecione uma cultura</option>';
            guideSeedSelect.innerHTML = '<option selected disabled>Selecione uma cultura</option>';
            quoteSeedSelect.innerHTML = '<option selected disabled>Selecione uma cultura</option>';

            seeds.forEach(seed => {
                const option = document.createElement('option');
                option.value = seed.id;
                // ATUALIZAÇÃO: Usando a chave 'nome'
                option.textContent = seed.nome;

                cropSelect.appendChild(option.cloneNode(true));
                guideSeedSelect.appendChild(option.cloneNode(true));
                quoteSeedSelect.appendChild(option.cloneNode(true));
            });
            cropSelect.disabled = false;
        } catch (error) {
            console.error(error);
            cropSelect.innerHTML = '<option>Erro ao carregar</option>';
        }
    }


    // --- MANIPULADORES DE EVENTOS ---

    stateSelect.addEventListener('change', async () => {
        const estadoId = stateSelect.value;
        citySelect.innerHTML = '<option>Carregando...</option>';
        citySelect.disabled = true;
        mapOverlay.classList.remove('hidden');
        
        try {
            // ATUALIZAÇÃO: Chamando a nova rota /api/municipios
            const response = await fetch(`${API_BASE_URL}/api/municipios/${estadoId}`);
            if (!response.ok) throw new Error('Falha ao carregar municípios.');
            const cities = await response.json();
            
            citySelect.innerHTML = '<option selected disabled>Selecione um município</option>';
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                // ATUALIZAÇÃO: Usando a chave 'nome'
                option.textContent = city.nome;
                option.dataset.lat = city.latitude;
                option.dataset.lon = city.longitude;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
            loadCrops();
        } catch (error) {
            console.error(error);
            citySelect.innerHTML = '<option>Erro ao carregar</option>';
        }
    });

    citySelect.addEventListener('change', () => {
        const selectedOption = citySelect.options[citySelect.selectedIndex];
        const lat = selectedOption.dataset.lat;
        const lon = selectedOption.dataset.lon;

        if (lat && lon) {
            map.setView([lat, lon], 10);
            mapOverlay.classList.add('hidden');
        }
    });

    function onMapClick(e) {
        if (citySelect.value && citySelect.value !== '') {
            selectedCoords = e.latlng;
            
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker(selectedCoords).addTo(map)
                .bindPopup(`Área selecionada: <br> Lat: ${selectedCoords.lat.toFixed(4)}, Lon: ${selectedCoords.lng.toFixed(4)}`)
                .openPopup();
            
            analyzeButton.disabled = false;
        } else {
            alert('Por favor, selecione um estado e um município primeiro.');
        }
    }

    analyzeButton.addEventListener('click', async () => {
        if (!selectedCoords || !cropSelect.value) {
            alert('Por favor, clique no mapa para selecionar uma área e escolha uma cultura.');
            return;
        }
        
        const selectedCityName = citySelect.options[citySelect.selectedIndex].text;
        const selectedCropName = cropSelect.options[cropSelect.selectedIndex].text;
        modalLocationName.textContent = `${selectedCityName} - ${selectedCropName}`;
        
        resultsModal.show();
        modalLoader.classList.remove('d-none');
        modalContentContainer.classList.add('d-none');
        modalContentContainer.innerHTML = '';

        try {
            // ATUALIZAÇÃO: Chamando a nova rota /api/predicao e usando a chave 'sementeId'
            const response = await fetch(`${API_BASE_URL}/api/predicao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lat: selectedCoords.lat,
                    lon: selectedCoords.lng,
                    sementeId: cropSelect.value
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.erro || 'Falha na predição.');
            }

            const data = await response.json();
            displayResults(data);
            console.log(data);

        } catch (error) {
            console.error(error);
            displayError(error.message);
        } finally {
            modalLoader.classList.add('d-none');
            modalContentContainer.classList.remove('d-none');
        }
    });

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const sectionId = link.getAttribute('data-section');
            contentSections.forEach(section => {
                section.id === sectionId ? section.classList.remove('d-none') : section.classList.add('d-none');
            });

            if (sectionId === 'quotes-section' && quoteSeedSelect.options.length > 1) {
                updateQuotesChart(quoteSeedSelect.value);
            }
            if (sectionId === 'seeds-section' && guideSeedSelect.options.length > 1) {
                updateSeedGuide(guideSeedSelect.value);
            }
        });
    });

    guideSeedSelect.addEventListener('change', () => updateSeedGuide(guideSeedSelect.value));
    quoteSeedSelect.addEventListener('change', () => updateQuotesChart(quoteSeedSelect.value));


    // --- FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO ---

    function displayResults(data) {
        // ATUALIZAÇÃO: Lendo as chaves em português da resposta da API ('analise', 'previsao')
        const { analise, previsao } = data;

        const severityMap = {
            'Baixo': { bg: 'success-subtle', text: 'success-emphasis' },
            'Médio': { bg: 'warning-subtle', text: 'warning-emphasis' },
            'Alto': { bg: 'danger-subtle', text: 'danger-emphasis' }
        };
        
        let risksHtml = analise.analise_risco.map(risk => `
            <div class="list-group-item d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${risk.risco}</div>
                    ${risk.descricao}
                </div>
                <span class="badge bg-${severityMap[risk.severidade]?.bg || 'secondary-subtle'} text-${severityMap[risk.severidade]?.text || 'secondary-emphasis'} rounded-pill p-2">${risk.severidade}</span>
            </div>
        `).join('');

        const html = `
            <div class="row g-4">
                <div class="col-lg-12">
                     <div class="card border-primary">
                        <div class="card-body d-flex align-items-center">
                            <div class="icon-container icon-primary me-3"><i class="fas fa-calendar-check"></i></div>
                            <div>
                                <h5 class="card-title mb-1">Janela de Plantio Recomendada</h5>
                                <p class="card-text mb-0">${analise.janela_plantio.recomendacao}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <h5 class="mb-3">Análise de Riscos</h5>
                    <div class="list-group">
                        ${risksHtml || '<p>Nenhum risco significativo identificado.</p>'}
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card border-success mb-3">
                        <div class="card-body d-flex align-items-center">
                            <div class="icon-container icon-success me-3"><i class="fas fa-lightbulb"></i></div>
                            <div>
                                <h5 class="card-title mb-1">Sugestão Prática</h5>
                                <p class="card-text mb-0">${analise.sugestao_pratica}</p>
                            </div>
                        </div>
                    </div>
                    <div class="card border-info">
                        <div class="card-body d-flex align-items-center">
                            <div class="icon-container icon-info me-3"><i class="fas fa-clipboard-check"></i></div>
                            <div>
                                <h5 class="card-title mb-1">Resumo Geral</h5>
                                <p class="card-text mb-0">${analise.resumo_geral}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h5 class="text-center">Previsão de Precipitação (mm)</h5>
                    <canvas id="precipitationChartModal"></canvas>
                </div>
                <div class="col-md-6">
                    <h5 class="text-center">Previsão de Temperatura (°C)</h5>
                    <canvas id="temperatureChartModal"></canvas>
                </div>
            </div>
        `;
        modalContentContainer.innerHTML = html;

        createPrecipitationChart(previsao);
        createTemperatureChart(previsao);
    }

    function displayError(message) {
        modalContentContainer.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center" role="alert">
                <i class="fas fa-exclamation-triangle fa-2x me-3"></i>
                <div>
                    <h4 class="alert-heading">Ocorreu um Erro</h4>
                    <p>${message}</p>
                    <hr>
                    <p class="mb-0">Por favor, verifique se o servidor backend está rodando e se as chaves de API estão configuradas corretamente no arquivo .env.</p>
                </div>
            </div>
        `;
    }

    function createPrecipitationChart(forecastDays) {
        const ctx = document.getElementById('precipitationChartModal').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: forecastDays.map(d => new Date(d.datetimeEpoch * 1000).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})),
                datasets: [{
                    label: 'Precipitação (mm)',
                    data: forecastDays.map(d => d.precip),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    function createTemperatureChart(forecastDays) {
        const ctx = document.getElementById('temperatureChartModal').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecastDays.map(d => new Date(d.datetimeEpoch * 1000).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})),
                datasets: [
                    {
                        label: 'Máxima (°C)',
                        data: forecastDays.map(d => d.tempmax),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Mínima (°C)',
                        data: forecastDays.map(d => d.tempmin),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false,
                        tension: 0.3
                    }
                ]
            }
        });
    }

    async function updateSeedGuide(seedId) {
        if (!seedId) return;
        try {
            // ATUALIZAÇÃO: Chamando a nova rota /api/semente
            const response = await fetch(`${API_BASE_URL}/api/semente/${seedId}`);
            const seed = await response.json();
            
            // ATUALIZAÇÃO: Lendo as chaves em português do objeto 'seed'
            seedDetailsContainer.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header fs-5">
                        <i class="fas ${seed.classe_icone} me-2"></i> ${seed.nome} - <em>${seed.nome_cientifico}</em>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${seed.descricao}</p>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><strong>Clima Ideal:</strong> ${seed.clima_ideal}</li>
                            <li class="list-group-item"><strong>Solo Ideal:</strong> ${seed.solo_ideal}</li>
                            <li class="list-group-item"><strong>Fertilizantes:</strong> ${seed.fertilizantes}</li>
                        </ul>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(error);
            seedDetailsContainer.innerHTML = '<div class="alert alert-danger">Não foi possível carregar os detalhes da cultura.</div>';
        }
    }

    async function updateQuotesChart(seedId) {
        if (!seedId) return;
        try {
            // ATUALIZAÇÃO: Chamando a nova rota /api/cotacoes
            const response = await fetch(`${API_BASE_URL}/api/cotacoes/${seedId}`);
            const data = await response.json();

            if (data.erro) {
                if (quotesChart) quotesChart.destroy();
                const ctx = document.getElementById('quotesChart').getContext('2d');
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.font = "16px Arial";
                ctx.fillStyle = "grey";
                ctx.textAlign = "center";
                ctx.fillText(data.erro, ctx.canvas.width / 2, ctx.canvas.height / 2);
                return;
            }

            // ATUALIZAÇÃO: Lendo as chaves 'precos', 'data' e 'preco'
            const labels = data.precos.map(p => p.data);
            const prices = data.precos.map(p => p.preco);

            if (quotesChart) {
                quotesChart.destroy();
            }

            const ctx = document.getElementById('quotesChart').getContext('2d');
            // ATUALIZAÇÃO: Lendo a chave 'nomeSemente'
            quotesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Preço da Saca de ${data.nomeSemente} (R$)`,
                        data: prices,
                        borderColor: 'rgba(25, 135, 84, 1)',
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error(error);
        }
    }


    // --- CHAMADAS INICIAIS ---
    initializeMap();
    loadStates();
    loadCrops();
});
