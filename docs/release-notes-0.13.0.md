# TurboWarp Bubble 0.13.0

Bubble 0.13.0 replaces the deprecated optional
`@kubohiroya/turbowarp-asset-manager` peer with
`@kubohiroya/turbowarp-asset-cache@0.1.0`. The standalone adapter first resolves
`runtime.ext_kubohiroyaassetcache`; the legacy `ext_kubohiroyaassetmanager` lookup remains only as
a temporary runtime fallback for already-published projects.

## Migration

- Install Asset Cache 0.1.0 instead of Asset Manager.
- Replace the standalone extension ID `kubohiroyaassetmanager` with `kubohiroyaassetcache`.
- Composition hosts should inject Asset Cache's public DOM image capability as before.

## Rollback

Pin Bubble 0.12.0 and Asset Manager to the versions recorded by the existing project lockfile. Do
not rewrite already-published SB3 artifacts during rollback.
