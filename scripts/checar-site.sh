#!/usr/bin/env bash
# Confere o site publicado: página inicial, cabeçalhos de segurança e página 404.
# Uso: scripts/checar-site.sh https://henriquejunior.dev
set -euo pipefail

URL="${1:?informe a URL do site}"
URL="${URL%/}"
falhas=0

ok()   { echo "  ok    $1"; }
erro() { echo "  ERRO  $1"; falhas=$((falhas + 1)); }

# O domínio pode levar alguns segundos para servir a versão nova.
buscar() {
  local caminho="$1" tentativa
  for tentativa in 1 2 3 4 5 6; do
    if curl -sS --max-time 15 -D cabecalhos.txt -o corpo.html -w '%{http_code}' "$URL$caminho" > status.txt; then
      return 0
    fi
    echo "  tentativa $tentativa falhou; nova tentativa em 10 s"
    sleep 10
  done
  return 1
}

cabecalho() {
  # Valor do cabeçalho, sem diferenciar maiúsculas no nome.
  grep -i "^$1:" cabecalhos.txt | head -n 1 | cut -d: -f2- | tr -d '\r' | sed 's/^ *//'
}

espera_cabecalho() {
  local nome="$1" trecho="$2" valor
  valor="$(cabecalho "$nome")"
  if [[ "$valor" == *"$trecho"* ]]; then ok "$nome contém \"$trecho\""; else erro "$nome: esperado \"$trecho\", recebido \"$valor\""; fi
}

echo "Página inicial: $URL/"
buscar "/" || { echo "  ERRO  sem resposta de $URL/"; exit 1; }
status="$(cat status.txt)"
[[ "$status" == "200" ]] && ok "status 200" || erro "status $status (esperado 200)"
grep -q "Henrique Teixeira" corpo.html && ok "conteúdo da página" || erro "texto \"Henrique Teixeira\" não encontrado"
espera_cabecalho "content-security-policy" "default-src 'none'"
espera_cabecalho "strict-transport-security" "max-age="
espera_cabecalho "x-content-type-options" "nosniff"
espera_cabecalho "x-frame-options" "DENY"
espera_cabecalho "referrer-policy" "strict-origin-when-cross-origin"
espera_cabecalho "permissions-policy" "camera=()"
espera_cabecalho "cross-origin-opener-policy" "same-origin"
echo "  cabeçalhos recebidos:"
sed 's/^/    /' cabecalhos.txt | tr -d '\r'

caminho_404="/nao-existe-$(date +%s)"
echo "Página inexistente: $URL$caminho_404"
buscar "$caminho_404" || { echo "  ERRO  sem resposta"; exit 1; }
status="$(cat status.txt)"
[[ "$status" == "404" ]] && ok "status 404" || erro "status $status (esperado 404)"
grep -q "Página não encontrada" corpo.html && ok "página 404 personalizada" || erro "página 404 personalizada não encontrada"
espera_cabecalho "content-security-policy" "default-src 'none'"

rm -f cabecalhos.txt corpo.html status.txt

if (( falhas > 0 )); then
  echo "Falhas: $falhas"
  exit 1
fi
echo "Site conferido sem falhas."
