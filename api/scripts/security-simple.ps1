# Script de Rapport de Securite - Version Simple
Write-Host "=== RAPPORT DE SECURITE AUTOMATISE ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray  
Write-Host "Projet: Crypto Platform API" -ForegroundColor Gray
Write-Host ""

# Creer le dossier de rapports
New-Item -ItemType Directory -Force -Path "reports\security" | Out-Null

Write-Host "1. Scan Snyk Dependencies" -ForegroundColor Yellow
Write-Host "========================="
$depOutput = npx snyk test 2>&1
$depOutput | Out-File "reports\security\dependencies-scan.log"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Aucune vulnerabilite dans les dependances" -ForegroundColor Green
    $depVulns = 0
} else {
    Write-Host "Vulnerabilites detectees" -ForegroundColor Yellow
    $depVulns = 1
}
Write-Host ""

Write-Host "2. Analyse Code Snyk" -ForegroundColor Yellow
Write-Host "===================="
$codeOutput = npx snyk code test 2>&1
$codeOutput | Out-File "reports\security\code-analysis.log"

$issuesLine = $codeOutput | Select-String "Total issues:\s+(\d+)" 
if ($issuesLine) {
    $codeIssues = $issuesLine.Matches[0].Groups[1].Value
} else {
    $codeIssues = 0
}

$highIssues = ($codeOutput | Select-String "\[HIGH\]").Count
$mediumIssues = ($codeOutput | Select-String "\[MEDIUM\]").Count  
$lowIssues = ($codeOutput | Select-String "\[LOW\]").Count

Write-Host "Issues detectees: $codeIssues" -ForegroundColor Cyan
Write-Host "   - HIGH: $highIssues" -ForegroundColor Red
Write-Host "   - MEDIUM: $mediumIssues" -ForegroundColor Yellow
Write-Host "   - LOW: $lowIssues" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Audit NPM" -ForegroundColor Yellow
Write-Host "============"
$auditOutput = npm audit --json 2>&1
$auditOutput | Out-File "reports\security\npm-audit.json"

if ($auditOutput -match '"total":\s*(\d+)') {
    $auditVulns = $matches[1]
} else {
    $auditVulns = 0
}

if ($auditVulns -eq 0) {
    Write-Host "Aucune vulnerabilite NPM" -ForegroundColor Green
} else {
    Write-Host "$auditVulns vulnerabilites NPM detectees" -ForegroundColor Yellow
}
Write-Host ""

# Resume
Write-Host "=== RESUME ===" -ForegroundColor Cyan
$totalCritical = [int]$auditVulns + [int]$highIssues

$resumeText = "# Resume Securite - Crypto Platform API`n`n"
$resumeText += "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$resumeText += "## Metriques`n`n"
$resumeText += "- Vulnerabilites dependances: $auditVulns`n"
$resumeText += "- Issues code total: $codeIssues`n"
$resumeText += "- Issues HIGH: $highIssues`n"
$resumeText += "- Issues MEDIUM: $mediumIssues`n"
$resumeText += "- Issues LOW: $lowIssues`n`n"

if ($totalCritical -eq 0) {
    $resumeText += "## Status: EXCELLENT`n`nAucune vulnerabilite critique detectee.`n"
    Write-Host "STATUS: EXCELLENT - Aucune vulnerabilite critique" -ForegroundColor Green
} elseif ($totalCritical -lt 3) {
    $resumeText += "## Status: BON`n`n$totalCritical vulnerabilites critiques detectees.`n"
    Write-Host "STATUS: BON - $totalCritical vulnerabilites critiques" -ForegroundColor Yellow
} else {
    $resumeText += "## Status: ATTENTION`n`n$totalCritical vulnerabilites critiques detectees.`n"
    Write-Host "STATUS: ATTENTION - $totalCritical vulnerabilites critiques" -ForegroundColor Red
}

$resumeText | Out-File "reports\security\RESUME.md"

Write-Host ""
Write-Host "Rapports dans: .\reports\security\" -ForegroundColor Cyan
Write-Host "Resume: Get-Content reports\security\RESUME.md" -ForegroundColor Green