@echo off
chcp 65001 > nul
setlocal
echo ========================================================
echo   HE THONG CONG TY CHOT LUONG (REACTJS + GOLANG + POSTGRESQL)
echo ========================================================
echo.

set "ROOT=%~dp0"
set "PGDATA=%ROOT%storage\pgdata"

rem ---------- [1/3] PostgreSQL ----------
rem Neu da co Postgres rieng dang chay o cong 5432 (Docker, ban cai dat...) thi bo qua.
rem Co the dat bien PG_BIN tro toi thu muc chua pg_ctl.exe; mac dinh lay tu du an tintuc ben canh.
echo [1/3] Dang kiem tra PostgreSQL...
if not defined PG_BIN (
    for /d %%D in ("%ROOT%..\tintuc\node_modules\.pnpm\@embedded-postgres+windows-x64@*") do (
        if exist "%%D\node_modules\@embedded-postgres\windows-x64\native\bin\pg_ctl.exe" set "PG_BIN=%%D\node_modules\@embedded-postgres\windows-x64\native\bin"
    )
)

if not exist "%PGDATA%\PG_VERSION" (
    echo   Khong thay du lieu Postgres tai storage\pgdata - bo qua buoc nay.
    echo   Backend se ket noi toi Postgres dang chay san o localhost:5432.
    goto backend
)
if not defined PG_BIN (
    echo   Khong tim thay pg_ctl.exe. Dat bien PG_BIN tro toi thu muc bin cua Postgres 16.
    goto backend
)

"%PG_BIN%\pg_ctl.exe" -D "%PGDATA%" status > nul 2>&1
if %errorlevel%==0 (
    echo   PostgreSQL dang chay.
) else (
    echo   Dang khoi dong PostgreSQL tai cong 5432...
    "%PG_BIN%\pg_ctl.exe" -D "%PGDATA%" -l "%ROOT%storage\postgres.log" -o "-p 5432" -w start > nul
    if errorlevel 1 (
        echo   Khong khoi dong duoc PostgreSQL. Xem storage\postgres.log
        pause
        exit /b 1
    )
    echo   PostgreSQL da san sang.
)

:backend
rem ---------- [2/3] Build backend ----------
cd /d "%ROOT%backend"
echo [2/3] Dang kiem tra may chu Backend Go Lang...
if not exist "server.exe" (
    echo   Dang bien dich server.exe...
    go build -o server.exe ./cmd/server
)

rem ---------- [3/3] Chay ----------
echo [3/3] Khoi dong Chot Luong Web Server tai http://localhost:8080 ...
start "" "http://localhost:8080"
"%ROOT%backend\server.exe"
pause
