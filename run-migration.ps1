# PowerShell script to run Supabase migration
# You'll need to login first: npx supabase login

Write-Host "Running Supabase migration..." -ForegroundColor Green

# Check if logged in
Write-Host "`nStep 1: Checking Supabase CLI connection..." -ForegroundColor Yellow
$linkCheck = npx supabase link --project-ref gsywfyitbtdbeyylwsvw 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Not linked to project. Please login first:" -ForegroundColor Red
    Write-Host "   Run: npx supabase login" -ForegroundColor Cyan
    Write-Host "   This will open a browser for authentication." -ForegroundColor Cyan
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Project linked!" -ForegroundColor Green

# Push migrations
Write-Host "`nStep 2: Applying migrations..." -ForegroundColor Yellow
npx supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Migration failed. Check the error above." -ForegroundColor Red
    exit 1
}

