# Script de Rapport de Securite Automatise
# Genere un rapport complet des tests de securite

Write-Host "=== RAPPORT DE SECURITE AUTOMATISE ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray  
Write-Host "Projet: Crypto Platform API" -ForegroundColor Gray
Write-Host ""

# Creer le dossier de rapports
New-Item -ItemType Directory -Force -Path "reports\security" | Out-Null

Write-Host "1. Scan des Vulnerabilites de Dependances (Snyk Dependencies)" -ForegroundColor Yellow
Write-Host "============================================================="
$depOutput = npx snyk test 2>&1
$depOutput | Out-File "reports\security\dependencies-scan.log" -Encoding UTF8

if ($LASTEXITCODE -eq 0) {
    Write-Host "Aucune vulnerabilite trouvee dans les dependances" -ForegroundColor Green
    $depVulns = 0
} else {
    Write-Host "Vulnerabilites detectees - voir reports\security\dependencies-scan.log" -ForegroundColor Yellow
    $depVulns = 1
}
Write-Host ""

Write-Host "2. Analyse Statique du Code (Snyk Code)" -ForegroundColor Yellow
Write-Host "======================================="
$codeOutput = npx snyk code test 2>&1
$codeOutput | Out-File "reports\security\code-analysis.log" -Encoding UTF8

# Extraire le nombre d'issues
$issuesLine = $codeOutput | Select-String "Total issues:\s+(\d+)" 
if ($issuesLine) {
    $codeIssues = $issuesLine.Matches[0].Groups[1].Value
} else {
    $codeIssues = 0
}

Write-Host "Issues detectees: $codeIssues" -ForegroundColor Cyan

# Compter les issues par severite 
$highIssues = ($codeOutput | Select-String "\[HIGH\]").Count
$mediumIssues = ($codeOutput | Select-String "\[MEDIUM\]").Count  
$lowIssues = ($codeOutput | Select-String "\[LOW\]").Count

Write-Host "   - HIGH: $highIssues" -ForegroundColor Red
Write-Host "   - MEDIUM: $mediumIssues" -ForegroundColor Yellow
Write-Host "   - LOW: $lowIssues" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Audit NPM" -ForegroundColor Yellow
Write-Host "============"
$auditOutput = npm audit --json 2>&1
$auditOutput | Out-File "reports\security\npm-audit.json" -Encoding UTF8

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

# Generation du resume
Write-Host "=== RESUME DU RAPPORT DE SECURITE ===" -ForegroundColor Cyan

$resumeContent = "# Resume Securite - Crypto Platform API`n`n"
$resumeContent += "**Genere le**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$resumeContent += "## Metriques de Securite`n`n"
$resumeContent += "| Metrique | Valeur | Status |`n"
$resumeContent += "|----------|--------|--------|`n"
$resumeContent += "| **Vulnerabilites dependances** | $auditVulns | $(if($auditVulns -eq 0){'Excellent'}else{'A corriger'}) |`n"
$resumeContent += "| **Issues code statique** | $codeIssues | $(if($codeIssues -lt 20){'Acceptable'}else{'Eleve'}) |`n"
$resumeContent += "| **  - HIGH** | $highIssues | $(if($highIssues -eq 0){'Aucune'}else{'Critique'}) |`n"
$resumeContent += "| **  - MEDIUM** | $mediumIssues | $(if($mediumIssues -lt 10){'Faible'}else{'Modere'}) |`n"
$resumeContent += "| **  - LOW** | $lowIssues | $(if($lowIssues -lt 50){'Acceptable'}else{'Eleve'}) |`n`n"

$totalCriticalIssues = [int]$auditVulns + [int]$highIssues
$resumeContent += "## Evaluation Globale`n`n"

if ($totalCriticalIssues -eq 0) {
    $resumeContent += "**EXCELLENT** - Securite optimale`n`n"
    $resumeContent += "- Aucune vulnerabilite critique detectee`n"
    $resumeContent += "- Code pret pour la production`n"
    Write-Host "STATUS: EXCELLENT - Securite optimale" -ForegroundColor Green
} elseif ($totalCriticalIssues -lt 3) {
    $resumeContent += "**BON** - Quelques ameliorations possibles`n`n"
    $resumeContent += "- $totalCriticalIssues issue(s) critique(s) detectee(s)`n"
    $resumeContent += "- Correction recommandee avant production`n"
    Write-Host "STATUS: BON - $totalCriticalIssues issues critiques a corriger" -ForegroundColor Yellow
} else {
    $resumeContent += "**ATTENTION** - Corrections requises`n`n"
    $resumeContent += "- $totalCriticalIssues issues critiques detectees`n"
    $resumeContent += "- Correction obligatoire avant deploiement`n"
    Write-Host "STATUS: ATTENTION - $totalCriticalIssues issues critiques a corriger!" -ForegroundColor Red
}

$resumeContent += "`n## Fichiers de Rapport`n`n"
$resumeContent += "- dependencies-scan.log - Scan vulnerabilites dependances`n"
$resumeContent += "- code-analysis.log - Analyse statique du code`n"
$resumeContent += "- npm-audit.json - Audit NPM complet`n"
$resumeContent += "- RESUME.md - Ce resume executif`n`n"
$resumeContent += "## Commandes de Suivi`n`n"
$resumeContent += "```bash`n"
$resumeContent += "# Re-scanner apres corrections`n"
$resumeContent += "npm run security:all`n`n"
$resumeContent += "# Corriger automatiquement`n"
$resumeContent += "npm run security:fix`n"
$resumeContent += "```"

$resumeContent | Out-File "reports\security\RESUME.md" -Encoding UTF8

Write-Host ""
Write-Host "Rapports generes dans .\reports\security\" -ForegroundColor Cyan
Write-Host "   - dependencies-scan.log (Vulnerabilites dependances)" -ForegroundColor Gray
Write-Host "   - code-analysis.log (Analyse statique)" -ForegroundColor Gray
Write-Host "   - npm-audit.json (Audit NPM)" -ForegroundColor Gray
Write-Host "   - RESUME.md (Resume executif)" -ForegroundColor Gray
Write-Host ""
Write-Host "Voir le resume: Get-Content reports\security\RESUME.md" -ForegroundColor Green
Write-Host ""

# Afficher un apercu du resume
Write-Host "=== APERCU RESUME ===" -ForegroundColor Cyan
Write-Host "Vulnerabilites critiques: $totalCriticalIssues" -ForegroundColor $(if($totalCriticalIssues -eq 0){'Green'}elseif($totalCriticalIssues -lt 3){'Yellow'}else{'Red'})
Write-Host "Issues code: $codeIssues ($highIssues HIGH, $mediumIssues MED, $lowIssues LOW)" -ForegroundColor Cyan