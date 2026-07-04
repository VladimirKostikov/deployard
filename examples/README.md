# Examples

Runnable samples for local development and demos.

## kubernetes/

| File | Purpose |
|---|---|
| `kind-config.yaml` | kind cluster definition for local K8s |

## demo/

Full sample e-commerce stack (PostgreSQL + API + web) for dashboard testing.
See [demo/README.md](../demo/README.md).

## Usage

```bash
make cluster-up
make seed-demo
```
