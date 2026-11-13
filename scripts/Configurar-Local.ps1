param(
    [string]$Conexao = 'Server=(localdb)\MSSQLLocalDB;Database=ZeroFrameMobile;Integrated Security=true;TrustServerCertificate=true'
)
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$destino = Join-Path $raiz 'API/ZeroFrame.API/appsettings.Development.local.json'
if (Test-Path -LiteralPath $destino) {
    Write-Host 'A configuração local já existe. Edite o arquivo local para trocar a conexão.'
    exit 0
}
$gerador = [Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 48
$gerador.GetBytes($bytes)
$gerador.Dispose()
$configuracao = @{
    ConnectionStrings = @{ DefaultConnection = $Conexao }
    Jwt = @{
        SecretKey = [Convert]::ToBase64String($bytes)
        Issuer = 'ZeroFrameAPI'
        Audience = 'ZeroFrameFrontend'
    }
}
$configuracao | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $destino -Encoding utf8
Write-Host 'Conexão e chave JWT locais configuradas. O arquivo fica fora do Git.'
