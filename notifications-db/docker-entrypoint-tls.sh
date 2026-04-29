#!/bin/sh
set -e

mkdir -p /etc/postgres/certs-runtime

cp /run/postgres-certs/ca.crt /etc/postgres/certs-runtime/ca.crt
cp /run/postgres-certs/notifications-db.crt /etc/postgres/certs-runtime/notifications-db.crt
cp /run/postgres-certs/notifications-db.key /etc/postgres/certs-runtime/notifications-db.key

chown -R postgres:postgres /etc/postgres/certs-runtime
chmod 644 /etc/postgres/certs-runtime/ca.crt
chmod 644 /etc/postgres/certs-runtime/notifications-db.crt
chmod 600 /etc/postgres/certs-runtime/notifications-db.key

exec docker-entrypoint.sh "$@"