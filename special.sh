#!/usr/bin/env bash
set -euo pipefail

OUT="${1:-context_contract.txt}"

TREE_PATHS=(
	"compose.yaml"
	"dm/prisma"
	"dm/src"
	"notifications/prisma"
	"notifications/src"
	"realtime/src"
)

PUBLIC_WS_FILES=(
	"compose.yaml"

	"realtime/src/services/auth.service.js"
	"realtime/src/services/dispatch.service.js"
	"realtime/src/validation/ws.validation.js"
	"realtime/src/ws/attachWebSocketServer.js"
	"realtime/src/ws/message.handler.js"
	"realtime/src/ws/send.js"
)

REALTIME_INTERNAL_FILES=(
	"realtime/src/routes/internal.routes.js"
	"realtime/src/controllers/push.controller.js"
	"realtime/src/services/push.service.js"
	"realtime/src/services/registry.service.js"
	"realtime/src/validation/push.validation.js"
	"realtime/src/middlewares/internalClientAuth.js"
)

DM_FILES=(
	"dm/prisma/schema.prisma"
	"dm/src/routes/dm.routes.js"
	"dm/src/controllers/dm.controller.js"
	"dm/src/services/dm.service.js"
	"dm/src/repositories/dm.repository.js"
	"dm/src/validation/dm.validation.js"
	"dm/src/middlewares/requireCaller.js"
	"dm/src/clients/realtime.client.js"
)

NOTIFICATIONS_FILES=(
	"notifications/prisma/schema.prisma"
	"notifications/src/routes/notifications.routes.js"
	"notifications/src/routes/internal.routes.js"
	"notifications/src/controllers/notifications.controller.js"
	"notifications/src/controllers/internal.controller.js"
	"notifications/src/services/notifications.service.js"
	"notifications/src/repositories/notifications.repository.js"
	"notifications/src/validation/notifications.validation.js"
	"notifications/src/validation/internal.validation.js"
	"notifications/src/middlewares/requireCaller.js"
	"notifications/src/clients/realtime.client.js"
)

REALTIME_TO_SERVICES_FILES=(
	"realtime/src/clients/dm.client.js"
	"realtime/src/clients/notifications.client.js"
)

append_file()
{
	local f="$1"

	[[ -f "$f" ]] || return 0
	printf '===== FILE: %s =====\n' "$f"
	cat "$f"
	printf '\n'
}

append_section()
{
	local title="$1"
	shift

	printf '===== SECTION: %s =====\n\n' "$title"
	for f in "$@"; do
		append_file "$f"
	done
}

{
	printf '===== TREE =====\n'
	for path in "${TREE_PATHS[@]}"; do
		[[ -e "$path" ]] || continue
		if command -v tree >/dev/null 2>&1; then
			tree "$path" \
				-I 'node_modules|certs|*.crt|*.key|*.p12|package-lock.json|notFound.js|Dockerfile|init|ws-test|log|errors|db|server.js|app.js|httpLogger.js|https.agent.js|https.request.js|package.json|prisma.config.ts|env.js|tls.js' \
				|| true
		else
			find "$path" \
				-not -path '*/node_modules/*' \
				-not -path '*/certs/*' \
				-not -name '*.crt' \
				-not -name '*.key' \
				-not -name '*.p12' \
				-not -name 'package-lock.json' \
				-not -name 'notFound.js' \
				-not -name 'Dockerfile' \
				-not -path '*/init/*' \
				-not -path '*/ws-test/*' \
				-not -path '*/log/*' \
				-not -path '*/errors/*' \
				-not -path '*/db/*' \
				-not -name 'server.js' \
				-not -name 'app.js' \
				-not -name 'httpLogger.js' \
				-not -name 'https.agent.js' \
				-not -name 'https.request.js' \
				-not -name 'package.json' \
				-not -name 'prisma.config.ts' \
				-not -name 'env.js' \
				-not -name 'tls.js' \
				| sort
		fi
		printf '\n'
	done

	append_section "PUBLIC WS API" "${PUBLIC_WS_FILES[@]}"
	append_section "REALTIME INTERNAL PUSH API" "${REALTIME_INTERNAL_FILES[@]}"
	append_section "DM SERVICE API + LOGIC" "${DM_FILES[@]}"
	append_section "NOTIFICATIONS SERVICE API + LOGIC" "${NOTIFICATIONS_FILES[@]}"
	append_section "REALTIME -> SERVICES CLIENT CONTRACTS" "${REALTIME_TO_SERVICES_FILES[@]}"
} > "$OUT"

echo "Wrote $OUT"