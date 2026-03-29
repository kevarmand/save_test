#!/usr/bin/env bash
set -euo pipefail

root="."
out=""
header=1
declare -a excludes=()
declare -a includes=()

usage() {
  cat <<'USAGE'
Usage: concat_tree.sh [-r ROOT] [-o OUTFILE] [-x PATTERN]... [-i FILE]... [--no-header]

Options:
  -r ROOT        Dossier racine (défaut: .)
  -o OUTFILE     Fichier de sortie (défaut: stdout)
  -x PATTERN     Pattern à exclure (style find -path), peut être répété
  -i FILE        Fichier à inclure explicitement, peut être répété
  --no-header    Ne pas écrire "===== FILE: ... =====" avant chaque fichier
  -h             Aide
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -r) root="$2"; shift 2;;
    -o) out="$2"; shift 2;;
    -x) excludes+=("$2"); shift 2;;
    -i) includes+=("$2"); shift 2;;
    --no-header) header=0; shift;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if [[ -n "$out" ]]; then
  mkdir -p "$(dirname "$out")"
fi

root_abs="$(realpath -m "$root")"

if [[ -n "$out" ]]; then
  out_abs="$(realpath -m "$out")"

  if [[ "$out_abs" == "$root_abs"/* ]]; then
    out_rel="${out_abs#$root_abs/}"
    excludes+=("$root/$out_rel")
    excludes+=("./$out_rel")
    excludes+=("$out_rel")
  elif [[ "$out_abs" == "$root_abs" ]]; then
    echo "Output file cannot be the root directory" >&2
    exit 1
  fi
fi

append_file() {
  local f="$1"

  [[ -f "$f" ]] || return 0
  if [[ $header -eq 1 ]]; then
    printf '===== FILE: %s =====\n' "$f"
  fi
  cat "$f"
  printf '\n'
}

contains_file() {
  local needle="$1"
  shift
  local item

  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

print_tree() {
  printf '===== TREE: %s =====\n' "$root"

  if command -v tree >/dev/null 2>&1; then
    tree "$root" \
      -I 'node_modules|.git|dist' \
      || true
  else
    find "$root" \
      $(for pat in "${excludes[@]}"; do printf ' -not -path %q' "$pat"; done) \
      | sed "s|^$root|.|" \
      | sort
  fi

  printf '\n'
}

declare -a auto_files
auto_files=(
  "$root/docker-compose.yml"
  "$root/docker-compose.yaml"
  "$root/compose.yml"
  "$root/compose.yaml"
)

declare -a all_files

while IFS= read -r -d '' f; do
  all_files+=("$f")
done < <(
  find "$root" -type f \
    $(for pat in "${excludes[@]}"; do printf ' -not -path %q' "$pat"; done) \
    -print0 | sort -z
)

for f in "${auto_files[@]}"; do
  if [[ -f "$f" ]] && ! contains_file "$f" "${all_files[@]}"; then
    all_files+=("$f")
  fi
done

for f in "${includes[@]}"; do
  if [[ -f "$f" ]] && ! contains_file "$f" "${all_files[@]}"; then
    all_files+=("$f")
  fi
done

if [[ -n "$out" ]]; then
  exec >"$out"
fi

print_tree

printf '%s\n' "${all_files[@]}" | sort -u | while IFS= read -r f; do
  append_file "$f"
done