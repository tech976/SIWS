-- ===========================================================================
-- SIWS Platform — one-time local database setup.
--
-- Run as the `postgres` superuser:
--   psql -U postgres -h 127.0.0.1 -p 5433 -f scripts/setup-database.sql
--
-- PORT NOTE: this machine has PostgreSQL 16 and 18 installed, both originally
-- configured for 5432 and both set to start automatically — so whichever won
-- the race owned the port, and the app's credentials would fail against the
-- wrong cluster. PostgreSQL 18 now listens on 5433 and hosts this database;
-- PG16 keeps 5432. Match the port in DATABASE_URI to whichever cluster this
-- script was run against.
--
-- Creates a least-privilege application role. The application never connects
-- as a superuser, so a flaw in the web tier cannot reach other databases on
-- the instance (SRS 7, Security).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- The role's password is NOT stored in this file.
--
-- It used to be, as a literal. That is a credential in version control the
-- moment the repository is pushed, and rotating it then means rotating it
-- everywhere it has already been copied to. It is asked for instead — either
-- passed in for automation:
--
--   psql -U postgres -h 127.0.0.1 -p 5433 -v app_password=... -f scripts/setup-database.sql
--
-- or typed at the prompt when it is not. Whichever you use, it must match the
-- password in DATABASE_URI in your .env.
--
-- `\if :{?app_password}` tests whether the variable was set, so passing it is
-- optional rather than required.
-- ---------------------------------------------------------------------------
\if :{?app_password}
\else
\prompt 'Password for the siws_app role: ' app_password
\endif

-- Created without a password first, then set below, so the two branches share
-- one code path. `format(..., %L)` quotes and escapes the value, so a password
-- containing a quote cannot terminate the statement early.
SELECT 'CREATE ROLE siws_app WITH LOGIN'
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'siws_app')
\gexec

SELECT format('ALTER ROLE siws_app WITH LOGIN PASSWORD %L', :'app_password')
\gexec

-- No ability to create further roles or databases.
ALTER ROLE siws_app NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;

-- The database, owned by the application role so Payload can manage its own
-- schema during development (`push: true`) and via migrations in production.
SELECT 'CREATE DATABASE siws OWNER siws_app ENCODING ''UTF8'''
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'siws')
\gexec

-- Revoke the implicit PUBLIC grant so only the owner may connect.
REVOKE ALL ON DATABASE siws FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE siws TO siws_app;

\connect siws

-- PUBLIC may not create objects in the public schema (Postgres 15+ default,
-- restated here so the setup is explicit and version-independent).
REVOKE ALL ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO siws_app;
GRANT ALL ON SCHEMA public TO siws_app;

\echo ''
\echo 'SIWS database ready: role siws_app, database siws.'
