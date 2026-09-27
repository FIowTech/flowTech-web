CREATE DATABASE flowtech;
USE flowtech;

CREATE TABLE IF NOT EXISTS endereco (
    idendereco INT PRIMARY KEY,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(120) NOT NULL,
    bairro VARCHAR(60) NOT NULL,
    uf CHAR(2) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(40),
    km VARCHAR(20) NOT NULL,
    sentido VARCHAR(30) NOT NULL,
    latitude DECIMAL(10,4) NOT NULL,
    longitude DECIMAL(10,4) NOT NULL
);

CREATE TABLE IF NOT EXISTS empresa (
    idempresa INT PRIMARY KEY,
    id_endereco INT NOT NULL,
    cnpj CHAR(14) NOT NULL,
    razaoSocial VARCHAR(45) NOT NULL,
    nomeFantasia VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL,
    data_criacao DATETIME,
    data_atualizacao DATETIME,
    CONSTRAINT fk_empresa_endereco
        FOREIGN KEY (id_endereco) REFERENCES endereco(idendereco)
);

CREATE TABLE IF NOT EXISTS embarcado (
    idembarcado INT,
    id_endereco INT,
    id_empresa INT,
    PRIMARY KEY (idembarcado, id_empresa),
    nome VARCHAR(45) NOT NULL,
    status TINYINT(1) NOT NULL,
    data_criacao DATETIME,
    data_atualizacao DATETIME,
    CONSTRAINT fk_embarcado_endereco
        FOREIGN KEY (id_endereco) REFERENCES endereco(idendereco),
    CONSTRAINT fk_embarcado_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(idempresa)
);

CREATE TABLE IF NOT EXISTS componente (
    idcomponente INT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    data_criacao DATETIME,
    data_atualizacao DATETIME
);

CREATE TABLE IF NOT EXISTS parametro (
    idparametro INT,
    id_embarcado INT,
    id_empresa INT,
    id_componente INT,
    PRIMARY KEY (idparametro, id_embarcado, id_empresa, id_componente),
    monitorado TINYINT(1) NOT NULL,
    limite_min DECIMAL(10,3) NOT NULL,
    limite_max DECIMAL(10,3) NOT NULL,
    data_criacao DATETIME,
    data_atualizacao DATETIME,
    CONSTRAINT fk_parametro_embarcado
        FOREIGN KEY (id_embarcado) REFERENCES embarcado(idembarcado),
    CONSTRAINT fk_parametro_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(idempresa),
    CONSTRAINT fk_parametro_componente
        FOREIGN KEY (id_componente) REFERENCES componente(idcomponente)
);

CREATE TABLE IF NOT EXISTS codigo_autenticacao (
    idcodigo INT PRIMARY KEY,
    id_empresa INT,
    codigo_autenticacao CHAR(5) NOT NULL,
    data_criacao DATETIME NOT NULL,
    CONSTRAINT fk_codigo_autenticacao_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(idempresa)
);

CREATE TABLE IF NOT EXISTS usuario (
    idusuario INT PRIMARY KEY,
    id_empresa INT,
    id_supervisor INT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso TINYINT NOT NULL,
    data_criacao DATETIME,
    data_atualizacao DATETIME,
    CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(idempresa),
    CONSTRAINT fk_usuario_supervisor
        FOREIGN KEY (id_supervisor) REFERENCES usuario(idusuario)
);

CREATE TABLE IF NOT EXISTS log_usuario (
    idlog INT,
    id_usuario INT,
    PRIMARY KEY (idlog, id_usuario),
    acao VARCHAR(45) NOT NULL,
    data DATETIME,
    CONSTRAINT fk_log_usuario_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(idusuario)
);