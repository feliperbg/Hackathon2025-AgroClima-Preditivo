AgroClima Preditivo
O AgroClima Preditivo é uma aplicação web desenvolvida para o Hackathon 2025. A ferramenta oferece análises climáticas preditivas para a agricultura, ajudando agricultores a tomar decisões mais informadas sobre o plantio e a gestão de suas culturas, com um foco especial na sustentabilidade e na Ação Contra a Mudança Global do Clima (ODS 13).

🚀 Funcionalidades Principais
Predição Climática Personalizada: Fornece uma análise de risco climático e uma janela de plantio recomendada para os próximos 15 dias, com base na localização geográfica (estado e município) e na cultura selecionada.

Análise de Culturas e Clima: Oferece informações detalhadas sobre o impacto climático de diferentes culturas, suas vulnerabilidades às mudanças climáticas e práticas sustentáveis para aumentar a resiliência.

Integração com APIs Externas: Utiliza dados de fontes confiáveis como a API NASA POWER para informações agro-hidrológicas e a Visual Crossing para previsões meteorológicas detalhadas.

Visualização de Dados: Apresenta gráficos de predição de precipitação e temperatura para facilitar a compreensão das tendências climáticas futuras.

🛠️ Tecnologias Utilizadas
Backend
Node.js

Express.js: Framework para a criação da API RESTful.

MySQL2: Driver para a comunicação com o banco de dados MySQL.

dotenv: Para gestão de variáveis de ambiente.

cors: Para habilitar o Cross-Origin Resource Sharing.

Frontend
HTML5, CSS3, JavaScript (ES6+)

Chart.js: Para a criação dos gráficos de predição.

Font Awesome: Para a utilização de ícones.

APIs Externas
NASA POWER: Fornece dados de satélite sobre temperatura do solo, humidade e evapotranspiração.

Google Gemini: Utilizada para gerar análises e recomendações agronômicas inteligentes com base nos dados coletados.

Visual Crossing Weather: Fornece os dados de previsão do tempo.

🔧 Estrutura do Backend (API)
O servidor, construído com Express.js, expõe os seguintes endpoints:

GET /api/estados: Retorna a lista de todos os estados do Brasil.

GET /api/municipios/:estadoId: Retorna a lista de municípios para um determinado estado.

GET /api/sementes: Retorna a lista de culturas (sementes) disponíveis na base de dados.

GET /api/cultura-info/:id: Retorna informações detalhadas de uma cultura específica, enriquecidas com uma análise de IA sobre impacto climático e práticas sustentáveis.

POST /api/predicao: Recebe coordenadas (latitude, longitude) e o ID de uma semente e retorna uma análise climática completa, combinando dados da NASA, previsão do tempo e uma análise agronômica gerada por IA.

⚙️ Instalação e Execução
Siga os passos abaixo para configurar e rodar o projeto localmente.

Pré-requisitos
Node.js (versão 14 ou superior)

NPM

Um servidor de banco de dados MySQL.

1. Clonar o Repositório
Bash

git clone https://[URL-DO-SEU-REPOSITORIO]/Hackathon2025-AgroClima-Preditivo.git
cd Hackathon2025-AgroClima-Preditivo
2. Instalar Dependências
Execute o seguinte comando para instalar todas as dependências do backend listadas no package.json:

Bash

npm install
3. Configuração da Base de Dados
Crie uma base de dados no seu servidor MySQL.

Importe a estrutura das tabelas e os dados iniciais utilizando o ficheiro database.sql fornecido no projeto.

4. Variáveis de Ambiente
Crie um ficheiro chamado .env na raiz do projeto.

Copie o conteúdo do ficheiro .env.example (se existir) para o seu novo ficheiro .env.

Preencha o ficheiro .env com as suas credenciais da base de dados e as chaves de API necessárias:

Snippet de código

# Configuração do Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_DATABASE=nome_da_sua_base_de_dados

# Chaves de API
GEMINI_API_KEY=sua_chave_de_api_do_gemini
VISUAL_CROSSING_API_KEY=sua_chave_de_api_do_visual_crossing

# Porta do Servidor
PORT=3000
5. Comando install-start
Para conveniência, o projeto inclui um script personalizado chamado install-start. Este comando combina a instalação das dependências e a inicialização do servidor num único passo.

Bash

npm run install-start
Ao executar este comando, o npm irá primeiro executar npm install cors dotenv express mysql2, que garante que todas as principais dependências (cors, dotenv, express e mysql2) estão instaladas no seu projeto.

6. Iniciar o Servidor
Para iniciar o servidor em modo de produção, utilize:

Bash

npm start
Para iniciar o servidor em modo de desenvolvimento com reinicialização automática (usando o nodemon):

Bash

npm run start-nodemon
O servidor estará a rodar em http://localhost:3000.



7. Aceder à Aplicação
Abra o seu navegador e aceda à interface do utilizador através do ficheiro public/index.html.
