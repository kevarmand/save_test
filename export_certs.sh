#!/usr/bin/env bash
set -e

SERVICES=(
	dm
	dm-db
	realtime
	notifications
	notifications-db
)

for svc in "${SERVICES[@]}"; do
	echo "==> Copy certs for $svc"
	mkdir -p "$svc/certs"
	rm -f "$svc/certs"/*
	cp -r ".pki/$svc/." "$svc/certs/"
done

echo "Done"