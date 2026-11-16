#!/usr/bin/env bash
# Uso: ./set-domain.sh https://www.tudominio.es   (desde la carpeta docs/, con ../sitio al lado)
# Sustituye __DOMINIO__ en canónicas, Open Graph, JSON-LD, sitemap y robots.
set -euo pipefail
[ $# -eq 1 ] || { echo "Uso: $0 https://tudominio.es"; exit 1; }
D="${1%/}"
grep -rl "__DOMINIO__" ../sitio | while read -r f; do sed -i.bak "s|__DOMINIO__|$D|g" "$f" && rm -f "$f.bak"; done
echo "Listo. Revisa: grep -r __DOMINIO__ ../sitio  (no debe devolver nada)"
