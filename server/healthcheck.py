"""Container readiness probe with a Flask-compatible trusted Host header."""

import os
from urllib.request import Request, urlopen


def probe_host():
    explicit_host = os.getenv("HEALTHCHECK_HOST", "").strip()
    if explicit_host:
        return explicit_host

    trusted_hosts = os.getenv("TRUSTED_HOSTS", "")
    first_trusted_host = next(
        (host.strip() for host in trusted_hosts.split(",") if host.strip()),
        None,
    )
    return first_trusted_host or "127.0.0.1"


def main():
    port = os.getenv("PORT", "8080")
    request = Request(
        f"http://127.0.0.1:{port}/api/ready",
        headers={"Host": probe_host()},
    )
    with urlopen(request, timeout=3) as response:
        response.read(1)


if __name__ == "__main__":
    main()
