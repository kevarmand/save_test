#!/usr/bin/env bash
set -euo pipefail

OUT="${1:-context_min.txt}"

FILES=(
	"compose.yaml"

	"dm/Dockerfile"
	"dm/package.json"
	"dm/prisma/schema.prisma"
	"dm/prisma.config.ts"
	"dm/src/app.js"
	"dm/src/server.js"
	"dm/src/config/env.js"
	"dm/src/config/tls.js"
	"dm/src/db/prisma.js"
	"dm/src/middlewares/requireCaller.js"
	"dm/src/routes/dm.routes.js"
	"dm/src/controllers/dm.controller.js"
	"dm/src/services/dm.service.js"
	"dm/src/repositories/dm.repository.js"
	"dm/src/validation/dm.validation.js"
	"dm/src/clients/https.agent.js"
	"dm/src/clients/https.request.js"
	"dm/src/clients/realtime.client.js"
	"dm/src/clients/notifications.client.js"
	"dm/src/errors/AppError.js"
	"dm/src/errors/errorCodes.js"
	"dm/src/errors/errorHandler.js"
	"dm/src/errors/notFound.js"

	"dm-db/Dockerfile"
	"dm-db/pg_hba.conf"

	"notifications/Dockerfile"
	"notifications/package.json"
	"notifications/prisma/schema.prisma"
	"notifications/prisma.config.ts"
	"notifications/src/app.js"
	"notifications/src/server.js"
	"notifications/src/config/env.js"
	"notifications/src/config/tls.js"
	"notifications/src/db/prisma.js"
	"notifications/src/middlewares/requireCaller.js"
	"notifications/src/routes/notifications.routes.js"
	"notifications/src/routes/internal.routes.js"
	"notifications/src/controllers/notifications.controller.js"
	"notifications/src/controllers/internal.controller.js"
	"notifications/src/services/notifications.service.js"
	"notifications/src/repositories/notifications.repository.js"
	"notifications/src/validation/notifications.validation.js"
	"notifications/src/validation/internal.validation.js"
	"notifications/src/clients/https.agent.js"
	"notifications/src/clients/https.request.js"
	"notifications/src/clients/realtime.client.js"
	"notifications/src/errors/AppError.js"
	"notifications/src/errors/errorCodes.js"
	"notifications/src/errors/errorHandler.js"
	"notifications/src/errors/notFound.js"

	"notifications-db/Dockerfile"
	"notifications-db/pg_hba.conf"

	"realtime/Dockerfile"
	"realtime/package.json"
	"realtime/src/server.js"
	"realtime/src/apps/front.app.js"
	"realtime/src/apps/internal.app.js"
	"realtime/src/servers/front.server.js"
	"realtime/src/servers/internal.server.js"
	"realtime/src/config/env.js"
	"realtime/src/config/tls.js"
	"realtime/src/middlewares/internalClientAuth.js"
	"realtime/src/routes/internal.routes.js"
	"realtime/src/controllers/push.controller.js"
	"realtime/src/services/auth.service.js"
	"realtime/src/services/dispatch.service.js"
	"realtime/src/services/push.service.js"
	"realtime/src/services/registry.service.js"
	"realtime/src/validation/ws.validation.js"
	"realtime/src/validation/push.validation.js"
	"realtime/src/clients/https.agent.js"
	"realtime/src/clients/https.request.js"
	"realtime/src/clients/dm.client.js"
	"realtime/src/clients/notifications.client.js"
	"realtime/src/ws/attachWebSocketServer.js"
	"realtime/src/ws/message.handler.js"
	"realtime/src/ws/send.js"
	"realtime/src/errors/AppError.js"
	"realtime/src/errors/errorCodes.js"
	"realtime/src/errors/errorHandler.js"
	"realtime/src/errors/notFound.js"

	"ws-test/connect.sh"
	"ws-test/gen-auth-frame.js"
	"ws-test/gen-token.js"
	"ws-test/package.json"
)

TREE_PATHS=(
	"compose.yaml"
	"dm"
	"dm-db"
	"notifications"
	"notifications-db"
	"realtime"
	"ws-test"
)

append_file()
{
	local f="$1"

	[[ -f "$f" ]] || return 0
	printf '===== FILE: %s =====\n' "$f"
	cat "$f"
	printf '\n'
}

{
	printf '===== TREE =====\n'
	for path in "${TREE_PATHS[@]}"; do
		[[ -e "$path" ]] || continue
		if command -v tree >/dev/null 2>&1; then
			tree "$path" \
				-I 'node_modules|certs|*.crt|*.key|*.p12|package-lock.json' \
				|| true
		else
			find "$path" \
				-not -path '*/node_modules/*' \
				-not -path '*/certs/*' \
				-not -name '*.crt' \
				-not -name '*.key' \
				-not -name '*.p12' \
				-not -name 'package-lock.json' \
				| sort
		fi
		printf '\n'
	done

	for f in "${FILES[@]}"; do
		append_file "$f"
	done
} > "$OUT"

echo "Wrote $OUT"