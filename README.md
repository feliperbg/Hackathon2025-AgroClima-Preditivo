AgroClima PreditivoO AgroClima Preditivo é uma aplicação web desenvolvida para o Hackathon 2025. A ferramenta oferece análises climáticas preditivas para a agricultura, ajudando agricultores a tomar decisões mais informadas sobre o plantio e a gestão de suas culturas, com um foco especial na sustentabilidade e na Ação Contra a Mudança Global do Clima (ODS 13).🚀 Funcionalidades PrincipaisPredição Climática Personalizada: Fornece uma análise de risco climático e uma janela de plantio recomendada para os próximos 15 dias, com base na localização geográfica e na cultura selecionada.Análise de Culturas e Clima: Oferece informações detalhadas sobre o impacto climático de diferentes culturas, suas vulnerabilidades e práticas sustentáveis para aumentar a resiliência.Integração com APIs Externas: Utiliza dados de fontes confiáveis como a API NASA POWER para informações agro-hidrológicas e a Visual Crossing para previsões meteorológicas.Visualização de Dados: Apresenta gráficos de predição de precipitação e temperatura para facilitar a compreensão das tendências climáticas.🛠️ Tecnologias UtilizadasBackendNode.jsExpress.jsMySQL2dotenvcorsFrontendHTML5, CSS3, JavaScript (ES6+)Chart.jsFont AwesomeAPIs ExternasNASA POWERGoogle GeminiVisual Crossing Weather🔧 Estrutura do Backend (API)O servidor, construído com Express.js, expõe os seguintes endpoints:GET /api/estados: Retorna a lista de todos os estados do Brasil.GET /api/municipios/:estadoId: Retorna a lista de municípios para um determinado estado.GET /api/sementes: Retorna a lista de culturas disponíveis.GET /api/cultura-info/:id: Retorna informações detalhadas de uma cultura, enriquecidas com uma análise de IA.POST /api/predicao: Retorna uma análise climática completa com base na localização e cultura.⚙️ Instalação e ExecuçãoSiga os passos abaixo para configurar e rodar o projeto localmente.Pré-requisitosNode.js (versão 14 ou superior)NPMUm servidor de banco de dados MySQL.1. Clonar o Repositóriogit clone https://[URL-DO-SEU-REPOSITORIO]/Hackathon2025-AgroClima-Preditivo.git
cd Hackathon2025-AgroClima-Preditivo
2. Instalar DependênciasExecute o comando para instalar todas as dependências do package.json:npm install
3. Configuração da Base de DadosCrie uma base de dados no seu servidor MySQL.Importe a estrutura e os dados iniciais utilizando o ficheiro database.sql.4. Variáveis de AmbienteCrie um ficheiro .env na raiz do projeto.Preencha-o com as suas credenciais da base de dados e as chaves de API:# Configuração do Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_DATABASE=nome_da_sua_base_de_dados

# Chaves de API
GEMINI_API_KEY=sua_chave_de_api_do_gemini
VISUAL_CROSSING_API_KEY=sua_chave_de_api_do_visual_crossing

# Porta do Servidor
PORT=3000
5. Iniciar o ServidorPara iniciar o servidor em modo de produção, utilize:npm start
Para o modo de desenvolvimento com reinicialização automática:npm run start-nodemon
O servidor estará a rodar em http://localhost:3000.Comando install-startPara uma configuração rápida, o comando npm run install-start instala as dependências e inicia o servidor num único passo.6. Aceder à AplicaçãoAbra o seu navegador e aceda à interface do utilizador através do ficheiro public/index.html.