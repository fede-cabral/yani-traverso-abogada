# ════════════════════════════════════════════════════════════════════
#  INICIAR.ps1 — deja el proyecto listo para trabajar con Claude y Git
#
#  Qué hace, en orden:
#    1. Copia los agentes de para-claude\ a .claude\
#    2. Crea el repositorio Git (si todavía no existe)
#    3. Verifica que no se cuele ningún archivo con claves
#    4. Hace el primer commit con todo el proyecto
#
#  Cómo se corre (desde la carpeta del proyecto, en PowerShell):
#
#    powershell -ExecutionPolicy Bypass -File .\INICIAR.ps1
#
#  El "-ExecutionPolicy Bypass" vale solo para esta ejecución: no cambia
#  ninguna configuración de Windows.
# ════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Paso($texto)  { Write-Host "`n▶ $texto" -ForegroundColor Cyan }
function Bien($texto)  { Write-Host "  ✓ $texto" -ForegroundColor Green }
function Aviso($texto) { Write-Host "  ! $texto" -ForegroundColor Yellow }
function Frenar($texto) {
  Write-Host "`n  ✗ $texto" -ForegroundColor Red
  Write-Host "  No se hizo ningún commit. Corregí eso y volvé a correr el script.`n"
  exit 1
}

if (-not (Test-Path "package.json")) {
  Frenar "No encuentro package.json. Corré el script desde la carpeta del proyecto."
}

# ── 1. Agentes ─────────────────────────────────────────────────────
Paso "Copiando agentes a .claude\"
if (Test-Path "para-claude") {
  New-Item -ItemType Directory -Force ".claude" | Out-Null
  foreach ($sub in @("agents", "skills")) {
    if (Test-Path "para-claude\$sub") {
      Copy-Item "para-claude\$sub" -Destination ".claude" -Recurse -Force
    }
  }
  Get-ChildItem ".claude" -Recurse -Filter *.md | ForEach-Object {
    Bien ($_.FullName.Substring($PSScriptRoot.Length + 1))
  }
} else {
  Aviso "No hay carpeta para-claude\ — se saltea (puede que ya estén copiados)."
}

# ── 2. Git ─────────────────────────────────────────────────────────
Paso "Revisando que Git esté instalado"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host "  Git no está instalado. Instalalo con este comando y después" -ForegroundColor Yellow
  Write-Host "  CERRÁ y volvé a abrir PowerShell antes de correr este script otra vez:" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "    winget install --id Git.Git -e" -ForegroundColor White
  Write-Host ""
  Write-Host "  (Los agentes ya quedaron copiados: eso no hace falta repetirlo.)"
  exit 1
}
Bien (git --version)

if (Test-Path ".git") {
  Aviso "Este proyecto ya tiene Git. No se crea de nuevo."
} else {
  Paso "Creando el repositorio"
  git init -b main | Out-Null
  if ($LASTEXITCODE -ne 0) { git init | Out-Null; git checkout -b main | Out-Null }
  Bien "Repositorio creado, rama main"
}

# Nombre y mail para firmar los commits: solo si no están configurados.
if (-not (git config user.name))  { git config user.name  "Federico Cabral" }
if (-not (git config user.email)) { git config user.email "federicocabral18@gmail.com" }
Bien ("Los commits van firmados como: " + (git config user.name) + " <" + (git config user.email) + ">")

# ── 3. Que no se escape ninguna clave ──────────────────────────────
Paso "Revisando que no entre ningún archivo con claves"
git add -A
$staged = git diff --cached --name-only
$peligrosos = $staged | Where-Object {
  ($_ -match '(^|/)\.env($|\.)' -and $_ -notmatch '\.example$') -or
  ($_ -match '(^|/)(node_modules|\.next)/') -or
  ($_ -match '\.(pem|key|p12|pfx)$')
}
if ($peligrosos) {
  git reset -q
  Frenar ("Estos archivos NO pueden ir a Git (claves o basura de compilación):`n    " + ($peligrosos -join "`n    ") + "`n  Revisá el .gitignore.")
}
# Búsqueda de claves de Supabase pegadas dentro de algún archivo. Este mismo
# script se excluye: contiene los patrones que busca y se encontraría a sí mismo.
$conClave = git grep --cached -l -E "eyJhbGciOiJIUzI1NiIs|sb_secret_|service_role\s*=\s*['""]?ey" -- . ':(exclude)INICIAR.ps1' 2>$null
if ($conClave) {
  git reset -q
  Frenar ("Parece haber una clave pegada en estos archivos:`n    " + ($conClave -join "`n    "))
}
Bien ("$($staged.Count) archivos, ninguno con claves")

# ── 4. Primer commit ───────────────────────────────────────────────
if (git log -1 2>$null) {
  Aviso "Ya hay commits. Para guardar cambios nuevos usá: git add -A; git commit -m ""qué cambió"""
  git reset -q
} else {
  Paso "Haciendo el primer commit"
  git commit -q `
    -m "Primer commit: sitio de la Dra. Yanina Traverso" `
    -m "Sitio de estudio jurídico (Next.js 16 + Supabase): áreas de práctica, pedido de turnos y contacto; panel de turnos y consultas; RLS y restricciones en la base; modo demostración; tests; CLAUDE.md y subagentes." `
    -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  Bien (git log --oneline -1)
}

Write-Host "`n══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Listo." -ForegroundColor Green
Write-Host ""
Write-Host " Para guardar una versión después de cada cambio:"
Write-Host "   git add -A"
Write-Host "   git commit -m ""qué cambiaste"""
Write-Host ""
Write-Host " Para ver el historial:            git log --oneline"
Write-Host " Para deshacer lo que no guardaste: git restore ."
Write-Host ""
if (Test-Path "_para_borrar") {
  Write-Host " La carpeta _para_borrar\ tiene un intento de Git que no sirve."
  Write-Host " Git la ignora; podés borrarla a mano cuando quieras."
}
Write-Host "══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
