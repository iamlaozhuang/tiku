param(
  [switch]$Execute,
  [switch]$ConfirmOwnerPreviewEmptyBaseline
)

$ErrorActionPreference = "Stop"

$arguments = @("--no-warnings", "--experimental-strip-types", ".\src\db\owner-preview-empty-baseline.ts")

if ($Execute) {
  $arguments += "--execute"
}

if ($ConfirmOwnerPreviewEmptyBaseline) {
  $arguments += "--confirm-owner-preview-empty-baseline"
}

node @arguments
