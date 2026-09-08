"""
Circuit Breaker wrapper for the Groq API client.

Uses pybreaker to prevent cascading failures when Groq is degraded.
After `fail_max` consecutive failures, the circuit opens for
`reset_timeout` seconds, during which all calls fail fast with a
clear error instead of waiting for timeouts.
"""

import pybreaker
import structlog

logger = structlog.get_logger(__name__)


# ─────────────────────────────────────────────
# Circuit Breaker Configuration
# ─────────────────────────────────────────────
class GroqCircuitBreakerListener(pybreaker.CircuitBreakerListener):
    """Log circuit breaker state transitions."""

    def state_change(self, cb, old_state, new_state):
        logger.warning(
            "circuit_breaker_state_change",
            breaker=cb.name,
            old_state=str(old_state),
            new_state=str(new_state),
        )

    def failure(self, cb, exc):
        logger.warning(
            "circuit_breaker_failure",
            breaker=cb.name,
            error=str(exc)[:200],
        )


groq_breaker = pybreaker.CircuitBreaker(
    fail_max=3,            # Open after 3 consecutive failures
    reset_timeout=60,      # Try again after 60 seconds
    name="groq_api",
    listeners=[GroqCircuitBreakerListener()],
)
