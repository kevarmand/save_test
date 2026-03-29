#!/usr/bin/env bash

input="$1"

current_file=""

while IFS= read -r line || [ -n "$line" ]; do
	if [[ $line =~ ^=====\ FILE:\ (.+)\ =====$ ]]; then
		current_file="${BASH_REMATCH[1]}"
		mkdir -p "$(dirname "$current_file")"
		: > "$current_file"
	else
		[ -n "$current_file" ] && printf '%s\n' "$line" >> "$current_file"
	fi
done < "$input"