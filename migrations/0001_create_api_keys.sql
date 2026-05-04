CREATE TABLE api_keys (
    id           TEXT    PRIMARY KEY,
    key          TEXT    NOT NULL UNIQUE,
    name         TEXT    NOT NULL,
    cache_bypass INTEGER NOT NULL DEFAULT 0,
    enabled      INTEGER NOT NULL DEFAULT 1
);
