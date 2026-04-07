FROM postgres:18-alpine

USER root

RUN mkdir -p /etc/postgres/certs

COPY certs/ca.crt /etc/postgres/certs/ca.crt
COPY certs/notifications-db.crt /etc/postgres/certs/notifications-db.crt
COPY certs/notifications-db.key /etc/postgres/certs/notifications-db.key
COPY pg_hba.conf /etc/postgres/pg_hba.conf

RUN chown postgres:postgres /etc/postgres/certs/notifications-db.key /etc/postgres/certs/notifications-db.crt /etc/postgres/certs/ca.crt \
	&& chmod 600 /etc/postgres/certs/notifications-db.key \
	&& chmod 644 /etc/postgres/certs/notifications-db.crt /etc/postgres/certs/ca.crt /etc/postgres/pg_hba.conf

USER postgres