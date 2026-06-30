# TaskFlow — Scalability Architecture Notes

This document outlines the architectural strategies for scaling TaskFlow from a single-server deployment to a distributed, enterprise-grade system.

---

## 1. Horizontal Scaling

**Current state:** Single Node.js process.

**Scale-out approach:**
- Deploy multiple backend instances behind a **load balancer** (NGINX / AWS ALB / Cloudflare).
- Node.js is stateless by design — JWT tokens carry all session state, so any instance can handle any request.
- Use **PM2 cluster mode** for multi-core utilisation on a single VM: `pm2 start dist/server.js -i max`.
- In Kubernetes: define a `Deployment` with `replicas: N` and a `HorizontalPodAutoscaler` targeting CPU/RPS thresholds.

```
Internet → Load Balancer → [API-1] [API-2] [API-3] → PostgreSQL (primary)
                                                    → Redis cluster
```

---

## 2. Load Balancing

- **NGINX** upstream block with `least_conn` or `ip_hash` for session affinity.
- **AWS ALB** target groups with health-check against `/api/v1/health`.
- **Sticky sessions NOT needed** because JWT is stateless.
- Enable HTTP/2 and keep-alive for better throughput.

---

## 3. Database Scaling

### Read Replicas
- Add PostgreSQL read replicas. Route all `GET` queries through Prisma's read replica URL:
  ```ts
  const prisma = new PrismaClient({
    datasources: { db: { url: READ_REPLICA_URL } }
  });
  ```
- Write operations stay on the primary.

### Connection Pooling
- Use **PgBouncer** (transaction pooling) to handle thousands of concurrent connections without exhausting PostgreSQL's `max_connections`.
- Alternatively, configure Prisma `connection_limit` and `pool_timeout`.

### Indexing Strategy
Current indexes in schema:
- `users.email` (unique lookup)
- `tasks.createdById` (owner filter)
- `tasks.status`, `tasks.priority`, `tasks.createdAt` (filter & sort)

Add composite indexes for high-cardinality filter combinations:
```sql
CREATE INDEX idx_tasks_user_status ON tasks("createdById", status);
CREATE INDEX idx_tasks_user_priority ON tasks("createdById", priority);
```

### Sharding (future)
- Shard by `userId` using **Citus** (PostgreSQL extension) or migrate to **CockroachDB** for geo-distributed writes.

---

## 4. Redis Caching Strategy

The codebase includes a `REDIS_ENABLED` toggle. When enabled:

### Cache Patterns
| Route              | Cache Key                        | TTL   | Invalidation                  |
|--------------------|----------------------------------|-------|-------------------------------|
| `GET /tasks`       | `tasks:user:{userId}:filters:{}` | 60s   | On create/update/delete task  |
| `GET /tasks/:id`   | `task:{id}`                      | 120s  | On update/delete              |
| `GET /auth/profile`| `user:{userId}`                  | 300s  | On profile update             |

### Implementation Sketch
```ts
// Cache-aside pattern
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await repo.findAll(...);
await redis.setex(cacheKey, ttl, JSON.stringify(data));
return data;
```

### Rate Limiting with Redis
Replace in-memory `express-rate-limit` store with `rate-limit-redis` for distributed rate limiting across all instances.

---

## 5. Queue Systems

For async workloads (email notifications, bulk exports, webhooks):

- **BullMQ** (Redis-backed) for job queues.
- **Architecture:**
  ```
  API → Redis Queue → Worker Processes
  ```
- Jobs: `send-notification`, `export-tasks-csv`, `cleanup-deleted-records`.
- Worker pods scale independently from API pods.

---

## 6. Microservices Migration Path

Current monolith modules map cleanly to microservices:

| Current Module   | Future Microservice          | Transport     |
|------------------|------------------------------|---------------|
| `auth`           | Auth Service                 | REST / gRPC   |
| `task`           | Task Service                 | REST          |
| `user`           | User Service                 | REST          |
| Notifications    | Notification Service         | Message Queue |

**Strangler Fig Pattern:** Extract one module at a time behind an API gateway (Kong / AWS API Gateway), gradually migrating traffic.

---

## 7. Logging & Monitoring

### Current
- Winston structured JSON logging → `logs/combined.log` + `logs/error.log`
- Request ID tracing via `X-Request-ID` header

### Production Stack
- **Log aggregation:** Ship JSON logs to **Datadog** / **Elastic Stack (ELK)** / **AWS CloudWatch Logs**.
- **APM:** **Datadog APM** or **New Relic** for distributed tracing.
- **Metrics:** Expose `/metrics` endpoint (Prometheus format) → scrape with **Prometheus** → visualise in **Grafana**.
- **Alerting:** PagerDuty integration for error rate spikes, latency p99 > threshold.
- **Uptime:** **Pingdom** or **Better Uptime** on `/api/v1/health`.

---

## 8. CI/CD Pipeline

### GitHub Actions Workflow
```
Push to main →
  lint + typecheck →
  unit tests (Jest) →
  integration tests →
  Docker build →
  push to ECR / GHCR →
  deploy to staging →
  smoke tests →
  deploy to production (manual approval)
```

### Key Steps
1. **Lint & Type Check:** `npm run lint && tsc --noEmit`
2. **Tests:** `npm test -- --coverage`
3. **Build Docker image:** multi-stage Dockerfile
4. **Database migration:** `prisma migrate deploy` as a Kubernetes Job pre-deploy
5. **Blue/Green deployment:** zero-downtime via ALB target group swap

---

## 9. Security at Scale

- **Secrets Manager:** AWS Secrets Manager / HashiCorp Vault — never store secrets in env files in production.
- **mTLS** between internal microservices.
- **WAF** (Web Application Firewall) in front of the load balancer.
- **DDoS protection:** Cloudflare or AWS Shield.
- **Dependency scanning:** `npm audit` in CI, Dependabot for automated PRs.

---

## Summary

| Concern              | Solution                                  |
|----------------------|-------------------------------------------|
| Horizontal scaling   | Stateless JWT + load balancer + k8s HPA   |
| DB bottleneck        | Read replicas + PgBouncer + indexes       |
| Caching              | Redis cache-aside (toggle ready)          |
| Async tasks          | BullMQ job queues                         |
| Observability        | Winston + Prometheus + Grafana + APM      |
| CI/CD                | GitHub Actions + Docker + k8s             |
| Microservices        | Strangler Fig pattern per module          |
