@echo off
echo Configurando ambiente e preparando upload para GitHub...

REM Criar arquivo .env.local com as credenciais corretas
echo Criando arquivo .env.local...
echo SUPABASE_URL=https://studio.praisesistemas.uk> .env.local
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzAzMzg2ODAwLAogICJleHAiOiAxODYxMjM5NjAwCn0.kU_d1xlxfuEgkYMC0mYoiZHQpUvRE2EnilTZ7S0bfIM>> .env.local

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
