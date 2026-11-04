@echo off
chcp 65001 > nul
echo ========================================================
echo   HE THONG CONG TY CHOT LUONG (REACTJS + GOLANG + POSTGRESQL)
echo ========================================================
echo.

cd /d "%~dp0backend"
echo [1/2] Dang kiem tra va khoi dong may chu Backend Go Lang...
if not exist "server.exe" (
    echo Dang bien dich server.exe...
    go build -o server.exe ./cmd/server
)

echo [2/2] Khoi dong Chot Luong Web Server tai http://localhost:8080 ...
start "" "http://localhost:8080"
server.exe
pause

