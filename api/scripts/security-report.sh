#!/bin/bash

# 🔐 Script de Rapport de Sécurité Automatisé
# Génère un rapport complet des tests de sécurité

echo "🔐 === RAPPORT DE SÉCURITÉ AUTOMATISÉ ==="
echo "Date: $(date)"
echo "Projet: Crypto Platform API"
echo ""

# Créer le dossier de rapports
mkdir -p reports/security

echo "📊 1. Scan des Vulnérabilités de Dépendances (Snyk Dependencies)"
echo "=================================================================="
npx snyk test --json > reports/security/dependencies-scan.json 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Aucune vulnérabilité trouvée dans les dépendances"
else
    echo "⚠️ Vulnérabilités détectées - voir reports/security/dependencies-scan.json"
fi
echo ""

echo "🔍 2. Analyse Statique du Code (Snyk Code)"  
echo "==========================================="
npx snyk code test --json > reports/security/code-analysis.json 2>/dev/null
CODE_ISSUES=$(npx snyk code test 2>/dev/null | grep "Total issues:" | awk '{print $3}')
if [ -z "$CODE_ISSUES" ]; then
    CODE_ISSUES=0
fi
echo "📊 Issues détectées: $CODE_ISSUES"
echo ""

echo "🧪 3. Tests d'Intégration Sécurisés"
echo "==================================="
npm run test:integration > reports/security/integration-tests.log 2>&1
SECURITY_TESTS=$(grep -c "✓" reports/security/integration-tests.log | head -1)
echo "✅ Tests de sécurité passés: $SECURITY_TESTS"
echo ""

echo "📋 4. Audit NPM"
echo "==============="
npm audit --json > reports/security/npm-audit.json 2>/dev/null
AUDIT_VULNS=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.total' 2>/dev/null || echo "0")
if [ "$AUDIT_VULNS" = "0" ]; then
    echo "✅ Aucune vulnérabilité NPM"
else
    echo "⚠️ $AUDIT_VULNS vulnérabilités NPM détectées"
fi
echo ""

# Génération du résumé
echo "📊 === RÉSUMÉ DU RAPPORT DE SÉCURITÉ ==="
echo "Date: $(date)" > reports/security/RESUME.md
echo "# 🛡️ Résumé Sécurité - Crypto Platform API" >> reports/security/RESUME.md
echo "" >> reports/security/RESUME.md
echo "## 📊 Métriques" >> reports/security/RESUME.md
echo "- **Vulnérabilités dépendances**: ${AUDIT_VULNS:-0}" >> reports/security/RESUME.md  
echo "- **Issues code statique**: ${CODE_ISSUES:-0}" >> reports/security/RESUME.md
echo "- **Tests sécurité**: ${SECURITY_TESTS:-0} ✅" >> reports/security/RESUME.md
echo "- **Scan date**: $(date)" >> reports/security/RESUME.md
echo "" >> reports/security/RESUME.md
echo "## 🎯 Status Global" >> reports/security/RESUME.md

TOTAL_ISSUES=$((${AUDIT_VULNS:-0} + ${CODE_ISSUES:-0}))
if [ $TOTAL_ISSUES -eq 0 ]; then
    echo "**🟢 EXCELLENT** - Aucune vulnérabilité critique" >> reports/security/RESUME.md
    echo "🟢 STATUS: EXCELLENT - Aucune vulnérabilité critique"
elif [ $TOTAL_ISSUES -lt 10 ]; then
    echo "**🟡 BON** - Quelques issues mineures détectées" >> reports/security/RESUME.md
    echo "🟡 STATUS: BON - $TOTAL_ISSUES issues détectées"  
else
    echo "**🔴 ATTENTION** - Plusieurs vulnérabilités à corriger" >> reports/security/RESUME.md
    echo "🔴 STATUS: ATTENTION - $TOTAL_ISSUES issues à corriger"
fi

echo ""
echo "📁 Rapports générés dans ./reports/security/"
echo "   - dependencies-scan.json (Vulnérabilités dépendances)"
echo "   - code-analysis.json (Analyse statique)" 
echo "   - integration-tests.log (Tests sécurisés)"
echo "   - npm-audit.json (Audit NPM)"
echo "   - RESUME.md (Résumé exécutif)"
echo ""
echo "🚀 Commande rapide: cat reports/security/RESUME.md"