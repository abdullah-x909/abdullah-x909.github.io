@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Renaming images - OLDEST first
echo    (Oldest photo = 1.jpg)
echo ========================================

set "folder=images"
set count=1

:: Go to the images folder
cd /d "%~dp0%folder%" 2>nul || (
    echo ERROR: Folder "images" not found!
    echo Make sure the "images" folder is in the same place as this .bat file.
    pause
    exit /b
)

echo Processing...

:: /O:D  = sort by date, oldest first
:: /T:C  = use Creation time  (best for photos)
:: You can change to /T:W if you prefer "Date Modified"

for /f "delims=" %%F in ('dir /b /a-d /O:D /T:C *.jpg *.jpeg *.png *.gif *.bmp *.webp 2^>nul') do (
    if exist "%%F" (
        ren "%%F" "!count!.jpg"
        echo Renamed: %%F  --^>  !count!.jpg
        set /a count+=1
    )
)

echo.
echo ========================================
echo    Finished! Total files renamed: !count!-1
echo    Oldest image is now 1.jpg
echo ========================================

pause
