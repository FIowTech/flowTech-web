CREATE DATABASE IF NOT EXISTS flowtech;

USE flowtech;

-- Empresas
CREATE TABLE empresas (
  id INT NOT NULL AUTO_INCREMENT,
  cnpj CHAR(14) NOT NULL,
  razao_social VARCHAR(150) NOT NULL,
  nome_fantasia VARCHAR(55) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY cnpj_UNIQUE (cnpj)
);

-- Usuários
CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(45) NULL,
  email VARCHAR(45) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  fk_empresa INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email_UNIQUE (email),
  KEY fk_usuarios_empresa_idx (fk_empresa),
  CONSTRAINT fk_usuarios_empresa
    FOREIGN KEY (fk_empresa) REFERENCES empresas (id)
);

-- Pórticos
CREATE TABLE porticos (
  id INT NOT NULL AUTO_INCREMENT,
  fk_empresa INT NOT NULL,
  codigo_identificacao VARCHAR(45) NULL,
  PRIMARY KEY (id),
  KEY fk_porticos_empresa_idx (fk_empresa),
  CONSTRAINT fk_porticos_empresa
    FOREIGN KEY (fk_empresa) REFERENCES empresas (id)
);

-- Endereço dos pórticos
CREATE TABLE endereco_porticos (
  id INT NOT NULL AUTO_INCREMENT,
  fk_portico INT NOT NULL,
  rodovia VARCHAR(50) NULL,
  km DECIMAL(6,2) NULL,
  sentido VARCHAR(10) NULL,
  uf CHAR(2) NULL,
  PRIMARY KEY (id),
  KEY fk_endereco_porticos_portico_idx (fk_portico),
  CONSTRAINT fk_endereco_porticos_portico
    FOREIGN KEY (fk_portico) REFERENCES porticos (id)
);

-- Dispositivos embarcados
CREATE TABLE embarcados (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(45) NULL,
  uuid CHAR(36) NULL,
  status TINYINT(1) NULL,
  fk_portico INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uuid_UNIQUE (uuid),
  KEY fk_embarcados_portico_idx (fk_portico),
  CONSTRAINT fk_embarcados_portico
    FOREIGN KEY (fk_portico) REFERENCES porticos (id)
);

-- Componentes
CREATE TABLE componentes (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(15) NOT NULL,
  PRIMARY KEY (id)
);

-- Parâmetros (relação embarcado x componente)
CREATE TABLE parametros (
  fk_embarcado INT NOT NULL,
  fk_componente INT NOT NULL,
  valor_minimo FLOAT NULL,
  valor_maximo FLOAT NULL,
  unidade_medida VARCHAR(45) NULL,
  PRIMARY KEY (fk_embarcado, fk_componente),
  KEY fk_parametros_componente_idx (fk_componente),
  KEY fk_parametros_embarcado_idx (fk_embarcado),
  CONSTRAINT fk_parametros_embarcado
    FOREIGN KEY (fk_embarcado) REFERENCES embarcados (id),
  CONSTRAINT fk_parametros_componente
    FOREIGN KEY (fk_componente) REFERENCES componentes (id)
);

-- Logradouros (base de CEPs)
CREATE TABLE logradouros (
  cep CHAR(8) NOT NULL,
  logradouro VARCHAR(120) NOT NULL,
  bairro VARCHAR(80) NOT NULL,
  localidade VARCHAR(60) NOT NULL,
  uf CHAR(2) NOT NULL,
  PRIMARY KEY (cep)
);

-- Endereço das empresas
CREATE TABLE endereco_empresas (
  id INT NOT NULL AUTO_INCREMENT,
  fk_empresa INT NOT NULL,
  fk_logradouro CHAR(8) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100) NULL,
  PRIMARY KEY (id),
  KEY fk_endereco_empresas_logradouro_idx (fk_logradouro),
  CONSTRAINT fk_endereco_empresas_empresa
    FOREIGN KEY (fk_empresa) REFERENCES empresas (id),
  CONSTRAINT fk_endereco_empresas_logradouro
    FOREIGN KEY (fk_logradouro) REFERENCES logradouros (cep)
);

CREATE TABLE codigos_autenticacao (
  id INT NOT NULL AUTO_INCREMENT,
  fk_empresa INT NOT NULL,
  codigo_autenticacao CHAR(5) NOT NULL,
  data_criacao DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY fk_codigos_autenticacao_empresa_idx (fk_empresa),
  CONSTRAINT fk_codigos_autenticacao_empresa
    FOREIGN KEY (fk_empresa) REFERENCES empresas (id)
);

DELIMITER $$
DROP PROCEDURE IF EXISTS cadastrarEmpresa $$
CREATE PROCEDURE cadastrarEmpresa(
	IN p_cnpj char(14),
    IN p_r_social varchar(45),
    IN p_n_fantasia varchar(45),
    IN p_cep char(8),
    IN p_logradouro varchar(120),
    IN p_bairro char(80),
    IN p_localidade char(60),
    IN p_uf char(2),
    IN p_numero varchar(20),
    IN p_complemento varchar(100),
    IN p_codigo_empresa char(5)
    )
BEGIN
	DECLARE contador INTEGER;
  DECLARE id_empresa INTEGER;

	INSERT INTO empresas(cnpj, razao_social, nome_fantasia) VALUES (p_cnpj, p_r_social, p_n_fantasia);
	SET id_empresa = LAST_INSERT_ID();
    
  SELECT COUNT(*) INTO contador FROM logradouros WHERE p_cep = cep;
    
  IF(contador = 0) THEN
		INSERT INTO logradouros VALUES (p_cep, p_logradouro, p_bairro, p_localidade, p_uf);
	END IF;
    
	INSERT INTO endereco_empresas(fk_empresa, fk_logradouro, numero, complemento) VALUES ((select id from empresas where cnpj = p_cnpj), p_cep, p_numero, p_complemento);
	INSERT INTO codigos_autenticacao (fk_empresa, codigo_autenticacao, data_criacao) VALUES (id_empresa, p_codigo_empresa, NOW());
END $$	
DELIMITER ;