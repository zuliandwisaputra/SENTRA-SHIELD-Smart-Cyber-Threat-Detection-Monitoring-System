"""Test SENTRA Agent — hanya pustaka standar (python3 -m unittest discover agent/tests)."""

import collections
import http.server
import json
import os
import socket
import stat
import struct
import sys
import tempfile
import threading
import time
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import sentra_agent as sa  # noqa: E402


def ipv4_tcp_packet(src, dst, sport, dport, payload=b"", seq=1000):
    tcp = struct.pack("!HHIIBBHHH", sport, dport, seq, 0, 5 << 4, 0x18, 65535, 0, 0)
    total = 20 + len(tcp) + len(payload)
    ip = struct.pack("!BBHHHBBH4s4s", 0x45, 0, total, 1, 0, 64, 6, 0, socket.inet_aton(src), socket.inet_aton(dst))
    return ip + tcp + payload


def mbap(fc, body, tid=7, unit=1):
    pdu = bytes([fc]) + body
    return struct.pack("!HHHB", tid, 0, len(pdu) + 1, unit) + pdu


class ParserTest(unittest.TestCase):
    def test_web_combined_line(self):
        line = ('172.30.0.66 - - [12/Nov/2026:09:14:03 +0700] "GET /berita.php?id=1%27%20OR%20%271%27=%271 HTTP/1.1" '
                '500 123 "-" "sqlmap/1.8#stable (https://sqlmap.org)"')
        ev = sa.parse_web_line(line)
        self.assertEqual(ev["source"], "web")
        self.assertEqual(ev["src_ip"], "172.30.0.66")
        self.assertEqual(ev["occurred_at"], "2026-11-12T09:14:03+07:00")
        self.assertEqual(ev["payload"]["path"], "/berita.php")
        self.assertEqual(ev["payload"]["query"], "id=1%27%20OR%20%271%27=%271")
        self.assertEqual(ev["payload"]["status"], 500)
        self.assertIn("sqlmap", ev["payload"]["user_agent"])
        self.assertEqual(ev["raw"], line)

    def test_web_malformed_request_and_garbage(self):
        ev = sa.parse_web_line('172.30.0.66 - - [12/Nov/2026:09:14:03 +0700] "\\x16\\x03\\x01" 400 0 "-" "-"')
        self.assertEqual(ev["payload"]["status"], 400)
        self.assertIsNone(sa.parse_web_line("bukan baris log"))

    def test_ssh_failed_invalid_user(self):
        ev = sa.parse_ssh_line("2026-11-12T09:15:01.123456+07:00 kodim-a sshd[88]: Failed password for invalid user admin from 172.30.0.66 port 40022 ssh2")
        self.assertEqual(ev["payload"]["outcome"], "failed")
        self.assertTrue(ev["payload"]["invalid_user"])
        self.assertEqual(ev["payload"]["user"], "admin")
        self.assertEqual(ev["src_ip"], "172.30.0.66")
        self.assertEqual(ev["occurred_at"], "2026-11-12T09:15:01.123456+07:00")

    def test_ssh_failed_and_accepted(self):
        failed = sa.parse_ssh_line("sshd[9]: Failed password for root from 10.1.2.3 port 5 ssh2")
        ok = sa.parse_ssh_line("sshd[9]: Accepted password for latihan from 10.1.2.3 port 6 ssh2")
        self.assertEqual(failed["payload"]["user"], "root")
        self.assertFalse(failed["payload"]["invalid_user"])
        self.assertEqual(ok["payload"]["outcome"], "success")
        self.assertEqual(ok["dst_port"], 22)

    def test_ssh_lines_that_are_not_attempts_are_ignored(self):
        # "Invalid user" selalu diikuti "Failed password ..." -> tidak dihitung dua kali.
        self.assertIsNone(sa.parse_ssh_line("sshd[9]: Invalid user admin from 10.1.2.3 port 5"))
        self.assertIsNone(sa.parse_ssh_line("sshd[9]: Connection closed by 10.1.2.3 port 5 [preauth]"))

    def test_modbus_write_single_register(self):
        info = sa.parse_modbus_write(mbap(6, struct.pack("!HH", 40, 1234)))
        self.assertEqual(info["function_code"], 6)
        self.assertEqual(info["address"], 40)
        self.assertEqual(info["value"], 1234)

    def test_modbus_write_coil_and_multiple_registers(self):
        coil = sa.parse_modbus_write(mbap(5, struct.pack("!HH", 3, 0xFF00)))
        regs = sa.parse_modbus_write(mbap(16, struct.pack("!HHB", 10, 2, 4) + struct.pack("!HH", 7, 8)))
        self.assertEqual(coil["value"], 1)
        self.assertEqual(regs["quantity"], 2)
        self.assertEqual(regs["values"], [7, 8])

    def test_modbus_reads_are_not_writes(self):
        self.assertIsNone(sa.parse_modbus_write(mbap(3, struct.pack("!HH", 0, 10))))
        self.assertIsNone(sa.parse_modbus_write(b"\x00\x01"))

    def test_modbus_packet_event_and_retransmission(self):
        seen = collections.OrderedDict()
        pkt = ipv4_tcp_packet("172.30.0.66", "172.31.0.20", 40000, 502, mbap(6, struct.pack("!HH", 1, 99)))
        ev = sa.ModbusCollector.packet_event(pkt, 502, seen)
        self.assertEqual(ev["source"], "modbus")
        self.assertEqual(ev["src_ip"], "172.30.0.66")
        self.assertEqual(ev["payload"]["function_name"], "Write Single Register")
        self.assertIsNone(sa.ModbusCollector.packet_event(pkt, 502, seen), "retransmisi tidak dihitung dua kali")
        other_port = ipv4_tcp_packet("172.30.0.66", "172.31.0.20", 40000, 80, mbap(6, b"\0\1\0\2"), seq=5)
        self.assertIsNone(sa.ModbusCollector.packet_event(other_port, 502, seen))

    def test_nflog_message_parsing(self):
        payload = ipv4_tcp_packet("172.30.0.66", "172.30.0.10", 41000, 23)
        attrs = sa._nl_attr(10, b"SENTRA_CLOSED\0") + sa._nl_attr(9, payload)
        body = struct.pack("=BBH", 2, 0, socket.htons(7)) + attrs
        msg = struct.pack("=IHHII", 16 + len(body), sa.NFNL_SUBSYS_ULOG << 8, 0, 0, 0) + body
        pkts = sa.parse_nflog_messages(msg + msg)
        self.assertEqual(len(pkts), 2)
        self.assertEqual(pkts[0]["prefix"], "SENTRA_CLOSED")
        self.assertEqual(pkts[0]["packet"]["dst_port"], 23)
        self.assertEqual(pkts[0]["packet"]["src_ip"], "172.30.0.66")


class QueueTest(unittest.TestCase):
    def test_queue_drops_oldest_beyond_max_and_persists(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "q.db")
            q = sa.EventQueue(path, max_rows=5)
            for i in range(8):
                q.put({"n": i})
            self.assertEqual(q.size(), 5)
            self.assertEqual(q.dropped, 3)
            rows = q.peek(10)
            self.assertEqual([e["n"] for _, e in rows], [3, 4, 5, 6, 7])
            q.ack([rows[0][0]])
            reopened = sa.EventQueue(path, max_rows=5)
            self.assertEqual([e["n"] for _, e in reopened.peek(10)], [4, 5, 6, 7])


class FileTailerTest(unittest.TestCase):
    def test_tailer_starts_at_end_and_follows_rotation_and_truncation(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "access.log")
            with open(path, "w") as fh:
                fh.write("lama 1\nlama 2\n")
            tailer = sa.FileTailer(path)
            self.assertEqual(tailer.read_lines(), [], "log lama tidak diputar ulang")
            with open(path, "a") as fh:
                fh.write("baru 1\nbaru-sebagian")
            self.assertEqual(tailer.read_lines(), ["baru 1"])
            with open(path, "a") as fh:
                fh.write(" selesai\n")
            self.assertEqual(tailer.read_lines(), ["baru-sebagian selesai"])
            os.rename(path, path + ".1")
            with open(path, "w") as fh:
                fh.write("setelah rotasi\n")
            self.assertEqual(tailer.read_lines(), ["setelah rotasi"])
            with open(path, "w") as fh:
                fh.write("")
            tailer.read_lines()
            with open(path, "a") as fh:
                fh.write("setelah truncate\n")
            self.assertEqual(tailer.read_lines(), ["setelah truncate"])

    def test_missing_file(self):
        tailer = sa.FileTailer("/tidak/ada/access.log")
        self.assertEqual(tailer.read_lines(), [])
        self.assertFalse(tailer.exists)


class FimTest(unittest.TestCase):
    def test_detects_created_modified_deleted_with_hash_and_sample(self):
        with tempfile.TemporaryDirectory() as tmp:
            fim = sa.FimCollector.__new__(sa.FimCollector)
            fim.cfg = {"paths": [tmp], "max_sample_bytes": 64}
            base = fim.scan()
            shell = os.path.join(tmp, "uploads", "x.php")
            os.makedirs(os.path.dirname(shell))
            with open(shell, "w") as fh:
                fh.write("<?php system($_GET['c']); ?>")
            after_create = fim.scan()
            events = fim.diff(base, after_create)
            self.assertEqual(len(events), 1)
            self.assertEqual(events[0]["payload"]["change"], "created")
            self.assertIn("system($_GET", events[0]["payload"]["sample"])
            self.assertEqual(len(events[0]["payload"]["sha256"]), 64)
            self.assertIsNone(events[0]["src_ip"])

            time.sleep(0.01)
            with open(shell, "a") as fh:
                fh.write("// ubah")
            after_modify = fim.scan()
            self.assertEqual([e["payload"]["change"] for e in fim.diff(after_create, after_modify)], ["modified"])
            os.remove(shell)
            self.assertEqual([e["payload"]["change"] for e in fim.diff(after_modify, fim.scan())], ["deleted"])


class FakeNft:
    def __init__(self, fail_delete_missing=True):
        self.calls = []
        self.fail_delete_missing = fail_delete_missing

    def __call__(self, args, stdin=None):
        self.calls.append(args)
        if args[1] == "delete" and self.fail_delete_missing:
            return 1, "Error: Could not process rule: No such file or directory"
        return 0, ""


class CommandTest(unittest.TestCase):
    def setUp(self):
        self.runner = FakeNft()
        self.exec = sa.CommandExecutor(sa.Nft(self.runner), dict(sa.DEFAULT_CONFIG["blocking"]))

    def test_only_fixed_command_list(self):
        ok, msg = self.exec.execute({"type": "shell", "params": {"cmd": "rm -rf /"}})
        self.assertFalse(ok)
        self.assertIn("daftar tetap", msg)
        self.assertEqual(self.runner.calls, [])

    def test_block_ip_uses_fixed_nft_arguments(self):
        ok, msg = self.exec.execute({"type": "block_ip", "params": {"ip": "172.30.0.66", "duration_s": 3600}})
        self.assertTrue(ok, msg)
        self.assertEqual(self.runner.calls[-1], ["nft", "add", "element", "inet", "sentra", "blocklist4", "{", "172.30.0.66", "timeout", "3600s", "}"])

    def test_block_rejects_injection_and_bad_params(self):
        for params in (
            {"ip": "172.30.0.66; nft flush ruleset"},
            {"ip": "127.0.0.1"},
            {"ip": "0.0.0.0"},
            {"ip": "172.30.0.66", "duration_s": 5},
            {"ip": "172.30.0.66", "duration_s": "satu jam"},
        ):
            ok, _ = self.exec.execute({"type": "block_ip", "params": params})
            self.assertFalse(ok, params)
        self.assertEqual(self.runner.calls, [])

    def test_unblock_missing_element_is_success(self):
        ok, msg = self.exec.execute({"type": "unblock_ip", "params": {"ip": "172.30.0.66"}})
        self.assertTrue(ok, msg)

    def test_ipv6_goes_to_ipv6_set(self):
        self.exec.execute({"type": "block_ip", "params": {"ip": "2001:db8::66", "duration_s": 60}})
        self.assertIn("blocklist6", self.runner.calls[-1])

    def test_run_test_not_yet_available(self):
        ok, _ = self.exec.execute({"type": "run_test", "params": {"scenario": "R01"}})
        self.assertFalse(ok)


class ConfigTest(unittest.TestCase):
    def write(self, data):
        fh = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
        json.dump(data, fh)
        fh.close()
        self.addCleanup(os.unlink, fh.name)
        return fh.name

    def test_defaults_are_merged(self):
        cfg = sa.load_config(self.write({"core_url": "https://core", "sources": {"web": {"path": "/x.log"}}}))
        self.assertEqual(cfg["sources"]["web"]["path"], "/x.log")
        self.assertTrue(cfg["sources"]["web"]["enabled"])
        self.assertEqual(cfg["queue_max"], 10000)

    def test_plain_http_only_for_localhost(self):
        with self.assertRaises(ValueError):
            sa.load_config(self.write({"core_url": "http://sentra-core"}))
        sa.load_config(self.write({"core_url": "http://127.0.0.1:8000"}))


class FakeCore(http.server.BaseHTTPRequestHandler):
    state = {}

    def log_message(self, *args):
        pass

    def _send(self, code, body):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _body(self):
        return json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")

    def _authorized(self):
        return self.headers.get("Authorization") == "Bearer 1|token-uji" and not self.state.get("revoked")

    def do_POST(self):
        s = self.state
        if self.path.endswith("/register"):
            body = self._body()
            if body.get("enrollment_code") != "SNTR-UJI":
                return self._send(401, {"message": "kode salah"})
            s["registered"] = body
            return self._send(200, {"agent_id": 1, "token": "1|token-uji", "unit": {"name": "Kodim Latihan A"}})
        if not self._authorized():
            return self._send(401, {"message": "Token agent salah atau dicabut."})
        body = self._body()
        if self.path.endswith("/events"):
            s.setdefault("events", []).extend(body["events"])
            return self._send(200, {"accepted": len(body["events"])})
        if self.path.endswith("/heartbeat"):
            s.setdefault("heartbeats", []).append(body)
            return self._send(200, {"pending_commands": 0})
        if "/commands/" in self.path:
            s.setdefault("results", []).append((self.path, body))
            return self._send(200, {"status": "dieksekusi"})
        self._send(404, {})

    def do_GET(self):
        if not self._authorized():
            return self._send(401, {})
        commands = [] if self.state.get("results") else [
            {"id": 31, "type": "block_ip", "params": {"ip": "172.30.0.66", "duration_s": 3600}, "approved_by": "Komandan"},
            {"id": 32, "type": "exec", "params": {"cmd": "id"}},
        ]
        self._send(200, {"commands": commands})


class AgentFlowTest(unittest.TestCase):
    def setUp(self):
        FakeCore.state = {}
        self.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FakeCore)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.tmp = tempfile.TemporaryDirectory()
        cfg = sa.deep_merge(sa.DEFAULT_CONFIG, {
            "core_url": f"http://127.0.0.1:{self.server.server_port}",
            "enrollment_code": "SNTR-UJI",
            "state_dir": self.tmp.name,
            "heartbeat_interval_s": 0.05,
            "batch_interval_s": 0.05,
            "command_poll_s": 0.05,
            "sources": {k: {"enabled": False} for k in sa.DEFAULT_CONFIG["sources"]},
        })
        self.runner = FakeNft()
        self.agent = sa.Agent(cfg, nft=sa.Nft(self.runner))

    def tearDown(self):
        self.agent.stop()
        self.server.shutdown()
        self.server.server_close()
        self.tmp.cleanup()

    def wait_for(self, predicate, timeout=3.0):
        end = time.time() + timeout
        while time.time() < end:
            if predicate():
                return True
            time.sleep(0.02)
        return False

    def test_register_send_heartbeat_and_commands(self):
        self.agent.queue.put({"source": "web", "occurred_at": sa.utc_now_iso(), "src_ip": "172.30.0.66", "payload": {}, "is_test": False})
        threading.Thread(target=self.agent.run, daemon=True).start()

        self.assertTrue(self.wait_for(lambda: len(FakeCore.state.get("events", [])) == 1), "event terkirim")
        self.assertTrue(self.wait_for(lambda: FakeCore.state.get("heartbeats")), "heartbeat terkirim")
        self.assertTrue(self.wait_for(lambda: len(FakeCore.state.get("results", [])) >= 2), "hasil perintah dilaporkan")

        token_file = os.path.join(self.tmp.name, "token")
        self.assertEqual(stat.S_IMODE(os.stat(token_file).st_mode), 0o600)
        self.assertEqual(FakeCore.state["registered"]["version"], sa.VERSION)
        self.assertEqual(self.agent.queue.size(), 0)
        self.assertEqual(set(FakeCore.state["heartbeats"][0]["sources"]), set(sa.COLLECTORS))

        results = dict(FakeCore.state["results"])
        self.assertEqual(results["/api/v1/agent/commands/31/result"]["status"], "success")
        self.assertEqual(results["/api/v1/agent/commands/32/result"]["status"], "failed")
        self.assertNotIn(["id"], [c[-1:] for c in self.runner.calls], "perintah bebas tidak pernah dijalankan")

    def test_events_are_kept_when_token_is_revoked(self):
        FakeCore.state["revoked"] = True
        with open(os.path.join(self.tmp.name, "token"), "w") as fh:
            fh.write("1|token-uji")
        self.agent.queue.put({"source": "ssh", "occurred_at": sa.utc_now_iso(), "src_ip": "10.0.0.1", "payload": {}, "is_test": False})
        threading.Thread(target=self.agent.run, daemon=True).start()

        self.assertTrue(self.wait_for(lambda: self.agent.revoked))
        self.assertEqual(self.agent.queue.size(), 1, "event tetap di antrean lokal")


if __name__ == "__main__":
    unittest.main()
