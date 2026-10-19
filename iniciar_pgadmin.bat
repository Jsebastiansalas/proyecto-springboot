@echo off
title Lanzador de pgAdmin 4 - RentaMaq
echo ========================================================
echo       INICIANDO PGADMIN 4 (POSTGRESQL 18)
echo ========================================================
echo.

:: Asegurar que las librerias nativas de PostgreSQL esten en el PATH
set "PATH=C:\Program Files\PostgreSQL\18\bin;C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime;%PATH%"

:: Iniciar la aplicacion de pgAdmin 4 en segundo plano
start "" "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\pgAdmin4.exe"

echo [OK] pgAdmin 4 se esta ejecutando.
echo      La ventana de escritorio o la pestaña del navegador se abrira en breve.
echo.
echo Parametros de conexion para 'renta_db':
echo   - Host:      localhost
echo   - Puerto:    1129
echo   - BD:        renta_db (o postgres)
echo   - Usuario:   postgres
echo   - Password:  Renta2026
echo ========================================================
timeout /t 5
