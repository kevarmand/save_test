#!/bin/bash

SRC_LIST=(
    "compose.yaml"
    "compose.dev.yaml"
    "compose.prod.yaml"
    "Makefile"

    "gateway/Dockerfile"
    "gateway/nginx.conf"

    "realtime/package.json"
    "realtime/Dockerfile"
    "realtime/src/server.js"
    "realtime/src/config/env.js"
    "realtime/src/config/tls.js"

    "realtime/src/servers/front.server.js"
    "realtime/src/servers/internal.server.js"
    "realtime/src/apps/front.app.js"
    "realtime/src/apps/internal.app.js"

    "realtime/src/ws/attachWebSocketServer.js"
    "realtime/src/ws/message.handler.js"
    "realtime/src/ws/send.js"

    "realtime/src/services/auth.service.js"
    "realtime/src/services/dispatch.service.js"
    "realtime/src/services/push.service.js"
    "realtime/src/services/registry.service.js"

    "realtime/src/clients/dm.client.js"
    "realtime/src/clients/notifications.client.js"
    "realtime/src/clients/https.agent.js"
    "realtime/src/clients/https.request.js"

    "realtime/src/middlewares/internalClientAuth.js"

    "dm/package.json"
    "dm/Dockerfile"
    "dm/src/config/env.js"
    "dm/src/config/tls.js"
    "dm/src/clients/realtime.client.js"
    "dm/src/clients/https.agent.js"
    "dm/src/clients/https.request.js"

    "notifications/package.json"
    "notifications/Dockerfile"
    "notifications/src/config/env.js"
    "notifications/src/config/tls.js"
    "notifications/src/clients/realtime.client.js"
    "notifications/src/clients/https.agent.js"
    "notifications/src/clients/https.request.js"

    "ws-test/package.json"
    "ws-test/Dockerfile"
    "ws-test/connect.sh"
    "ws-test/lib/ws-client.js"
    "ws-test/lib/ws-e2e.js"
    "ws-test/lib/dm-e2e.js"
    "ws-test/lib/contract.js"
)

OUTPUT_FILE="output.txt"

> "$OUTPUT_FILE"

for FILE in "${SRC_LIST[@]}"; do
    if [[ -f "$FILE" ]]; then
        echo "Appending $FILE to $OUTPUT_FILE"
        {
            echo "===== FILE: $FILE ====="
            cat "$FILE"
            echo
            echo
        } >> "$OUTPUT_FILE"
    else
        echo "Warning: $FILE not found, skipping."
    fi
done

echo "All files have been appended to $OUTPUT_FILE"