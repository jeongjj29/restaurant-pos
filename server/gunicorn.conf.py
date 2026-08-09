"""Environment-driven Gunicorn configuration for container deployments."""

import os


def _positive_int(name, default):
    value = int(os.getenv(name, str(default)))
    if value < 1:
        raise ValueError(f"{name} must be a positive integer")
    return value


bind = os.getenv("GUNICORN_BIND", f"0.0.0.0:{os.getenv('PORT', '8080')}")
workers = _positive_int("WEB_CONCURRENCY", 2)
threads = _positive_int("GUNICORN_THREADS", 2)
worker_class = "gthread"
timeout = _positive_int("GUNICORN_TIMEOUT", 30)
graceful_timeout = _positive_int("GUNICORN_GRACEFUL_TIMEOUT", 30)
keepalive = _positive_int("GUNICORN_KEEPALIVE", 5)
max_requests = _positive_int("GUNICORN_MAX_REQUESTS", 1000)
max_requests_jitter = _positive_int("GUNICORN_MAX_REQUESTS_JITTER", 100)

accesslog = "-"
errorlog = "-"
capture_output = True
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")
forwarded_allow_ips = os.getenv("FORWARDED_ALLOW_IPS", "127.0.0.1,::1")
