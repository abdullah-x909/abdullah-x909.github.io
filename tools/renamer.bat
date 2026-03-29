@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Renaming images by creation time...
echo ========================================

set "folder=images"
set count=1

cd /d "%~dp0%folder%" 2>nul || (
    echo ERROR: Folder "images" not found!
    pause
    exit /b
)

:: Sort by date modified (newest first) or you can change to /O:D for oldest first
for /f "delims=" %%F in ('dir /b /a-d /o:-d *.jpg *.jpeg *.png *.gif *.bmp *.webp 2^>nul') do (
    ren "%%F" "!count!.jpg"
    echo Renamed: %%F  --^>  !count!.jpg
    set /a count+=1
)

echo.
echo Done! Total files renamed: !count!-1
pause
