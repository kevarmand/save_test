FROM docker.io/library/postgres:18-alpine

USER root

RUN mkdir -p /etc/postgres/certs

COPY certs/ca.crt /etc/postgres/certs/ca.crt
COPY certs/dm-db.crt /etc/postgres/certs/dm-db.crt
COPY certs/dm-db.key /etc/postgres/certs/dm-db.key
COPY pg_hba.conf /etc/postgres/pg_hba.conf

RUN chown postgres:postgres /etc/postgres/certs/dm-db.key /etc/postgres/certs/dm-db.crt /etc/postgres/certs/ca.crt \
	&& chmod 600 /etc/postgres/certs/dm-db.key \
	&& chmod 644 /etc/postgres/certs/dm-db.crt /etc/postgres/certs/ca.crt /etc/postgres/pg_hba.conf

USER postgres