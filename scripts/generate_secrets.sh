#!/bin/sh
set -eu

generate_secret()
{
	path="$1"

	if [ -f "$path" ]; then
		echo "skip: $path already exists"
		return
	fi

	openssl rand -hex 32 > "$path"
	chmod 600 "$path"
	echo "created: $path"
}

generate_env()
{
	env_name="$1"
	dir=".secrets/$env_name"

	mkdir -p "$dir"
	generate_secret "$dir/ws_token_secret"
}

case "${1:-all}" in
	dev)
		generate_env dev
		;;
	prod)
		generate_env prod
		;;
	all)
		generate_env dev
		generate_env prod
		;;
	*)
		echo "usage: $0 [dev|prod|all]" >&2
		exit 1
		;;
esac