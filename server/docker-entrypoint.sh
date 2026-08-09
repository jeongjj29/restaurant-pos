#!/bin/sh

set -eu

is_enabled() {
    case "$1" in
        1|true|TRUE|yes|YES|on|ON) return 0 ;;
        0|false|FALSE|no|NO|off|OFF) return 1 ;;
        *)
            echo "Expected a boolean value, received: $1" >&2
            exit 2
            ;;
    esac
}

run_migrations() {
    max_attempts="${MIGRATION_MAX_ATTEMPTS:-10}"
    retry_delay="${MIGRATION_RETRY_DELAY_SECONDS:-3}"

    case "$max_attempts" in
        ''|*[!0-9]*|0)
            echo "MIGRATION_MAX_ATTEMPTS must be a positive integer" >&2
            exit 2
            ;;
    esac
    case "$retry_delay" in
        ''|*[!0-9]*)
            echo "MIGRATION_RETRY_DELAY_SECONDS must be a non-negative integer" >&2
            exit 2
            ;;
    esac

    attempt=1
    while ! flask --app manage:app db upgrade; do
        if [ "$attempt" -ge "$max_attempts" ]; then
            echo "Database migrations failed after $attempt attempts" >&2
            return 1
        fi
        echo "Database migration attempt $attempt failed; retrying in ${retry_delay}s" >&2
        attempt=$((attempt + 1))
        sleep "$retry_delay"
    done
}

if is_enabled "${RUN_MIGRATIONS:-true}"; then
    run_migrations
fi

if is_enabled "${SEED_DATABASE:-false}"; then
    flask --app manage:app seed
fi

exec "$@"
