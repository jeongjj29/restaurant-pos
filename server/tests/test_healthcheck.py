import os
import unittest
from unittest.mock import MagicMock, patch

import healthcheck


class HealthcheckTestCase(unittest.TestCase):
    def test_uses_first_trusted_host_for_internal_probe(self):
        with patch.dict(
            os.environ,
            {"TRUSTED_HOSTS": "pos.example.com,admin.example.com"},
            clear=True,
        ):
            self.assertEqual(healthcheck.probe_host(), "pos.example.com")

    def test_explicit_probe_host_takes_precedence(self):
        with patch.dict(
            os.environ,
            {
                "HEALTHCHECK_HOST": "probe.example.com",
                "TRUSTED_HOSTS": "pos.example.com",
            },
            clear=True,
        ):
            self.assertEqual(healthcheck.probe_host(), "probe.example.com")

    def test_falls_back_to_loopback_and_probes_readiness(self):
        response = MagicMock()
        response.__enter__.return_value = response

        with patch.dict(os.environ, {"PORT": "9090"}, clear=True):
            with patch("healthcheck.urlopen", return_value=response) as urlopen:
                healthcheck.main()

        request = urlopen.call_args.args[0]
        self.assertEqual(request.full_url, "http://127.0.0.1:9090/api/ready")
        self.assertEqual(request.get_header("Host"), "127.0.0.1")
        urlopen.assert_called_once_with(request, timeout=3)


if __name__ == "__main__":
    unittest.main()
