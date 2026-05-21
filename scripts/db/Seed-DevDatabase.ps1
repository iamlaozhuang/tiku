param()

$ErrorActionPreference = "Stop"

node --no-warnings --experimental-strip-types .\src\db\dev-seed.ts
