DROP DATABASE IF EXISTS flowtech;
CREATE DATABASE IF NOT EXISTS flowtech;
USE flowtech;

-- | CRIAÇÃO DAS TABELAS | --
CREATE TABLE IF NOT EXISTS endereco (
    id_endereco 		INT NOT NULL AUTO_INCREMENT,
    
    cep 				CHAR(8) NOT NULL,		-- XXXXX-XXX
    logradouro 			VARCHAR(120) NULL,		-- Avenida/Rua XPTO.
    bairro 				VARCHAR(60) NULL,		-- Bairro Abc.
    localidade 			VARCHAR(60) NOT NULL,	-- São Paulo
    uf 					CHAR(2) NOT NULL,		-- SP
    numero 				VARCHAR(20) NULL,		-- XXXX
    complemento 		VARCHAR(60) NULL,
    km 					VARCHAR(20) NULL,		-- 54
    sentido 			VARCHAR(30) NULL,		-- Sul
    lat 				DECIMAL(10,4) NULL,		-- -23.55XX
    lon 				DECIMAL(10,4) NULL,		-- -46.63XX
    data_criacao 		DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id_endereco)
);

CREATE TABLE IF NOT EXISTS empresa (
    id_empresa 			INT NOT NULL AUTO_INCREMENT,
    endereco_id 		INT NULL,
    
    cnpj 				CHAR(14) NOT NULL UNIQUE,
    razao_social 		VARCHAR(120) NOT NULL,
    nome_fantasia 		VARCHAR(120) NOT NULL,
    email 				VARCHAR(120) NOT NULL UNIQUE,

    -- Dados da empresa para integrar com o Jira
    jira_email          VARCHAR(120) NULL,
    jira_base_url       VARCHAR(255) NULL,
    jira_project_key    VARCHAR(10)  NULL,
    jira_api_key        VARCHAR(255) NULL,

    data_criacao 		DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_empresa),
    CONSTRAINT fk_empresa_endereco
        FOREIGN KEY (endereco_id) REFERENCES endereco(id_endereco)
);

CREATE TABLE IF NOT EXISTS embarcado (
    id_embarcado 		INT NOT NULL AUTO_INCREMENT,
    empresa_id 			INT NOT NULL,
    endereco_id 		INT NOT NULL UNIQUE,
    
    endereco_mac 		CHAR(12) NOT NULL UNIQUE,
    apelido 			VARCHAR(60) NOT NULL,
    modelo 				VARCHAR(60) NOT NULL,
    status 				TINYINT(1) NOT NULL DEFAULT 1,
    data_criacao 		DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_embarcado, empresa_id),
    CONSTRAINT fk_embarcado_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresa(id_empresa) ON DELETE CASCADE,
	CONSTRAINT fk_embarcado_endereco
        FOREIGN KEY (endereco_id) REFERENCES endereco(id_endereco)
);

CREATE TABLE IF NOT EXISTS componente (
    id_componente INT NOT NULL AUTO_INCREMENT,
    
    nome 				VARCHAR(60) NOT NULL,
    unidade_medida 		VARCHAR(20) NOT NULL,
    depende_de			VARCHAR(60) NOT NULL,
    data_criacao 		DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_componente)
);

CREATE TABLE IF NOT EXISTS parametro (
    embarcado_id 		INT NOT NULL,
    empresa_id 			INT NOT NULL,
    componente_id 		INT NOT NULL,
    
    status 				TINYINT(1) NOT NULL DEFAULT 1,
    limite_max 			DECIMAL(10,3) NOT NULL,
    limite_min 			DECIMAL(10,3) NULL,
    data_criacao 		DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
	PRIMARY KEY (embarcado_id, empresa_id, componente_id),
    CONSTRAINT fk_parametro_embarcado
        FOREIGN KEY (embarcado_id, empresa_id) REFERENCES embarcado(id_embarcado, empresa_id) ON DELETE CASCADE,
    CONSTRAINT fk_parametro_componente
        FOREIGN KEY (componente_id) REFERENCES componente(id_componente)
);

CREATE TABLE IF NOT EXISTS codigo_autenticacao (
    id_codigo 		INT NOT NULL AUTO_INCREMENT,
    empresa_id 		INT NOT NULL,
    
    cod 			CHAR(5) NOT NULL,
    status 			VARCHAR(20) NOT NULL,
    data_criacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id_codigo, empresa_id),
    CONSTRAINT fk_codigo_autenticacao_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresa(id_empresa), -- não coloco ON DELETE CASCADE aqui, com a intenção de manter os registros
	
    CONSTRAINT chk_codigo_autenticacao_status
		CHECK(status IN("aberto", "usado", "expirado")),
	CONSTRAINT uk_codigo_autenticacao_cod_empresa
		UNIQUE(cod, empresa_id)
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario 			INT NOT NULL AUTO_INCREMENT,
    empresa_id 			INT NOT NULL,
    supervisor_id 		INT NULL,
    
    nome 				VARCHAR(120) NOT NULL,
    email 				VARCHAR(120) NOT NULL UNIQUE,
    senha 				VARCHAR(255) NOT NULL,
    nivel_acesso 		TINYINT(1) NOT NULL DEFAULT 2, -- considerando: 0 - dev | 1 - adm | 2 - usr comum
    data_criacao 		DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id_usuario),
    CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresa(id_empresa),
    CONSTRAINT fk_usuario_supervisor
        FOREIGN KEY (supervisor_id) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS log_usuario (
    id_log				INT NOT NULL AUTO_INCREMENT,
    usuario_id 			INT NOT NULL,

    acao 				VARCHAR(255) NOT NULL,
    data_criacao 		DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_log, usuario_id),
    CONSTRAINT fk_log_usuario_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

-- | CRIAÇÃO DAS PROCEDURES | --
DELIMITER $$
CREATE PROCEDURE sp_cadastrar_empresa(
	IN in_cnpj CHAR(14),
    IN in_razao_social VARCHAR(120),
    IN in_nome_fantasia VARCHAR(120),
    IN in_email VARCHAR(120),
    IN in_senha VARCHAR(255)
) BEGIN
	-- Tratamento de Erro na Procedure
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro no Cadastro de Empresa.';
	END;

	-- Corpo da Procedure
	START TRANSACTION;
        -- 1. Criar Empresa
		INSERT INTO empresa(cnpj, razao_social, nome_fantasia, email)
			VALUES (in_cnpj, in_razao_social, in_nome_fantasia, in_email);
			
		-- 2. Criar Usuário ADM da Empresa criada
		INSERT INTO usuario(empresa_id, nome, email, senha, nivel_acesso)
			VALUES (LAST_INSERT_ID(), CONCAT("Usuário de ", in_nome_fantasia), in_email, SHA2(in_senha, 256), 1);
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_cadastrar_empresa_com_endereco(
	-- info necessária p/ cadastrar endereço
	IN in_cep CHAR(8),
    IN in_logradouro VARCHAR(120),
    IN in_bairro VARCHAR(60),
    IN in_numero VARCHAR(20),
    IN in_complemento VARCHAR(60),
    IN in_localidade VARCHAR(60),
    IN in_uf CHAR(2),
	-- info necessária p/ cadastrar empresa/usuário-padrão
	IN in_cnpj CHAR(14),
    IN in_razao_social VARCHAR(120),
    IN in_nome_fantasia VARCHAR(120),
    IN in_email VARCHAR(120),
    IN in_senha VARCHAR(255)
) BEGIN
	-- Tratamento de Erro na Procedure
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro no Cadastro de Empresa.';
	END;

	-- Corpo da Procedure
	START TRANSACTION;
		-- 1. Criar Endereço
        INSERT INTO endereco(cep, logradouro, bairro, numero, complemento, localidade, uf)
			VALUES(in_cep, in_logradouro, in_bairro, in_numero, IFNULL(in_complemento, NULL), in_localidade, in_uf);
        
        -- 2. Criar Empresa
		INSERT INTO empresa(endereco_id, cnpj, razao_social, nome_fantasia, email)
			VALUES (LAST_INSERT_ID(), in_cnpj, in_razao_social, in_nome_fantasia, in_email);
			
		-- 3. Criar Usuário ADM da Empresa criada
		INSERT INTO usuario(empresa_id, nome, email, senha, nivel_acesso)
			VALUES (LAST_INSERT_ID(), CONCAT("Usuário de ", in_nome_fantasia), in_email, SHA2(in_senha, 256), 1);
    COMMIT;
END$$
DELIMITER ;

-- | INSERTS PADRÃO | --

-- Componentes Monitorados pela Aplicação
INSERT INTO componente(nome, unidade_medida, depende_de)
	VALUES ('cpu', 'pct', 'psutil.cpu_percent'),
    ('ram', 'MiB', 'psutil.virtual_memory'),
    ('disco', 'GiB', 'psutil.disk_usage'),
    ('placa_rede', 'Mbps', 'psutil.net_if_stats');

-- Empresa/Usuário para uso INTERNO da FlowTech
CALL sp_cadastrar_empresa_com_endereco(
	"00000000",
    "Rua XPTO.",
    "Abc.",
    "000",
    NULL,
    "São Paulo",
    "SP",
    "00000000000000",
    "FlowTech Soluções Tecnológicas S.A.",
    "FlowTech",
    "infra@flowtech.com.br",
    "Sptech#2026"
);
UPDATE usuario 
	SET nivel_acesso = 0 -- permissão de DESENVOLVEDOR, maior possível.
WHERE email = "infra@flowtech.com.br";