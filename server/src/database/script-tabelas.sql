-- DROP DATABASE IF EXISTS flowtech;
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
    endereco_id 		INT NOT NULL,
    
    endereco_mac 		CHAR(17) NOT NULL UNIQUE,
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
    
    nome 				VARCHAR(60) NOT NULL UNIQUE,
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

CREATE TABLE IF NOT EXISTS codigo_acesso (
    id_codigo 		INT NOT NULL AUTO_INCREMENT,
    usuario_id		INT NOT NULL,
    empresa_id 		INT NOT NULL,

    codigo 			CHAR(12) NOT NULL UNIQUE,
    status 			VARCHAR(20) NOT NULL DEFAULT "valido",
    qtd_usos_max 	INTEGER NOT NULL DEFAULT 1,
    qtd_usos		INTEGER NOT NULL DEFAULT 0,

	data_expiracao	DATETIME NOT NULL,   
	data_criacao 	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   
    PRIMARY KEY(id_codigo, usuario_id, empresa_id),
    CONSTRAINT fk_codigo_acesso_usuario
		FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_codigo_acesso_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresa(id_empresa),
        
    CONSTRAINT chk_codigo_autenticacao_status
		CHECK(status IN("valido", "usado", "expirado"))
);

-- | CRIAÇÃO DAS VIEWS | --

-- VW01: Retorna uma lista de embarcados com seus componentes monitorados + parametrizações
CREATE OR REPLACE VIEW vw_componentes_monitorados
AS
SELECT 
	e.id_embarcado, e.empresa_id, e.endereco_mac, e.apelido AS "servidor", 
    c.nome AS "componente", c.unidade_medida, c.depende_de, 
    p.limite_max, p.limite_min
FROM embarcado e 
JOIN parametro p
	ON e.id_embarcado = p.embarcado_id AND e.empresa_id = p.empresa_id
JOIN componente c
	ON p.componente_id = c.id_componente
WHERE e.status <> 0 AND p.status <> 0;

-- | CRIAÇÃO DAS PROCEDURES | --

-- SPO1: Cadastra Empresa + primeiro Usuário com privilégio de ADM
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
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro no Cadastro de Empresa';
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

-- SPO2: Cadastra Empresa + Endereço + primeiro Usuário com privilégio de ADM
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
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro no Cadastro de Empresa';
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

-- SPO3: Cadastra Usuário via Código de Acesso
DELIMITER $$
CREATE PROCEDURE sp_cadastrar_usuario(
	IN in_codigo CHAR(12),
    IN in_nome VARCHAR(120),
    IN in_email VARCHAR(255),
    IN in_senha VARCHAR(255)
) BEGIN
	-- Variáveis da Procedure
    DECLARE v_empresa_id INT;
    DECLARE v_supervisor_id INT;

	-- Tratamento de Erro na Procedure
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro no Cadastro de Usuário via Código';
	END;

	-- Corpo da Procedure
	START TRANSACTION;			
		-- 1. Encontrar ID da Empresa e do Supervisor
        SET v_empresa_id = 
			(SELECT c.empresa_id FROM codigo_acesso c JOIN empresa e ON c.empresa_id = e.id_empresa WHERE codigo = in_codigo AND `status` = 'valido');
        
        SET v_supervisor_id = 
			(SELECT c.usuario_id FROM codigo_acesso c JOIN usuario u ON c.usuario_id = u.id_usuario WHERE codigo = in_codigo AND `status` = 'valido');
    
		-- 2. Cadastrar Usuário com ID da Empresa e do Supervisor corretos
		INSERT INTO usuario(empresa_id, supervisor_id, nome, email, senha, nivel_acesso)
			VALUES (v_empresa_id, v_supervisor_id, in_nome, in_email, SHA2(in_senha, 256), 2);
            
		-- 3. Atualizar usos do Código de acesso utilizado
        UPDATE codigo_acesso
        SET
			qtd_usos = CASE
				WHEN qtd_usos + 1 > qtd_usos_max THEN qtd_usos_max
                ELSE qtd_usos + 1
            END,
            `status` = CASE
				WHEN qtd_usos + 1 > qtd_usos_max THEN 'usado'
                ELSE 'valido'
            END
        WHERE codigo = in_codigo;
    COMMIT;
END$$
DELIMITER ;

-- SPO4: Cadastra Embarcado com Endereço
DELIMITER $$
CREATE PROCEDURE sp_cadastrar_embarcado_com_endereco(
	-- dados para cadastro do embarcado
	IN in_empresa_id INT,
    IN in_endereco_mac CHAR(17),
    IN in_apelido VARCHAR(60),
    IN in_modelo VARCHAR(60),
    -- dados para o cadastro do endereco
    IN in_cep CHAR(8), 
    IN in_logradouro VARCHAR(120), 
    IN in_bairro VARCHAR(60),
    IN in_localidade VARCHAR(60), 
    IN in_uf CHAR(2), 
    IN in_numero VARCHAR(20),
	IN in_complemento VARCHAR(60),
    IN in_km VARCHAR(20), 
    IN in_sentido VARCHAR(30),
    IN in_lat DECIMAL(10, 4),
    IN in_lon DECIMAL(10, 4)
) BEGIN
	-- Tratamento de Erro na Procedure
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro no Cadastro de Usuário via Código';
	END;

	-- Corpo da Procedure
	START TRANSACTION;			
		-- 1. Insert na tabela Endereco
        INSERT INTO endereco(cep, logradouro, bairro, localidade, uf, numero, complemento, km, sentido, lat, lon)
			VALUES(in_cep, in_logradouro, in_bairro, in_localidade, in_uf, in_numero, in_complemento, in_km, in_sentido, in_lat, in_lon);
            
		-- 2. Inset em Embarcado
        INSERT INTO embarcado(empresa_id, endereco_id, endereco_mac, apelido, modelo)
			VALUES(in_empresa_id, LAST_INSERT_ID(), in_endereco_mac, in_apelido, in_modelo);
    COMMIT;
END$$
DELIMITER ;

-- | INSERTS PADRÃO | --

-- I01: Insere componentes monitorados pela aplicação
INSERT INTO componente (nome, unidade_medida, depende_de)
VALUES
    -- CPU
    ('cpu_usage_pct', 'pct', 'psutil.cpu_percent'),
    ('cpu_freq_mhz', 'MHz', 'psutil.cpu_freq'),

    -- Memória RAM
    ('ram_usage_mb', 'MiB', 'psutil.virtual_memory'),

    -- Memória SWAP
    ('swap_usage_mb', 'MiB', 'psutil.swap_memory'),

    -- Armazenamento
    ('disk_usage_mb', 'MiB', 'psutil.disk_usage'),

    -- Rede e Latência
    ('download_mbps', 'Mbps', 'psutil.net_io_counters'),
    ('upload_mbps', 'Mbps', 'psutil.net_io_counters'),
    ('latency_ms', 'ms', 'ping');

-- I02: Insere Empresa/Usuário padrão para o uso INTERNO da FlowTech
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