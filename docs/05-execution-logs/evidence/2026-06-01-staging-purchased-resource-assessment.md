# Staging Purchased Resource Assessment Evidence

## Summary

- Result: draft for owner review.
- Scope: docs_only procurement assessment.
- Changed surfaces: task plan and evidence only.
- Forbidden scope (`forbiddenScope`): no cloud resource creation/change, no staging/prod connection, no deploy, no env/secret read/write, no DB operation, no real provider, no product code/script/test/dependency/schema/migration change.
- Residual gaps (`residualGaps`): owner still needs to purchase or configure database, object storage, domain/TLS/callback, monitoring/logging policy, backup/restore policy, and secret/env storage before staging dry run.

## Already Purchased Resource

Owner-provided screenshots record one purchased/prepared Tencent Cloud CVM resource:

| Item                 | Recorded value                                               |
| -------------------- | ------------------------------------------------------------ |
| Cloud product        | Tencent Cloud CVM cloud server                               |
| Purpose              | Tiku `staging` preview/acceptance Web server                 |
| Billing mode         | Subscription monthly package                                 |
| Purchase duration    | 3 months                                                     |
| Quantity             | 1                                                            |
| Region               | Nanjing                                                      |
| Availability zone    | Nanjing Zone 3                                               |
| Instance type        | `SA9.MEDIUM4`, standard SA9                                  |
| CPU / memory         | 2 vCPU / 4 GiB                                               |
| OS                   | Ubuntu Server 22.04 LTS 64-bit                               |
| Image                | Public image, image id shown in screenshot as `img-487zeit5` |
| System disk          | General SSD cloud disk, 80 GiB                               |
| Data disk            | Not configured                                               |
| VPC                  | `Default-VPC`, id shown in screenshot as `vpc-775kesj7`      |
| VPC CIDR             | `10.206.0.0/16`                                              |
| Subnet               | `Default-Subnet`                                             |
| Public IP            | Purchased/assigned                                           |
| Line type            | BGP                                                          |
| Bandwidth billing    | Package bandwidth                                            |
| Public bandwidth     | 3 Mbps                                                       |
| IPv6                 | Not assigned                                                 |
| Instance name        | `tiku-staging-web-01`                                        |
| Login method         | Password                                                     |
| Security group       | Custom template                                              |
| Security hardening   | Free enabled                                                 |
| Cloud monitor        | Free enabled                                                 |
| Automation assistant | Free enabled                                                 |
| Deletion protection  | Not enabled                                                  |
| CAM role             | Not set                                                      |
| Hostname             | Not set                                                      |
| Tags                 | `app = tiku`, `environment = staging`                        |
| Configuration fee    | CNY 708.60 / 3 months                                        |

## Suitability Assessment

| Area                       | Assessment                                                  | Notes                                                                                                                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web staging runtime        | Suitable for low-traffic owner preview                      | 2 vCPU / 4 GiB is enough for a single low-concurrency Next.js staging service, reverse proxy, and basic process manager.                                                                                                                              |
| Cost control               | Acceptable but not minimal                                  | CNY 708.60 / 3 months is reasonable for a persistent CVM, but lower-cost staging could use on-demand/stop-start or a smaller runtime if owner acceptance is intermittent. Since already purchased, use it rather than buying another app runtime now. |
| Network region             | Suitable if future DB/COS also use Nanjing or nearby region | Future PostgreSQL/COS should be in the same region/VPC when possible to reduce latency and avoid unnecessary public network exposure.                                                                                                                 |
| Public bandwidth           | Adequate for staging                                        | 3 Mbps is enough for admin/student smoke testing and small file upload/download. Avoid CDN and large media acceptance at this stage.                                                                                                                  |
| Disk                       | Adequate for app runtime only                               | 80 GiB system disk is enough for OS, app, logs, and deployment artifacts. Do not use it as the durable PostgreSQL data store for staging if managed DB is affordable.                                                                                 |
| Security group             | Needs confirmation before use                               | Inbound should allow TCP 22 only from trusted owner/admin IPs where possible, TCP 80, TCP 443. Do not open 3000, 5432, 3389, or broad ranges to the public internet.                                                                                  |
| Password login             | Usable but weaker than key-based or restricted SSH          | For staging, restrict SSH source IP and consider moving to key-based login or temporary password rotation before deployment. Do not record password.                                                                                                  |
| CAM role                   | Gap                                                         | Set a least-privilege CAM role only if the app needs Tencent Cloud API access. Otherwise keep unset and use server-side env/secret injection manually for initial staging.                                                                            |
| Deletion protection        | Optional                                                    | Can remain off for cost-control staging, but enable before owner acceptance if accidental deletion risk is high.                                                                                                                                      |
| Database requirement       | Not satisfied                                               | ADR-004/005 require isolated staging PostgreSQL/pgvector or equivalent. The CVM alone does not provide managed database backup/restore or drift-check boundaries.                                                                                     |
| Object storage requirement | Not satisfied                                               | ADR-004/005 require staging object storage bucket or strict `staging/` prefix.                                                                                                                                                                        |
| TLS/callback requirement   | Not satisfied                                               | Need staging domain/subdomain, TLS cert, and Better Auth callback/base URL.                                                                                                                                                                           |
| Monitoring/logging         | Partially satisfied                                         | Cloud Monitor is enabled for CVM metrics. Application logs, retention, alerting, and redaction policy still need setup.                                                                                                                               |

## Recommended Remaining Purchases Or Configuration

### P0 Required Before Staging Dry Run

| Resource                         | Recommended low-cost parameter                                                                                                                                                                 | Why                                                                                                          | Cost-control guidance                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Managed PostgreSQL with pgvector | TencentDB for PostgreSQL, same region as CVM if available, PostgreSQL 15/16, smallest practical spec such as 1-2 vCPU and 2-4 GiB memory, 20-50 GiB storage, automatic backup retention 7 days | Required by ADR-004/005 for isolated staging DB, migrations, Better Auth sessions, app data, and RAG vectors | Start with minimum spec; do not buy read replicas; do not buy multi-region; confirm pgvector support before purchase.      |
| COS object storage               | One private bucket in same region or strict `staging/` prefix; standard storage; no CDN                                                                                                        | Required for `paper_asset`, material/resource files, and future knowledge resources                          | Use pay-as-you-go first; do not buy CDN, media processing, lifecycle extras, or large resource packs until usage is known. |
| Domain and TLS                   | `staging.<domain>` DNS record to CVM public IP; free Tencent Cloud SSL cert for testing if available                                                                                           | Required for auth callback/base URL and HTTPS owner acceptance                                               | Use free 90-day SSL for staging; buy formal cert only for production or longer-lived public service.                       |
| Security group configuration     | Inbound: TCP 22 restricted to trusted IPs, TCP 80/443 open as needed. Outbound: allow required package/API access. Explicitly keep 3000, 5432, 3389 closed to public internet                  | Required before exposing staging                                                                             | No extra purchase. This is configuration.                                                                                  |
| Secret/env storage decision      | For first staging dry run, store secrets only in server/runtime env files outside Git or Tencent secret manager if available and approved                                                      | Required for `DATABASE_URL`, `BETTER_AUTH_SECRET`, storage credentials, app base URL                         | Do not buy a complex secret product unless needed. Use strict owner process and no evidence disclosure.                    |
| Backup/rollback policy           | Use TencentDB automatic backup 7 days plus manual backup before migration                                                                                                                      | Required for migration dry run                                                                               | Keep retention short for staging to avoid backup overage.                                                                  |

### P1 Recommended But Can Be Minimal

| Resource                         | Recommended low-cost parameter                                                        | Why                                                                                  | Cost-control guidance                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| CLS application log topic        | One logset/topic for staging app logs, retention 7 days, minimal indexes              | Useful for owner acceptance troubleshooting and evidence without SSH-only log checks | Start pay-as-you-go; delete log topic when no longer needed; avoid long retention and broad full-text indexing if not needed. |
| Basic alerting                   | Cloud Monitor alert for CVM CPU/memory/disk/bandwidth and DB health                   | Helps catch staging outage during acceptance                                         | Use built-in Cloud Monitor first; no paid APM/Prometheus needed.                                                              |
| Snapshot before risky deployment | CVM snapshot before major staging deployment if manual server setup becomes important | Fast rollback for server setup mistakes                                              | Use selectively; do not schedule frequent snapshots for staging unless needed.                                                |

### P2 Defer To Save Cost

| Resource                 | Recommendation          | Reason                                                                                              |
| ------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------- |
| CDN                      | Defer                   | 3 Mbps staging bandwidth is enough for owner validation; COS/CDN adds extra cost and config.        |
| WAF                      | Defer                   | For staging, security group + HTTPS + non-public admin policy is enough. Revisit before production. |
| Load balancer            | Defer                   | Single CVM staging does not need CLB unless testing HA or zero-downtime deploy.                     |
| Redis                    | Defer                   | Current architecture does not require it for staging MVP.                                           |
| Read replica             | Defer                   | Staging read load is low.                                                                           |
| Real AI provider quota   | Keep blocked by default | Real-provider redaction approval remains required. Continue mock-only unless explicitly approved.   |
| Separate vector database | Defer                   | PostgreSQL + pgvector is the selected lower-cost architecture.                                      |

## Immediate Purchase Checklist For Owner

1. PostgreSQL: buy or select the smallest managed TencentDB PostgreSQL instance that supports pgvector, same region/VPC as CVM if possible.
2. COS: create private staging bucket or decide strict `staging/` prefix.
3. Domain/TLS: prepare `staging.<domain>` and free SSL cert for testing.
4. Security group: confirm TCP 22, 80, 443 only; restrict SSH source where possible.
5. Monitoring: use built-in Cloud Monitor; optionally create short-retention CLS topic.
6. Backups: keep DB automatic backups at 7 days and plan manual backup before migration.

## Budget Estimate

Existing purchased CVM cost is recorded as CNY 708.60 for 3 months. The estimate below covers supplemental staging resources only and should be confirmed in the Tencent Cloud console at purchase time.

| Resource                         | Cost-controlled parameter                                                                                                           | 3-month budget estimate |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------: |
| Managed PostgreSQL with pgvector | Same region/VPC when possible; PostgreSQL 15/16; smallest practical instance such as 1-2 vCPU and 2-4 GiB memory; 20-50 GiB storage |           CNY 900-1,800 |
| COS object storage               | Private bucket or strict `staging/` prefix; standard storage; pay-as-you-go                                                         |                CNY 0-50 |
| Domain/TLS                       | `staging.<domain>`; free 90-day SSL certificate where available                                                                     |               CNY 0-100 |
| CLS logs                         | Optional single staging log topic; 7-day retention; minimal indexes                                                                 |               CNY 0-150 |
| Cloud Monitor alerts             | Basic CVM/DB metrics and alerts                                                                                                     |                   CNY 0 |
| CVM snapshot or rollback point   | Occasional snapshot before risky staging setup                                                                                      |                CNY 0-50 |
| Contingency                      | Price variance, accidental traffic, backup/log overage                                                                              |             CNY 300-800 |

Recommended supplemental budget: prepare CNY 2,000-3,000, with first purchase target around CNY 1,500-2,200 if PostgreSQL minimum spec and pay-as-you-go COS/logs are sufficient.

| Scenario                                                                 | Supplemental budget | Total including purchased CVM |
| ------------------------------------------------------------------------ | ------------------: | ----------------------------: |
| Ultra-low demo, not recommended: run DB on CVM                           |         CNY 100-300 |                 CNY 800-1,000 |
| Recommended cost-controlled staging: managed PostgreSQL + COS + free TLS |     CNY 1,500-2,200 |               CNY 2,200-2,900 |
| Safer staging buffer: larger DB + COS + CLS + snapshot buffer            |     CNY 2,300-3,000 |               CNY 3,000-3,700 |

## Official References Checked

- Tencent Cloud CVM billing supports subscription and pay-as-you-go modes; subscription is generally suited to stable usage.
- Tencent Cloud CVM security groups govern inbound/outbound access and should explicitly allow only required ports.
- TencentDB for PostgreSQL purchase guidance recommends same-region deployment with connected CVM for lowest latency.
- TencentDB for PostgreSQL supports backup configuration and documented PostgreSQL + pgvector scenarios.
- COS default billing is pay-as-you-go, with charges based on actual storage, requests, traffic, and management features.
- Tencent Cloud Monitor is automatically available for cloud resources and can provide free short-term metric visibility.
- Tencent Cloud free SSL certificates are 90-day certificates intended for testing-stage HTTPS.

## Evidence Hygiene

No password, secret, database URL, provider payload, raw prompt, raw student answer, raw model response, plaintext `redeem_code`, access key, private customer content, or cloud console credential was recorded.
