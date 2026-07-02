param(
  [switch]$Execute,
  [switch]$ConfirmOwnerPreviewRuntimeRagImport,
  [string]$PackageRoot = "D:\tiku-local-private\owner-facing-fixtures",
  [string]$StorageRoot = ""
)

$ErrorActionPreference = "Stop"

$arguments = @(
  "--no-warnings",
  "--experimental-strip-types",
  ".\src\db\owner-preview-runtime-rag-resource-import.ts",
  "--package-root",
  $PackageRoot
)

if ($StorageRoot -ne "") {
  $arguments += "--storage-root"
  $arguments += $StorageRoot
}

if ($Execute) {
  $arguments += "--execute"
}

if ($ConfirmOwnerPreviewRuntimeRagImport) {
  $arguments += "--confirm-owner-preview-runtime-rag-import"
}

node @arguments
exit $LASTEXITCODE
