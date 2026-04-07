#!/usr/bin/env bash
set -e

PKI_DIR=".pki"
CA_DIR="$PKI_DIR/ca"

SERVICES=(
  nginx
  gateway
  auth
  auth-db
  user
  user-db
  social
  social-db
  content
  content-db
  realtime
  realtime-db
  prometheus
  grafana
  bff
  frontend
  dm
  dm-db
  notifications
  notifications-db
)

build_ext_file()
{
	local svc="$1"
	local ext_file="$2"

	if [[ "$svc" == *-db ]]; then
		cat > "$ext_file" <<EOF
basicConstraints=CA:FALSE
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:$svc
EOF
	else
		cat > "$ext_file" <<EOF
basicConstraints=CA:FALSE
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth,clientAuth
subjectAltName=DNS:$svc
EOF
	fi
}

echo "==> Reset PKI"
rm -rf "$PKI_DIR"
mkdir -p "$CA_DIR"

echo "==> Generate CA"
openssl genrsa -out "$CA_DIR/ca.key" 4096
openssl req -x509 -new -nodes \
	-key "$CA_DIR/ca.key" \
	-sha256 -days 3650 \
	-subj "/CN=Dev-Internal-CA" \
	-out "$CA_DIR/ca.crt"

for svc in "${SERVICES[@]}"; do
	echo "==> Generate cert for $svc"

	SVC_DIR="$PKI_DIR/$svc"
	EXT_FILE="$SVC_DIR/$svc.ext"

	mkdir -p "$SVC_DIR"

	openssl genrsa -out "$SVC_DIR/$svc.key" 2048

	openssl req -new \
		-key "$SVC_DIR/$svc.key" \
		-subj "/CN=$svc" \
		-addext "subjectAltName=DNS:$svc" \
		-out "$SVC_DIR/$svc.csr"

	build_ext_file "$svc" "$EXT_FILE"

	openssl x509 -req \
		-in "$SVC_DIR/$svc.csr" \
		-CA "$CA_DIR/ca.crt" \
		-CAkey "$CA_DIR/ca.key" \
		-CAcreateserial \
		-out "$SVC_DIR/$svc.crt" \
		-days 3650 \
		-sha256 \
		-extfile "$EXT_FILE"

	if [[ "$svc" != *-db ]]; then
		openssl pkcs12 -export \
			-out "$SVC_DIR/$svc.p12" \
			-inkey "$SVC_DIR/$svc.key" \
			-in "$SVC_DIR/$svc.crt" \
			-certfile "$CA_DIR/ca.crt" \
			-passout pass:
	fi

	rm -f "$SVC_DIR/$svc.csr" "$EXT_FILE"

	chmod 600 "$SVC_DIR/$svc.key"
	cp "$CA_DIR/ca.crt" "$SVC_DIR/ca.crt"
done

chmod 600 "$CA_DIR/ca.key"

echo "PKI ready in $PKI_DIR"