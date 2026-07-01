param(
  [switch]$Execute,
  [switch]$ConfirmOwnerPreviewResourceImport,
  [string]$PackageRoot = "D:\tiku-local-private\owner-facing-fixtures"
)

$ErrorActionPreference = "Stop"

$arguments = @(
  "--no-warnings",
  "--experimental-strip-types",
  ".\src\db\owner-preview-resource-import.ts",
  "--package-root",
  $PackageRoot
)

if ($Execute) {
  $arguments += "--execute"
}

if ($ConfirmOwnerPreviewResourceImport) {
  $arguments += "--confirm-owner-preview-resource-import"
}

node @arguments
exit $LASTEXITCODE
