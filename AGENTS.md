# Data access

- Read campaign respondents and submitted responses through shared pagination with deterministic ordering; exports and analytics must consume the same complete dataset to avoid API row-limit truncation.

# Maturity classification

- Keep continuous maturity interval handling and scaled machine-precision tolerance inside `levelFromTotalScore`; return an explicit level-0 invalid state for out-of-domain or nonfinite input so empty assessments remain renderable without inventing maturity.