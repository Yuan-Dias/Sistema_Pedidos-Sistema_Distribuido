Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " [TESTE DE CONCORRENCIA R6] Disparando 2 requisicoes simultaneas..." -ForegroundColor Yellow
Write-Host " Alvo: POST http://localhost:8083/pedidos (Produto ID: 3, Quantidade: 1)" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

$scriptBlock = {
    $url = "http://localhost:8083/pedidos"
    $payload = '{"itens":[{"produtoId": 3, "quantidade": 1}]}'
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $payload -ContentType "application/json" -ErrorAction Stop
        return "SUCESSO: Recebeu HTTP 201 (Pedido Criado) - O estoque baixou para 0."
    } catch {
        $ex = $_.Exception.Response
        if ($ex.StatusCode -eq "Conflict") {
            return "BLOQUEADO: Recebeu HTTP 409 (Conflict) - Ocorreu Lock de banco de dados."
        }
        return "ERRO INESPERADO: " + $_.Exception.Message
    }
}

Get-Job | Remove-Job -Force

$time = Measure-Command {
    $job1 = Start-Job -ScriptBlock $scriptBlock
    $job2 = Start-Job -ScriptBlock $scriptBlock
    Wait-Job -Job $job1, $job2 | Out-Null
    $resultado1 = Receive-Job -Job $job1
    $resultado2 = Receive-Job -Job $job2
}

$cor1 = if ($resultado1 -match "SUCESSO") { "Green" } else { "Red" }
$cor2 = if ($resultado2 -match "SUCESSO") { "Green" } else { "Red" }

Write-Host "`nRequisicao 1 -> $resultado1" -ForegroundColor $cor1
Write-Host "Requisicao 2 -> $resultado2" -ForegroundColor $cor2
Write-Host "`nTempo decorrido: $($time.TotalMilliseconds) ms" -ForegroundColor Gray
Write-Host "----------------------------------------------------------------------"

if (($resultado1 -match "SUCESSO" -and $resultado2 -match "BLOQUEADO") -or ($resultado1 -match "BLOQUEADO" -and $resultado2 -match "SUCESSO")) {
    Write-Host " VEREDITO: APROVADO! O requisito R6 (Lock de Banco) funcionou perfeitamente." -ForegroundColor Green
} else {
    Write-Host " VEREDITO: FALHA! Os resultados nao foram o esperado (1 Sucesso e 1 Bloqueado)." -ForegroundColor Red
}
Write-Host "======================================================================" -ForegroundColor Cyan

Remove-Job -Job $job1, $job2 -Force