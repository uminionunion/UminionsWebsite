$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    foreach ($frontend in @('includes\uhub', 'includes\pantry-finder')) {
        Push-Location $frontend
        try {
            & npm.cmd run build
            if ($LASTEXITCODE -ne 0) { throw "Frontend build failed: $frontend" }
        } finally {
            Pop-Location
        }
    }
    & docker compose -f docker-compose.preview.yml up -d --build --wait
    if ($LASTEXITCODE -ne 0) { throw 'Local preview startup failed. Check docker compose -f docker-compose.preview.yml logs.' }
    & docker compose -f docker-compose.preview.yml run --rm wp-cli wp core is-installed
    if ($LASTEXITCODE -ne 0) {
        & docker compose -f docker-compose.preview.yml run --rm wp-cli wp core install --url=http://localhost:4002 --title=UminionPreview --admin_user=preview-admin --admin_password=local-preview-only --admin_email=preview@example.invalid --skip-email
        if ($LASTEXITCODE -ne 0) { throw 'Local WordPress installation failed.' }
    }
    & docker compose -f docker-compose.preview.yml run --rm wp-cli wp theme is-installed astra
    if ($LASTEXITCODE -ne 0) {
        & docker compose -f docker-compose.preview.yml run --rm wp-cli wp theme install astra
        if ($LASTEXITCODE -ne 0) { throw 'Astra parent-theme installation failed.' }
    }
    & docker compose -f docker-compose.preview.yml run --rm wp-cli wp theme activate astra-child
    if ($LASTEXITCODE -ne 0) { throw 'Local child-theme activation failed.' }
    $response = Invoke-WebRequest -Uri 'http://localhost:4002/' -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -ne 200) { throw 'Local preview did not respond successfully.' }
    $bundle = Invoke-WebRequest -Uri 'http://localhost:4002/uhub/dist/uhub.js' -UseBasicParsing -TimeoutSec 30
    if ($bundle.StatusCode -ne 200 -or -not $bundle.Content.Contains('Coming Soon This Week!')) {
        throw 'Local preview is not serving the expected Testing002 frontend bundle.'
    }
    Write-Output 'Testing002 live preview is ready: http://localhost:4002/ (refresh the shared browser).'
} finally {
    Pop-Location
}
