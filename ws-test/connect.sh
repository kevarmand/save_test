#!/bin/sh
set -eu

TOKEN="$(node /work/gen-token.js "$@")"

printf '[ws-test] connecting to %s\n' "${WS_URL}"
printf '[ws-test] sending auth frame automatically\n'

(
	printf '{"type":"auth","token":"%s"}\n' "${TOKEN}"
	cat
) | wscat -k -c "${WS_URL}"