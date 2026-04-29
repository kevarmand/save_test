FROM docker.io/library/postgres:18-alpine

USER root

COPY pg_hba.conf /etc/postgres/pg_hba.conf
COPY docker-entrypoint-tls.sh /usr/local/bin/docker-entrypoint-tls.sh

RUN chmod +x /usr/local/bin/docker-entrypoint-tls.sh \
	&& chown postgres:postgres /etc/postgres/pg_hba.conf \
	&& chmod 644 /etc/postgres/pg_hba.conf

ENTRYPOINT ["docker-entrypoint-tls.sh"]

CMD ["postgres"]