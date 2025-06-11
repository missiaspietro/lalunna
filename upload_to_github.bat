@echo off
echo Iniciando upload para o GitHub...

REM Caminho para o Git - ajuste se necessário
set GIT_PATH="C:\Program Files\Git\bin\git.exe"

echo Inicializando repositório Git...
%GIT_PATH% init

echo Adicionando arquivos ao controle de versão...
%GIT_PATH% add .

echo Configurando usuário Git temporário...
%GIT_PATH% config user.name "LaLunna Admin"
%GIT_PATH% config user.email "admin@lalunna.com"

echo Criando commit inicial...
%GIT_PATH% commit -m "Versão inicial do projeto LaLunna Admin Panel"

echo Adicionando repositório remoto...
%GIT_PATH% remote add origin https://github.com/missiaspietro/lalunna.git

echo Enviando código para o GitHub...
%GIT_PATH% push -u origin master

echo Processo concluído!
pause
