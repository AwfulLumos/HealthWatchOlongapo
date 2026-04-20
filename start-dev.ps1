# HealthWatch Olongapo - Development Start Script
# This script runs both frontend and backend concurrently

Write-Host "Starting HealthWatch Olongapo Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Store the root directory
$rootDir = $PSScriptRoot

# Function to cleanup background jobs on exit
function Cleanup {
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "Servers stopped" -ForegroundColor Green
}

# Register cleanup on Ctrl+C
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup } | Out-Null

try {
    # Start Backend Server
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    $backendJob = Start-Job -ScriptBlock {
        param($serverPath)
        Set-Location $serverPath
        npm run dev
    } -ArgumentList "$rootDir\server"

    # Wait a moment for backend to initialize
    Start-Sleep -Seconds 2

    # Start Frontend Server
    Write-Host "Starting Frontend Server..." -ForegroundColor Green
    $frontendJob = Start-Job -ScriptBlock {
        param($frontendPath)
        Set-Location $frontendPath
        npm run dev
    } -ArgumentList $rootDir

    Write-Host ""
    Write-Host "Both servers are starting up!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
    Write-Host "Backend:  Check server console for port" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Server Output:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    # Monitor both jobs and display their output
    while ($backendJob.State -eq 'Running' -or $frontendJob.State -eq 'Running') {
        # Get backend output
        $backendOutput = Receive-Job -Job $backendJob 2>&1
        if ($backendOutput) {
            $backendOutput | ForEach-Object {
                Write-Host "[BACKEND] $_" -ForegroundColor Blue
            }
        }

        # Get frontend output
        $frontendOutput = Receive-Job -Job $frontendJob 2>&1
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object {
                Write-Host "[FRONTEND] $_" -ForegroundColor Magenta
            }
        }

        Start-Sleep -Milliseconds 500
    }

    # Check if jobs failed
    if ($backendJob.State -eq 'Failed') {
        Write-Host "ERROR: Backend server failed!" -ForegroundColor Red
    }
    if ($frontendJob.State -eq 'Failed') {
        Write-Host "ERROR: Frontend server failed!" -ForegroundColor Red
    }

} finally {
    Cleanup
}
