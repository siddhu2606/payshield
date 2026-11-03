# PayShield GitHub Push & Pages Hosting Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       PayShield - Push to GitHub & Enable Hosting       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/"
    exit
}

Write-Host "Initializing Git repository and staging files..." -ForegroundColor Yellow
git init
git add .
git commit -m "feat: PayShield FIN-11 Coerced Payment Interruption System"
git branch -M main

Write-Host ""
$useGh = Read-Host "Do you have GitHub CLI installed? Create repo automatically? (y/n)"
if ($useGh -eq 'y' -or $useGh -eq 'Y') {
    Write-Host "Creating public repo and pushing with gh CLI..." -ForegroundColor Green
    gh repo create payshield --public --source=. --remote=origin --push
} else {
    $repoUrl = Read-Host "Enter your GitHub Repo URL (e.g. https://github.com/<username>/payshield.git)"
    if ($repoUrl) {
        git remote remove origin 2>$null
        git remote add origin $repoUrl
        git push -u origin main --force
    }
}

Write-Host ""
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "HOW TO ENABLE FREE HOSTING ON GITHUB PAGES:" -ForegroundColor Green
Write-Host "1. Go to your repo on GitHub: https://github.com/<username>/payshield"
Write-Host "2. Click 'Settings' tab -> 'Pages' in left sidebar."
Write-Host "3. Under 'Build and deployment' -> 'Branch', select 'main' and '/ (root)'."
Write-Host "4. Click Save. Your live web app will be hosted at:"
Write-Host "   https://<username>.github.io/payshield/" -ForegroundColor Yellow
Write-Host "5. Open https://<username>.github.io/payshield/mobile.html directly on your phone!" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
