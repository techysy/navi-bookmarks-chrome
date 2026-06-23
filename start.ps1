param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "start"
)

$scriptPath = $PSScriptRoot
$serverScript = "$scriptPath\server.js"
$pidFile = "$scriptPath\server.pid"

function Get-LanIP {
    $addresses = @()
    $adapters = Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Manual, Dhcp | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
    foreach ($adapter in $adapters) {
        $addresses += $adapter.IPAddress
    }
    if ($addresses.Count -eq 0) {
        $addresses = @(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*" } | Select-Object -First 1 -ExpandProperty IPAddress)
    }
    return $addresses
}

function Show-Menu {
    Clear-Host
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "    Node.js Server Manager" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please select an option:" -ForegroundColor White
    Write-Host ""
    Write-Host "  [S] Start Server (Foreground)" -ForegroundColor Gray
    Write-Host "  [B] Start Server (Background)" -ForegroundColor Gray
    Write-Host "  [T] Stop Server" -ForegroundColor Gray
    Write-Host "  [C] Check Status" -ForegroundColor Gray
    Write-Host "  [Q] Quit" -ForegroundColor Gray
    Write-Host ""
    $choice = Read-Host "Enter option (S/B/T/C/Q)"
    return $choice.ToUpper()
}

function Start-Server([bool]$Background = $false) {
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Node.js Server" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan

    $lanIPs = Get-LanIP

    if (Test-Path $pidFile) {
        $oldServerPid = Get-Content $pidFile -Raw
        $oldServerPid = $oldServerPid.Trim()
        if ([int]::TryParse($oldServerPid, [ref]$null) -and (Get-Process -Id $oldServerPid -ErrorAction SilentlyContinue)) {
            Write-Host ""
            Write-Host "Server is running (PID: $oldServerPid)" -ForegroundColor Yellow
            Write-Host "Local:    http://localhost:8080/index.html" -ForegroundColor White
            foreach ($ip in $lanIPs) {
                Write-Host "Network:  http://$ip`:8080/index.html" -ForegroundColor White
            }
            Write-Host ""
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            return
        }
    }

    Write-Host ""
    Write-Host "Starting Node.js server..." -ForegroundColor Yellow

    if ($Background) {
        $process = Start-Process -FilePath "node" -ArgumentList $serverScript -WorkingDirectory $scriptPath -WindowStyle Hidden -PassThru
        $process.Id | Out-File -FilePath $pidFile -Encoding UTF8
        Start-Sleep -Seconds 2
        if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
            Write-Host "Server started in background!" -ForegroundColor Green
            Write-Host "PID: $($process.Id)" -ForegroundColor White
            Write-Host "Local:    http://localhost:8080/index.html" -ForegroundColor White
            foreach ($ip in $lanIPs) {
                Write-Host "Network:  http://$ip`:8080/index.html" -ForegroundColor White
            }
            Write-Host ""
            Write-Host "Stop: .\start.ps1 -Action stop" -ForegroundColor Gray
        } else {
            Write-Host "Server failed to start" -ForegroundColor Red
            if (Test-Path $pidFile) { Remove-Item $pidFile }
        }
        Write-Host ""
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "Server starting... (Ctrl+C to stop)" -ForegroundColor Green
        Write-Host "Local: http://localhost:8080/index.html" -ForegroundColor White
        Write-Host ""
        & node $serverScript
    }
}

function Start-Server-Background {
    Start-Server -Background $true
}

function Stop-Server {
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Stopping server..." -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Cyan

    if (-not (Test-Path $pidFile)) {
        Write-Host "PID file not found" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    $pidContent = Get-Content $pidFile -Raw
    $serverPid = $pidContent.Trim()

    if (-not [int]::TryParse($serverPid, [ref]$null)) {
        Write-Host "Invalid PID in file" -ForegroundColor Red
        Remove-Item $pidFile -ErrorAction SilentlyContinue
        Write-Host ""
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    $process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue

    if ($process) {
        $process.Kill()
        Start-Sleep -Seconds 1
        Write-Host "Server stopped (PID: $serverPid)" -ForegroundColor Green
    } else {
        Write-Host "Process not found" -ForegroundColor Yellow
    }

    Remove-Item $pidFile -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Get-Status {
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Server Status" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan

    $lanIPs = Get-LanIP

    if (Test-Path $pidFile) {
        $serverPid = Get-Content $pidFile -Raw
        $serverPid = $serverPid.Trim()
        if ([int]::TryParse($serverPid, [ref]$null) -and (Get-Process -Id $serverPid -ErrorAction SilentlyContinue)) {
            Write-Host "Status: Running" -ForegroundColor Green
            Write-Host "PID: $serverPid" -ForegroundColor White
            Write-Host "Local:    http://localhost:8080/index.html" -ForegroundColor White
            foreach ($ip in $lanIPs) {
                Write-Host "Network:  http://$ip`:8080/index.html" -ForegroundColor White
            }
        } else {
            Write-Host "Status: Stopped (PID file exists but process not found)" -ForegroundColor Yellow
            Remove-Item $pidFile
        }
    } else {
        Write-Host "Status: Stopped" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Run-Menu {
    do {
        $choice = Show-Menu
        switch ($choice) {
            "S" { Start-Server }
            "B" { Start-Server-Background }
            "T" { Stop-Server }
            "C" { Get-Status }
            "Q" { Write-Host "Exiting..." -ForegroundColor Gray; exit }
            default { 
                Write-Host "Invalid option, please try again" -ForegroundColor Red
                Write-Host "Press any key to continue..."
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
        }
    } while ($choice -ne "Q")
}

switch ($Action.ToLower()) {
    "start" { Start-Server }
    "start-bg" { Start-Server-Background }
    "stop" { Stop-Server }
    "status" { Get-Status }
    "menu" { Run-Menu }
    default {
        Write-Host "Usage:" -ForegroundColor Cyan
        Write-Host "  .\start.ps1                  # Show menu" -ForegroundColor White
        Write-Host "  .\start.ps1 -Action menu     # Show menu" -ForegroundColor White
        Write-Host "  .\start.ps1 -Action start    # Start server (foreground)" -ForegroundColor White
        Write-Host "  .\start.ps1 -Action start-bg # Start server (background)" -ForegroundColor White
        Write-Host "  .\start.ps1 -Action stop     # Stop server" -ForegroundColor White
        Write-Host "  .\start.ps1 -Action status   # Check status" -ForegroundColor White
    }
}
