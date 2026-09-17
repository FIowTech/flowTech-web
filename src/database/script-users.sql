-- Nome: svc-python-writer
-- Usuário restrito para validações no script de escrita
CREATE USER 'svc-python-writer'@'%' IDENTIFIED BY '';
GRANT SELECT ON flowtech.empresas TO 'svc-python-writer'@'%';
GRANT SELECT ON flowtech.porticos TO 'svc-python-writer'@'%';
GRANT SELECT ON flowtech.embarcados TO 'svc-python-writer'@'%';
GRANT SELECT ON flowtech.usuarios TO 'svc-python-writer'@'%';
GRANT SELECT ON flowtech.parametros TO 'svc-python-writer'@'%';
GRANT SELECT ON flowtech.componentes TO 'svc-python-writer'@'%';
FLUSH PRIVILEGES;