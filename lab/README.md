# lab/ — Lab demo Docker Compose

Dikerjakan di Fase 1a. Topologi (PRD bagian 12 + keputusan A1):

| Service | Isi | Jaringan |
|---|---|---|
| `sentra-core` | Laravel + queue worker + scheduler + Reverb | net-pusat |
| `mysql` | Database Core | net-pusat |
| `ollama` | LLM lokal (opsional) | net-pusat |
| `kodim-a` | nginx + portal dummy PHP + sshd + agent | net-wan, net-kodim-a, net-pusat |
| `kodim-b` | sama dengan kodim-a, satuan berbeda | net-wan, net-pusat |
| `plc-sim` | Server Modbus TCP simulasi + agent sensor OT | net-wan, net-kodim-a, net-pusat |
| `attacker` | nmap, hydra, sqlmap, curl, klien Modbus | **hanya net-wan, satu IP tetap** |

Portal dummy berlabel **LINGKUNGAN LATIHAN** dan tidak boleh dipasang di internet.
