param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "start"
)

$scriptPath = "C:\Users\ZJZHZF\Documents\trae_projects\zhzx"
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

function Start-Server {
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Zhi Hui Zhong Xin Yun Wei Server" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan

    $lanIPs = Get-LanIP

    if (Test-Path $pidFile) {
        $oldPid = Get-Content $pidFile -Raw
        if (Get-Process -Id $oldPid -ErrorAction SilentlyContinue) {
            Write-Host ""
            Write-Host "Server is running (PID: $oldPid)" -ForegroundColor Yellow
            Write-Host "Local:    http://localhost:8080/index.html" -ForegroundColor White
            foreach ($ip in $lanIPs) {
                Write-Host "Network:  http://$ip`:8080/index.html" -ForegroundColor White
            }
            Write-Host ""
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            return
        }
    }

    Write-Host ""
    Write-Host "Starting Node.js server..." -ForegroundColor Yellow

    $process = Start-Process -FilePath "node" -ArgumentList $serverScript -WorkingDirectory $scriptPath -NoNewWindow -PassThru

    $process.Id | Out-File -FilePath $pidFile -Encoding UTF8

    Start-Sleep -Seconds 2

    if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
        Write-Host "Server started successfully!" -ForegroundColor Green
        Write-Host "PID: $($process.Id)" -ForegroundColor White
        Write-Host "Local:    http://localhost:8080/index.html" -ForegroundColor White
        foreach ($ip in $lanIPs) {
            Write-Host "Network:  http://$ip`:8080/index.html" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Stop server: .\start.ps1 -Action stop" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "Server failed to start" -ForegroundColor Red
        if (Test-Path $pidFile) { Remove-Item $pidFile }
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

function Stop-Server {
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Stopping server..." -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Cyan

    if (-not (Test-Path $pidFile)) {
        Write-Host "PID file not found" -ForegroundColor Yellow
        return
    }

    $pid = Get-Content $pidFile -Raw
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue

    if ($process) {
        $process.Kill()
        Start-Sleep -Seconds 1
        Write-Host "Server stopped (PID: $pid)" -ForegroundColor Green
    } else {
        Write-Host "Process not found" -ForegroundColor Yellow
    }

    Remove-Item $pidFile -ErrorAction SilentlyContinue
}

function Get-Status {
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Server Status" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan

    $lanIPs = Get-LanIP

    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile -Raw
        if (Get-Process -Id $pid -ErrorAction SilentlyContinue) {
            Write-Host "Status: Running" -ForegroundColor Green
            Write-Host "PID: $pid" -ForegroundColor White
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
}

switch ($Action.ToLower()) {
    "start" { Start-Server }
    "stop" { Stop-Server }
    "status" { Get-Status }
    default {
        Write-Host "Usage:" -ForegroundColor Cyan
        Write-Host "  .\start.ps1 -Action start    # Start server" -ForegroundColor White
        Write-Host "  .\start.ps1 -Action stop     # Stop server" -ForegroundColor White
        Write-Host "  .\start.ps1 -Action status   # Check status" -ForegroundColor White
        Write-Host "  .\start.ps1                  # Default start" -ForegroundColor White
    }
}
