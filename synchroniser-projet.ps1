# Synchronise le projet de travail local vers le dossier du memoire.
#
#   .\synchroniser-projet.ps1
#
# La copie de reference (sources seules, sans dependances) alimente le
# dossier 03_Projet du memoire ; la copie de travail, qui contient les
# dependances installees, reste sur le disque local.

param(
  [string]$Cible = "C:\Users\CarlieFeno\OneDrive - so-api consulting\Documents\Memoire M2 - FENO Carlie\03_Projet"
)

$ErreurActionPreference = "Stop"

$Source = $PSScriptRoot
if (-not (Test-Path $Source)) {
    Write-Error "Copie de travail introuvable : $Source"
}

Write-Host "Synchronisation de $Source vers $Cible ..."
robocopy $Source $Cible /MIR /XD "node_modules" "dist" "logs" ".vite" /XF "*.log" /R:1 /W:1 /MT:8 /NFL /NDL /NP /NJH /NJS | Out-Null

if ($LASTEXITCODE -ge 8) {
    Write-Error "La synchronisation a echoue (code $LASTEXITCODE)."
}

$cible = (Resolve-Path $Cible).Path
Push-Location $cible
$etat = git status --short
$dernier = git log --oneline -1
Pop-Location

Write-Host "Termine."
Write-Host "  cible   : $cible"
Write-Host "  commit  : $dernier"
if ($etat) {
    Write-Host "  differences non versionnees :"
    $etat | ForEach-Object { Write-Host "    $_" }
}
