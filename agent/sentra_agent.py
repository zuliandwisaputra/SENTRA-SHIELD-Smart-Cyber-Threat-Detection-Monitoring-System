#!/usr/bin/env python3
"""SENTRA Agent — sensor ringan SENTRA SHIELD untuk host satuan.

Zero dependency: hanya pustaka standar Python 3.10+.

Tugas (PRD FR-02, bagian 9):
  * membaca telemetri: log web (nginx/apache combined), log SSH, firewall
    (nftables NFLOG), integritas file (FIM), dan lalu lintas Modbus TCP;
  * menormalkan tiap kejadian ke skema event dan mengirimnya ke Core secara
    batch tiap 1 detik (maks 500 event per permintaan);
  * menahan event di antrean lokal SQLite (maks 10.000 baris) saat Core tidak
    bisa dihubungi, lalu mengirim ulang;
  * mengirim heartbeat tiap 10 detik;
  * mengambil perintah yang sudah disetujui tiap 3 detik dan HANYA menjalankan
    jenis dari daftar tetap: block_ip, unblock_ip, run_test. Tidak ada
    eksekusi perintah bebas; semua pemanggilan nft memakai argumen tetap.
"""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import hashlib
import ipaddress
import json
import logging
import os
import re
import signal
import socket
import sqlite3
import ssl
import struct
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

VERSION = "0.1.0"
LOG = logging.getLogger("sentra-agent")

ALLOWED_COMMANDS = ("block_ip", "unblock_ip", "run_test")
NFT_TABLE = "sentra"
NFT_BIN = "nft"

DEFAULT_CONFIG = {
    "core_url": "https://sentra-core",
    "ca_file": None,
    "enrollment_code": None,
    "state_dir": "/var/lib/sentra-agent",
    "hostname": None,
    "heartbeat_interval_s": 10,
    "batch_interval_s": 1,
    "command_poll_s": 3,
    "max_batch": 500,
    "queue_max": 10000,
    "http_timeout_s": 10,
    "sources": {
        "web": {"enabled": True, "path": "/var/log/nginx/access.log"},
        "ssh": {"enabled": True, "path": "/var/log/auth.log"},
        "firewall": {"enabled": True, "nflog_group": 7, "manage_nftables": True, "log_rate_per_s": 400},
        "fim": {"enabled": True, "paths": ["/var/www/html"], "interval_s": 2, "max_sample_bytes": 4096},
        "modbus": {"enabled": False, "port": 502},
    },
    "blocking": {"enabled": True, "min_duration_s": 60, "max_duration_s": 86400},
}


def utc_now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds")


def deep_merge(base: dict, override: dict) -> dict:
    out = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = value
    return out


def load_config(path: str) -> dict:
    with open(path, encoding="utf-8") as fh:
        cfg = deep_merge(DEFAULT_CONFIG, json.load(fh))
    parsed = urllib.parse.urlparse(cfg["core_url"])
    if parsed.scheme == "http" and parsed.hostname not in ("127.0.0.1", "localhost"):
        raise ValueError("core_url harus HTTPS (http hanya untuk localhost saat pengujian)")
    if parsed.scheme not in ("http", "https"):
        raise ValueError("core_url tidak valid")
    return cfg


# --------------------------------------------------------------------------
# Antrean lokal
# --------------------------------------------------------------------------
class EventQueue:
    """Antrean event persisten (SQLite). Bila penuh, event tertua dibuang."""

    def __init__(self, path: str, max_rows: int = 10000):
        self.max_rows = max_rows
        self.dropped = 0
        self._lock = threading.Lock()
        self._db = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
        self._db.execute("PRAGMA journal_mode=WAL")
        self._db.execute("CREATE TABLE IF NOT EXISTS q (id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT NOT NULL)")

    def put(self, event: dict) -> None:
        body = json.dumps(event, separators=(",", ":"), ensure_ascii=False)
        with self._lock:
            self._db.execute("INSERT INTO q (body) VALUES (?)", (body,))
            excess = self._count() - self.max_rows
            if excess > 0:
                self._db.execute("DELETE FROM q WHERE id IN (SELECT id FROM q ORDER BY id LIMIT ?)", (excess,))
                self.dropped += excess

    def peek(self, limit: int) -> list[tuple[int, dict]]:
        with self._lock:
            rows = self._db.execute("SELECT id, body FROM q ORDER BY id LIMIT ?", (limit,)).fetchall()
        return [(row_id, json.loads(body)) for row_id, body in rows]

    def ack(self, ids: list[int]) -> None:
        if not ids:
            return
        with self._lock:
            self._db.executemany("DELETE FROM q WHERE id = ?", [(i,) for i in ids])

    def size(self) -> int:
        with self._lock:
            return self._count()

    def _count(self) -> int:
        return self._db.execute("SELECT COUNT(*) FROM q").fetchone()[0]


# --------------------------------------------------------------------------
# Klien Core
# --------------------------------------------------------------------------
class CoreError(Exception):
    def __init__(self, status: int, message: str, retry_after: float | None = None):
        super().__init__(f"HTTP {status}: {message}")
        self.status = status
        self.retry_after = retry_after


class CoreClient:
    def __init__(self, base_url: str, ca_file: str | None, timeout: float = 10):
        self.base = base_url.rstrip("/") + "/api/v1/agent"
        self.timeout = timeout
        self.token: str | None = None
        self.ctx = ssl.create_default_context(cafile=ca_file) if base_url.startswith("https") else None

    def request(self, method: str, path: str, body: dict | None = None, auth: bool = True) -> dict:
        data = None if body is None else json.dumps(body, separators=(",", ":")).encode()
        req = urllib.request.Request(self.base + path, data=data, method=method)
        req.add_header("Accept", "application/json")
        req.add_header("User-Agent", f"sentra-agent/{VERSION}")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        if auth and self.token:
            req.add_header("Authorization", f"Bearer {self.token}")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout, context=self.ctx) as resp:
                raw = resp.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            message = exc.read().decode(errors="replace")[:300]
            retry = exc.headers.get("Retry-After") if exc.headers else None
            raise CoreError(exc.code, message, float(retry) if retry and retry.isdigit() else None) from None
        except (urllib.error.URLError, OSError, TimeoutError) as exc:
            raise CoreError(0, str(exc)) from None


# --------------------------------------------------------------------------
# Pembaca file log (tail -F)
# --------------------------------------------------------------------------
class FileTailer:
    """Mengikuti file log; tahan rotasi (inode berubah) dan truncate.
    Saat pertama kali, mulai dari akhir file agar log lama tidak diputar ulang."""

    def __init__(self, path: str):
        self.path = path
        self._fh = None
        self._inode = None
        self._buf = ""
        self.exists = False

    def _open(self, from_start: bool) -> bool:
        try:
            fh = open(self.path, encoding="utf-8", errors="replace")
        except OSError:
            self.exists = False
            return False
        st = os.fstat(fh.fileno())
        if not from_start:
            fh.seek(0, os.SEEK_END)
        self._fh, self._inode, self.exists = fh, st.st_ino, True
        return True

    def read_lines(self) -> list[str]:
        if self._fh is None and not self._open(from_start=self._inode is not None):
            return []
        lines = self._drain()
        try:
            st = os.stat(self.path)
            rotated = st.st_ino != self._inode
            truncated = st.st_size < self._fh.tell()
        except OSError:
            rotated, truncated = True, False
        if rotated:
            self._fh.close()
            self._fh = None
            if self._open(from_start=True):
                lines += self._drain()
        elif truncated:
            self._fh.seek(0)
        return lines

    def _drain(self) -> list[str]:
        chunk = self._fh.read()
        if not chunk:
            return []
        self._buf += chunk
        *complete, self._buf = self._buf.split("\n")
        return [line for line in complete if line.strip()]


# --------------------------------------------------------------------------
# Parser
# --------------------------------------------------------------------------
WEB_RE = re.compile(
    r'^(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<request>[^"]*)" (?P<status>\d{3}) (?P<bytes>\S+)'
    r'(?: "(?P<referer>[^"]*)" "(?P<ua>[^"]*)")?(?: "(?P<marker>[^"]*)")?'
)


def parse_web_line(line: str) -> dict | None:
    """Log akses nginx/apache format combined (opsional + satu field penanda)."""
    m = WEB_RE.match(line)
    if not m:
        return None
    parts = m.group("request").split(" ")
    method, target, protocol = (parts + ["", "", ""])[:3] if len(parts) >= 2 else ("", m.group("request"), "")
    path, _, query = target.partition("?")
    try:
        occurred = dt.datetime.strptime(m.group("time"), "%d/%b/%Y:%H:%M:%S %z").isoformat()
    except ValueError:
        occurred = utc_now_iso()
    size = m.group("bytes")
    return {
        "source": "web",
        "occurred_at": occurred,
        "src_ip": _valid_ip(m.group("ip")),
        "dst_port": None,
        "payload": {
            "method": method,
            "path": path,
            "query": query,
            "protocol": protocol,
            "status": int(m.group("status")),
            "bytes": int(size) if size.isdigit() else 0,
            "referer": m.group("referer") or "",
            "user_agent": m.group("ua") or "",
        },
        "raw": line[:8192],
        "is_test": False,
    }


SSH_FAILED_RE = re.compile(
    r"Failed (?P<method>password|publickey|keyboard-interactive/pam|none) for (?P<invalid>invalid user )?(?P<user>\S+) from (?P<ip>\S+) port (?P<port>\d+)"
)
SSH_ACCEPTED_RE = re.compile(
    r"Accepted (?P<method>password|publickey|keyboard-interactive/pam) for (?P<user>\S+) from (?P<ip>\S+) port (?P<port>\d+)"
)
ISO_PREFIX_RE = re.compile(r"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)")


def parse_ssh_line(line: str) -> dict | None:
    """Log autentikasi OpenSSH (auth.log, journal, atau sshd -E)."""
    m = SSH_FAILED_RE.search(line)
    outcome = "failed"
    if not m:
        m = SSH_ACCEPTED_RE.search(line)
        outcome = "success"
    if not m:
        return None
    iso = ISO_PREFIX_RE.match(line)
    return {
        "source": "ssh",
        "occurred_at": iso.group(1) if iso else utc_now_iso(),
        "src_ip": _valid_ip(m.group("ip")),
        "dst_port": 22,
        "payload": {
            "outcome": outcome,
            "user": m.group("user"),
            "method": m.group("method"),
            "invalid_user": bool(m.groupdict().get("invalid")),
            "src_port": int(m.group("port")),
        },
        "raw": line[:8192],
        "is_test": False,
    }


def parse_ipv4(packet: bytes) -> dict | None:
    """Header IPv4 + port TCP/UDP. Mengembalikan offset payload L4 untuk TCP."""
    if len(packet) < 20 or packet[0] >> 4 != 4:
        return None
    ihl = (packet[0] & 0x0F) * 4
    proto = packet[9]
    info = {
        "src_ip": socket.inet_ntoa(packet[12:16]),
        "dst_ip": socket.inet_ntoa(packet[16:20]),
        "protocol": {6: "tcp", 17: "udp"}.get(proto, str(proto)),
    }
    if proto in (6, 17) and len(packet) >= ihl + 4:
        info["src_port"], info["dst_port"] = struct.unpack_from("!HH", packet, ihl)
    if proto == 6 and len(packet) >= ihl + 20:
        info["tcp_seq"] = struct.unpack_from("!I", packet, ihl + 4)[0]
        info["l4_payload_offset"] = ihl + (packet[ihl + 12] >> 4) * 4
    return info


MODBUS_WRITE_FUNCTIONS = {
    5: "Write Single Coil",
    6: "Write Single Register",
    15: "Write Multiple Coils",
    16: "Write Multiple Registers",
}


def parse_modbus_write(pdu: bytes) -> dict | None:
    """Frame Modbus TCP (MBAP + PDU). Hanya perintah tulis (FC 5, 6, 15, 16)."""
    if len(pdu) < 8:
        return None
    tid, pid, length, unit_id, fc = struct.unpack_from("!HHHBB", pdu, 0)
    if pid != 0 or fc not in MODBUS_WRITE_FUNCTIONS:
        return None
    info = {"transaction_id": tid, "unit_id": unit_id, "function_code": fc, "function_name": MODBUS_WRITE_FUNCTIONS[fc]}
    body = pdu[8:]
    if fc in (5, 6) and len(body) >= 4:
        info["address"], info["value"] = struct.unpack_from("!HH", body, 0)
        if fc == 5:
            info["value"] = 1 if info["value"] == 0xFF00 else 0
    elif fc in (15, 16) and len(body) >= 4:
        info["address"], info["quantity"] = struct.unpack_from("!HH", body, 0)
        if fc == 16 and len(body) >= 5:
            count = min(body[4] // 2, 16)
            info["values"] = list(struct.unpack_from(f"!{count}H", body, 5)) if len(body) >= 5 + count * 2 else []
    return info


def _valid_ip(value: str | None) -> str | None:
    try:
        return str(ipaddress.ip_address(value)) if value else None
    except ValueError:
        return None


# --------------------------------------------------------------------------
# nftables
# --------------------------------------------------------------------------
class Nft:
    """Semua perintah nft memakai daftar argumen tetap atau skrip yang disusun
    dari nilai tervalidasi (IP lewat modul ipaddress, angka lewat int)."""

    def __init__(self, runner=None):
        self.run = runner or self._run

    @staticmethod
    def _run(args: list[str], stdin: str | None = None) -> tuple[int, str]:
        proc = subprocess.run(args, input=stdin, capture_output=True, text=True, timeout=10, check=False)
        return proc.returncode, (proc.stdout + proc.stderr).strip()

    def ensure_ruleset(self, nflog_group: int, rate_per_s: int) -> tuple[int, str]:
        # Tabel dan set hanya ditambahkan bila belum ada; chain di-flush lalu
        # diisi ulang. Elemen blokir yang masih aktif tetap bertahan saat agent restart.
        script = f"""
table inet {NFT_TABLE} {{
    set blocklist4 {{ type ipv4_addr; flags timeout; }}
    set blocklist6 {{ type ipv6_addr; flags timeout; }}
    set open_tcp {{ type inet_service; }}
    chain input {{ type filter hook input priority -10; policy accept; }}
}}
flush chain inet {NFT_TABLE} input
table inet {NFT_TABLE} {{
    chain input {{
        ip saddr @blocklist4 counter drop
        ip6 saddr @blocklist6 counter drop
        iif "lo" accept
        ct state established,related accept
        tcp flags & (syn | ack) == syn tcp dport != @open_tcp limit rate {int(rate_per_s)}/second burst {int(rate_per_s) * 2} packets log group {int(nflog_group)} prefix "SENTRA_CLOSED"
    }}
}}
"""
        return self.run([NFT_BIN, "-f", "-"], script)

    def set_open_ports(self, ports: set[int]) -> tuple[int, str]:
        lines = [f"flush set inet {NFT_TABLE} open_tcp"]
        if ports:
            lines.append(f"add element inet {NFT_TABLE} open_tcp {{ {', '.join(str(int(p)) for p in sorted(ports))} }}")
        return self.run([NFT_BIN, "-f", "-"], "\n".join(lines) + "\n")

    def block(self, ip: ipaddress._BaseAddress, duration_s: int) -> tuple[int, str]:
        set_name = "blocklist4" if ip.version == 4 else "blocklist6"
        # Hapus dulu (abaikan bila belum ada) agar durasi diperbarui.
        self.run([NFT_BIN, "delete", "element", "inet", NFT_TABLE, set_name, "{", str(ip), "}"])
        return self.run([NFT_BIN, "add", "element", "inet", NFT_TABLE, set_name, "{", str(ip), "timeout", f"{int(duration_s)}s", "}"])

    def unblock(self, ip: ipaddress._BaseAddress) -> tuple[int, str]:
        set_name = "blocklist4" if ip.version == 4 else "blocklist6"
        return self.run([NFT_BIN, "delete", "element", "inet", NFT_TABLE, set_name, "{", str(ip), "}"])


def listening_tcp_ports() -> set[int]:
    ports: set[int] = set()
    for path in ("/proc/net/tcp", "/proc/net/tcp6"):
        try:
            with open(path, encoding="ascii") as fh:
                next(fh, None)
                for line in fh:
                    fields = line.split()
                    if len(fields) > 3 and fields[3] == "0A":  # TCP_LISTEN
                        ports.add(int(fields[1].rsplit(":", 1)[1], 16))
        except OSError:
            continue
    return ports


# --------------------------------------------------------------------------
# NFLOG (netlink, pustaka standar) — lihat lab/spike/nftables
# --------------------------------------------------------------------------
NETLINK_NETFILTER = 12
NFNL_SUBSYS_ULOG = 4


def _nl_align(n: int) -> int:
    return (n + 3) & ~3


def _nl_attr(atype: int, data: bytes) -> bytes:
    length = 4 + len(data)
    return struct.pack("=HH", length, atype) + data + b"\0" * (_nl_align(length) - length)


def _nflog_config(seq: int, family: int, group: int, attrs: bytes) -> bytes:
    body = struct.pack("=BBH", family, 0, socket.htons(group)) + attrs
    return struct.pack("=IHHII", 16 + len(body), (NFNL_SUBSYS_ULOG << 8) | 1, 0x1 | 0x4, seq, 0) + body


def open_nflog(group: int) -> socket.socket:
    sock = socket.socket(socket.AF_NETLINK, socket.SOCK_RAW, NETLINK_NETFILTER)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 4 * 1024 * 1024)
    sock.bind((0, 0))
    sock.send(_nflog_config(1, socket.AF_UNSPEC, group, _nl_attr(1, b"\x01\0\0\0")))  # BIND
    _nflog_ack(sock, "bind")
    sock.send(_nflog_config(2, socket.AF_UNSPEC, group, _nl_attr(2, struct.pack(">IBB", 128, 2, 0) + b"\0\0")))
    _nflog_ack(sock, "mode")
    return sock


def _nflog_ack(sock: socket.socket, what: str) -> None:
    data = sock.recv(4096)
    _length, mtype = struct.unpack_from("=IH", data, 0)
    if mtype == 2:  # NLMSG_ERROR
        (err,) = struct.unpack_from("=i", data, 16)
        if err:
            raise OSError(-err, f"NFLOG {what} gagal")


def parse_nflog_messages(data: bytes) -> list[dict]:
    out = []
    offset = 0
    while offset + 16 <= len(data):
        length, mtype = struct.unpack_from("=IH", data, offset)
        if length < 16:
            break
        if mtype == (NFNL_SUBSYS_ULOG << 8):
            attrs = data[offset + 20: offset + length]
            pos, pkt = 0, {"prefix": None, "packet": None}
            while pos + 4 <= len(attrs):
                alen, atype = struct.unpack_from("=HH", attrs, pos)
                if alen < 4:
                    break
                value = attrs[pos + 4: pos + alen]
                atype &= 0x3FFF
                if atype == 10:
                    pkt["prefix"] = value.rstrip(b"\0").decode(errors="replace")
                elif atype == 9:
                    pkt["packet"] = parse_ipv4(value)
                pos += _nl_align(alen)
            out.append(pkt)
        offset += _nl_align(length)
    return out


# --------------------------------------------------------------------------
# Collector
# --------------------------------------------------------------------------
class Collector(threading.Thread):
    name_key = "base"

    def __init__(self, agent: "Agent", cfg: dict):
        super().__init__(daemon=True, name=f"collector-{self.name_key}")
        self.agent = agent
        self.cfg = cfg
        self.state = "ok"
        self.detail = ""
        self.last_event_at: str | None = None

    def emit(self, event: dict) -> None:
        self.agent.queue.put(event)
        self.last_event_at = utc_now_iso()

    def status(self) -> dict:
        return {"status": self.state, "detail": self.detail[:250], "last_event_at": self.last_event_at}

    def run(self) -> None:
        while not self.agent.stopping.is_set():
            try:
                self.loop()
            except Exception as exc:  # collector tidak boleh mematikan agent
                self.state, self.detail = "error", f"{type(exc).__name__}: {exc}"
                LOG.exception("collector %s error", self.name_key)
                self.agent.stopping.wait(5)

    def loop(self) -> None:
        raise NotImplementedError


class LogCollector(Collector):
    parser = staticmethod(lambda line: None)

    def loop(self) -> None:
        tailer = FileTailer(self.cfg["path"])
        while not self.agent.stopping.is_set():
            for line in tailer.read_lines():
                event = self.parser(line)
                if event:
                    self.emit(event)
            if tailer.exists:
                self.state, self.detail = "ok", self.cfg["path"]
            else:
                self.state, self.detail = "missing", f"{self.cfg['path']} tidak ditemukan"
            self.agent.stopping.wait(0.25)


class WebCollector(LogCollector):
    name_key = "web"
    parser = staticmethod(parse_web_line)


class SshCollector(LogCollector):
    name_key = "ssh"
    parser = staticmethod(parse_ssh_line)


class FirewallCollector(Collector):
    name_key = "firewall"

    def loop(self) -> None:
        nft = self.agent.nft
        if self.cfg.get("manage_nftables", True):
            code, out = nft.ensure_ruleset(self.cfg["nflog_group"], self.cfg.get("log_rate_per_s", 400))
            if code != 0:
                raise RuntimeError(f"gagal memasang ruleset nftables: {out}")
            refresher = threading.Thread(target=self._refresh_open_ports, daemon=True, name="nft-open-ports")
            refresher.start()
        sock = open_nflog(int(self.cfg["nflog_group"]))
        sock.settimeout(1.0)
        self.state, self.detail = "ok", f"nflog group {self.cfg['nflog_group']}"
        while not self.agent.stopping.is_set():
            try:
                data = sock.recv(65536)
            except socket.timeout:
                continue
            except OSError as exc:  # ENOBUFS: sebagian paket terlewat
                self.detail = f"nflog: {exc}"
                continue
            for pkt in parse_nflog_messages(data):
                info = pkt["packet"]
                if not info or "dst_port" not in info:
                    continue
                self.emit({
                    "source": "firewall",
                    "occurred_at": utc_now_iso(),
                    "src_ip": info["src_ip"],
                    "dst_port": info["dst_port"],
                    "payload": {
                        "action": "port_tertutup",
                        "protocol": info["protocol"],
                        "src_port": info.get("src_port"),
                        "dst_ip": info["dst_ip"],
                        "prefix": pkt["prefix"],
                    },
                    "raw": f"{pkt['prefix']} {info['protocol']} {info['src_ip']}:{info.get('src_port')} -> {info['dst_ip']}:{info['dst_port']}",
                    "is_test": False,
                })

    def _refresh_open_ports(self) -> None:
        last: set[int] | None = None
        while not self.agent.stopping.is_set():
            ports = listening_tcp_ports()
            if ports != last:
                code, out = self.agent.nft.set_open_ports(ports)
                if code == 0:
                    last = ports
                else:
                    LOG.warning("gagal memperbarui open_tcp: %s", out)
            self.agent.stopping.wait(10)


TEXT_EXTENSIONS = (".php", ".phtml", ".php5", ".inc", ".html", ".htm", ".js", ".txt", ".sh", ".py")


class FimCollector(Collector):
    """File Integrity Monitoring dengan pemindaian berkala (tanpa inotify)."""

    name_key = "fim"
    MAX_FILES = 20000
    MAX_HASH_BYTES = 5 * 1024 * 1024

    def loop(self) -> None:
        baseline = self.scan()
        self.state, self.detail = "ok", ", ".join(self.cfg["paths"])
        while not self.agent.stopping.wait(float(self.cfg.get("interval_s", 2))):
            current = self.scan()
            for event in self.diff(baseline, current):
                self.emit(event)
            baseline = current

    def scan(self) -> dict[str, tuple[int, int, int]]:
        files: dict[str, tuple[int, int, int]] = {}
        for root_path in self.cfg["paths"]:
            for root, _dirs, names in os.walk(root_path):
                for name in names:
                    path = os.path.join(root, name)
                    try:
                        st = os.lstat(path)
                    except OSError:
                        continue
                    files[path] = (st.st_mtime_ns, st.st_size, st.st_ino)
                    if len(files) >= self.MAX_FILES:
                        return files
        return files

    def diff(self, old: dict, new: dict) -> list[dict]:
        events = []
        for path in new.keys() - old.keys():
            events.append(self._event(path, "created"))
        for path in old.keys() - new.keys():
            events.append(self._event(path, "deleted"))
        for path in new.keys() & old.keys():
            if new[path] != old[path]:
                events.append(self._event(path, "modified"))
        return events

    def _event(self, path: str, change: str) -> dict:
        payload = {"path": path, "change": change, "sha256": None, "size": None}
        if change != "deleted":
            try:
                st = os.stat(path)
                payload["size"] = st.st_size
                if st.st_size <= self.MAX_HASH_BYTES:
                    with open(path, "rb") as fh:
                        content = fh.read()
                    payload["sha256"] = hashlib.sha256(content).hexdigest()
                    if path.lower().endswith(TEXT_EXTENSIONS):
                        payload["sample"] = content[: int(self.cfg.get("max_sample_bytes", 4096))].decode("utf-8", errors="replace")
            except OSError as exc:
                payload["error"] = str(exc)
        return {
            "source": "fim",
            "occurred_at": utc_now_iso(),
            "src_ip": None,
            "dst_port": None,
            "payload": payload,
            "raw": f"{change} {path}",
            "is_test": False,
        }


class ModbusCollector(Collector):
    """Sensor Modbus pasif: mengendus TCP/502 dengan raw socket (AF_PACKET)."""

    name_key = "modbus"
    ETH_P_IP = 0x0800
    PACKET_OUTGOING = 4

    def loop(self) -> None:
        port = int(self.cfg.get("port", 502))
        sock = socket.socket(socket.AF_PACKET, socket.SOCK_DGRAM, socket.htons(self.ETH_P_IP))
        sock.settimeout(1.0)
        seen: collections.OrderedDict = collections.OrderedDict()
        self.state, self.detail = "ok", f"tcp/{port} (pasif)"
        while not self.agent.stopping.is_set():
            try:
                packet, addr = sock.recvfrom(65535)
            except socket.timeout:
                continue
            if addr[2] == self.PACKET_OUTGOING:
                continue
            event = self.packet_event(packet, port, seen)
            if event:
                self.emit(event)

    @staticmethod
    def packet_event(packet: bytes, port: int, seen: collections.OrderedDict) -> dict | None:
        info = parse_ipv4(packet)
        if not info or info.get("dst_port") != port or "l4_payload_offset" not in info:
            return None
        data = packet[info["l4_payload_offset"]:]
        if not data:
            # ACK murni tanpa data memakai nomor urut yang sama dengan segmen
            # data berikutnya; jangan dicatat agar segmen itu tidak dianggap retransmisi.
            return None
        key = (info["src_ip"], info.get("src_port"), info.get("tcp_seq"), hashlib.sha1(data).digest())
        if key in seen:  # retransmisi
            return None
        seen[key] = True
        if len(seen) > 2048:
            seen.popitem(last=False)
        write = parse_modbus_write(data)
        if not write:
            return None
        write["dst_ip"] = info["dst_ip"]
        return {
            "source": "modbus",
            "occurred_at": utc_now_iso(),
            "src_ip": info["src_ip"],
            "dst_port": port,
            "payload": write,
            "raw": f"FC{write['function_code']} {write['function_name']} dari {info['src_ip']} ke {info['dst_ip']}:{port}",
            "is_test": False,
        }


COLLECTORS = {
    "web": WebCollector,
    "ssh": SshCollector,
    "firewall": FirewallCollector,
    "fim": FimCollector,
    "modbus": ModbusCollector,
}


# --------------------------------------------------------------------------
# Perintah (daftar tetap)
# --------------------------------------------------------------------------
class CommandExecutor:
    def __init__(self, nft: Nft, blocking_cfg: dict):
        self.nft = nft
        self.cfg = blocking_cfg

    def execute(self, command: dict) -> tuple[bool, str]:
        ctype = command.get("type")
        params = command.get("params") or {}
        if ctype not in ALLOWED_COMMANDS:
            return False, f"jenis perintah '{ctype}' tidak ada di daftar tetap"
        if ctype in ("block_ip", "unblock_ip"):
            if not self.cfg.get("enabled", True):
                return False, "pemblokiran dinonaktifkan di konfigurasi agent"
            try:
                ip = ipaddress.ip_address(str(params.get("ip", "")))
            except ValueError:
                return False, "parameter ip tidak valid"
            if ip.is_loopback or ip.is_unspecified or ip.is_multicast:
                return False, "IP loopback/unspecified/multicast tidak boleh diblokir"
            if ctype == "block_ip":
                try:
                    duration = int(params.get("duration_s", 3600))
                except (TypeError, ValueError):
                    return False, "parameter duration_s tidak valid"
                if not self.cfg["min_duration_s"] <= duration <= self.cfg["max_duration_s"]:
                    return False, f"duration_s harus {self.cfg['min_duration_s']}..{self.cfg['max_duration_s']} detik"
                code, out = self.nft.block(ip, duration)
                return (code == 0, f"IP {ip} diblokir {duration} detik di nftables" if code == 0 else f"nft gagal: {out}")
            code, out = self.nft.unblock(ip)
            if code != 0 and "No such file" not in out and "does not exist" not in out:
                return False, f"nft gagal: {out}"
            return True, f"blokir IP {ip} dibuka"
        # run_test: skenario Uji Kesiapan ditambahkan di Fase 2.
        return False, "skenario uji belum tersedia di versi agent ini"


# --------------------------------------------------------------------------
# Agent
# --------------------------------------------------------------------------
class Agent:
    def __init__(self, cfg: dict, client: CoreClient | None = None, nft: Nft | None = None):
        self.cfg = cfg
        self.stopping = threading.Event()
        os.makedirs(cfg["state_dir"], mode=0o700, exist_ok=True)
        self.queue = EventQueue(os.path.join(cfg["state_dir"], "queue.db"), int(cfg["queue_max"]))
        self.client = client or CoreClient(cfg["core_url"], cfg.get("ca_file"), float(cfg["http_timeout_s"]))
        self.nft = nft or Nft()
        self.executor = CommandExecutor(self.nft, cfg["blocking"])
        self.collectors: dict[str, Collector] = {}
        self.revoked = False
        self.done_commands: collections.OrderedDict = collections.OrderedDict()
        self.hostname = cfg.get("hostname") or socket.gethostname()

    # -- pendaftaran ------------------------------------------------------
    @property
    def token_path(self) -> str:
        return os.path.join(self.cfg["state_dir"], "token")

    def ensure_registered(self) -> bool:
        if os.path.exists(self.token_path):
            with open(self.token_path, encoding="utf-8") as fh:
                self.client.token = fh.read().strip()
            return True
        code = self.cfg.get("enrollment_code")
        if not code:
            LOG.error("belum terdaftar dan enrollment_code kosong di konfigurasi")
            return False
        try:
            resp = self.client.request("POST", "/register", {
                "enrollment_code": code,
                "hostname": self.hostname,
                "ip": self.local_ip(),
                "version": VERSION,
            }, auth=False)
        except CoreError as exc:
            LOG.error("pendaftaran gagal: %s", exc)
            return False
        fd = os.open(self.token_path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(resp["token"])
        self.client.token = resp["token"]
        LOG.info("terdaftar sebagai agent #%s di %s", resp.get("agent_id"), (resp.get("unit") or {}).get("name"))
        return True

    def local_ip(self) -> str | None:
        try:
            host = urllib.parse.urlparse(self.cfg["core_url"]).hostname
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect((host, 443))
                return s.getsockname()[0]
        except OSError:
            return None

    # -- siklus kerja -----------------------------------------------------
    def start_collectors(self) -> None:
        for key, cls in COLLECTORS.items():
            source_cfg = self.cfg["sources"].get(key, {})
            if not source_cfg.get("enabled"):
                continue
            collector = cls(self, source_cfg)
            self.collectors[key] = collector
            collector.start()

    def source_status(self) -> dict:
        status = {}
        for key in COLLECTORS:
            if key in self.collectors:
                status[key] = self.collectors[key].status()
            else:
                status[key] = {"status": "disabled", "detail": "", "last_event_at": None}
        return status

    def handle_core_error(self, exc: CoreError, what: str) -> float:
        """Mengembalikan jeda sebelum mencoba lagi."""
        if exc.status == 401:
            if not self.revoked:
                LOG.error("%s: token ditolak Core (dicabut?). Event tetap ditahan di antrean.", what)
            self.revoked = True
            return 30.0
        if exc.status == 429:
            return exc.retry_after or 5.0
        LOG.warning("%s gagal: %s", what, exc)
        return 3.0

    def send_loop(self) -> None:
        backoff = 0.0
        while not self.stopping.wait(max(float(self.cfg["batch_interval_s"]), backoff)):
            batch = self.queue.peek(int(self.cfg["max_batch"]))
            if not batch:
                backoff = 0.0
                continue
            try:
                self.client.request("POST", "/events", {"events": [e for _, e in batch]})
            except CoreError as exc:
                if exc.status == 422:
                    LOG.error("batch %d event ditolak (skema tidak valid), dibuang: %s", len(batch), exc)
                    self.queue.ack([i for i, _ in batch])
                    continue
                backoff = min(30.0, self.handle_core_error(exc, "kirim event"))
                continue
            self.revoked = False
            self.queue.ack([i for i, _ in batch])
            backoff = 0.0

    def heartbeat_loop(self) -> None:
        while True:
            try:
                self.client.request("POST", "/heartbeat", {
                    "version": VERSION,
                    "ip": self.local_ip(),
                    "sources": self.source_status(),
                })
                self.revoked = False
                wait = float(self.cfg["heartbeat_interval_s"])
            except CoreError as exc:
                wait = min(float(self.cfg["heartbeat_interval_s"]), self.handle_core_error(exc, "heartbeat"))
            if self.stopping.wait(wait):
                return

    def command_loop(self) -> None:
        while not self.stopping.wait(float(self.cfg["command_poll_s"])):
            try:
                commands = self.client.request("GET", "/commands").get("commands", [])
            except CoreError as exc:
                self.handle_core_error(exc, "ambil perintah")
                continue
            for command in commands:
                self.process_command(command)

    def process_command(self, command: dict) -> None:
        cid = command.get("id")
        if cid in self.done_commands:
            result = self.done_commands[cid]
        else:
            started = utc_now_iso()
            ok, message = self.executor.execute(command)
            LOG.info("perintah #%s %s: %s", cid, command.get("type"), message)
            result = {"status": "success" if ok else "failed", "message": message, "executed_at": started}
            self.done_commands[cid] = result
            if len(self.done_commands) > 500:
                self.done_commands.popitem(last=False)
        try:
            self.client.request("POST", f"/commands/{int(cid)}/result", result)
        except (CoreError, TypeError, ValueError) as exc:
            LOG.warning("gagal melaporkan hasil perintah #%s: %s", cid, exc)

    def run(self) -> None:
        while not self.ensure_registered():
            if self.stopping.wait(30):
                return
        self.start_collectors()
        threads = [
            threading.Thread(target=self.send_loop, daemon=True, name="sender"),
            threading.Thread(target=self.heartbeat_loop, daemon=True, name="heartbeat"),
            threading.Thread(target=self.command_loop, daemon=True, name="commands"),
        ]
        for t in threads:
            t.start()
        LOG.info("SENTRA Agent %s berjalan (%s); sumber: %s", VERSION, self.hostname, ", ".join(self.collectors) or "-")
        self.stopping.wait()

    def stop(self, *_args) -> None:
        self.stopping.set()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SENTRA Agent")
    parser.add_argument("--config", default="/etc/sentra/agent.json")
    parser.add_argument("--check", action="store_true", help="validasi konfigurasi lalu keluar")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )
    try:
        cfg = load_config(args.config)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        LOG.error("konfigurasi tidak valid: %s", exc)
        return 2
    if args.check:
        enabled = [k for k, v in cfg["sources"].items() if v.get("enabled")]
        print(json.dumps({"ok": True, "version": VERSION, "core_url": cfg["core_url"], "sources": enabled}))
        return 0

    agent = Agent(cfg)
    signal.signal(signal.SIGTERM, agent.stop)
    signal.signal(signal.SIGINT, agent.stop)
    agent.run()
    return 0


if __name__ == "__main__":
    sys.exit(main())
