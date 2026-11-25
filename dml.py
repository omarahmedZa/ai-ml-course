#!/usr/bin/env python3
"""dml.py — pull a problem, run its tests locally, submit the score to the site.

    python3 dml.py list
    python3 dml.py pull 001
    python3 dml.py run 001
    python3 dml.py submit 001
    python3 dml.py export record.json / import record.json
    python3 dml.py doctor
    python3 dml.py selftest

Standard library only. Solutions may import numpy.
"""
import base64
import hashlib
import importlib.util
import json
import os
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

BASE = "https://omarahmedza.github.io/ai-ml-course"
SALT = "ai35-problems-v1"
ROOT = Path.cwd()
WORK = ROOT / "work"
PROGRESS = ROOT / "progress.json"
WEIGHT = 5.0
VIS_SHARE, HID_SHARE = 0.4, 0.6


def die(msg, code=1):
    print(msg)
    raise SystemExit(code)


def load_bundle(pid, bundle_dir=None):
    if bundle_dir:
        path = Path(bundle_dir) / f"{pid}.json"
        if not path.exists():
            die(f"no bundle for {pid} in {bundle_dir}")
        return json.loads(path.read_text())
    url = f"{BASE}/problems/data/{pid}.json"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        die(f"could not download {url}: {e}\nUse --bundle-dir <repo>/problems/data offline.")


def all_ids(bundle_dir=None):
    if bundle_dir:
        return sorted(p.stem for p in Path(bundle_dir).glob("*.json"))
    try:
        with urllib.request.urlopen(f"{BASE}/search-index.json", timeout=15) as r:
            idx = json.loads(r.read().decode())
        return sorted({e["id"] for e in idx if e.get("type") == "problem"})
    except Exception:
        return []


def progress():
    if PROGRESS.exists():
        try:
            return json.loads(PROGRESS.read_text())
        except Exception:
            pass
    return {"version": 1, "problems": {}}


def save_progress(p):
    PROGRESS.write_text(json.dumps(p, indent=2) + "\n")


def run_tests(sol_path, tests_path, visible):
    spec = importlib.util.spec_from_file_location("solution", sol_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    ns = {"solution": mod, "__name__": "tests"}
    exec(compile(Path(tests_path).read_text(), str(tests_path), "exec"), ns)
    names = sorted(k for k in ns if k.startswith("test_") and callable(ns[k]))
    results = []
    for name in names:
        try:
            ns[name]()
            results.append((name, True, ""))
        except Exception as e:
            results.append((name, False, f"{type(e).__name__}: {e}"))
    vis = [r for r in results if r[0] in visible]
    hid = [r for r in results if r[0] not in visible]
    return results, vis, hid


def score(vis_p, vis_t, hid_p, hid_t, attempt):
    vis = vis_p / vis_t if vis_t else 1.0
    hid = hid_p / hid_t if hid_t else 1.0
    decay = max(0.5, 1 - 0.1 * (attempt - 1))
    return round(WEIGHT * (VIS_SHARE * vis + HID_SHARE * hid) * decay, 1)


def make_token(payload):
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    body = base64.urlsafe_b64encode(raw).decode().rstrip("=")
    sig = hashlib.sha256(raw + SALT.encode()).hexdigest()[:8]
    return f"{body}~{sig}"


def parse_token(token):
    try:
        body, sig = token.strip().rsplit("~", 1)
        pad = "=" * (-len(body) % 4)
        raw = base64.urlsafe_b64decode(body + pad)
        if hashlib.sha256(raw + SALT.encode()).hexdigest()[:8] != sig:
            return None
        return json.loads(raw)
    except Exception:
        return None


def cmd_list(args):
    bundle = _flag(args, "--bundle-dir")
    ids = all_ids(bundle)
    if not ids:
        die("no problems found")
    prog = progress()["problems"]
    for pid in ids:
        rec = prog.get(pid)
        mark = f"{rec['score']}/5" if rec else "—"
        try:
            b = load_bundle(pid, bundle)
            print(f"{pid}  {b['difficulty']:<12} {mark:<6} {b['title']}")
        except SystemExit:
            print(f"{pid}  {mark}")
    print(f"\n{sum(1 for v in prog.values())} solved · scores in {PROGRESS.name}")


def _flag(args, name):
    if name in args:
        i = args.index(name)
        val = args[i + 1] if i + 1 < len(args) else None
        del args[i:i + 2]
        return val
    return None


def cmd_pull(args):
    pid = _need_id(args)
    bundle = _flag(args, "--bundle-dir")
    force = "--force" in args
    b = load_bundle(pid, bundle)
    d = WORK / pid
    d.mkdir(parents=True, exist_ok=True)
    sol = d / "solution.py"
    if sol.exists() and not force:
        print(f"{sol} exists — use --force to overwrite")
    else:
        sol.write_text(b["starter"])
    (d / "tests.py").write_text(b["tests_py"])
    (d / "STATEMENT.md").write_text(f"# {b['title']}\n\n{b['statement_md']}\n")
    print(f"pulled {pid} -> {d}")
    print(f"visible tests: {', '.join(b['visible'])}")
    print(f"edit {sol}, then: python3 dml.py run {pid}")


def _need_id(args):
    ids = [a for a in args if a and (a[0].isdigit() or a.isdigit())]
    if not ids:
        die("give a problem id, e.g. python3 dml.py pull 001")
    return ids[-1]


def _run(pid, bundle):
    d = WORK / pid
    if not (d / "solution.py").exists():
        die(f"no solution yet: run pull {pid} first")
    b = load_bundle(pid, bundle)
    results, vis, hid = run_tests(d / "solution.py", d / "tests.py", set(b["visible"]))
    for name, ok, err in results:
        print(f"  {'ok  ' if ok else 'FAIL'} {name}" + (f"  {err}" if err else ""))
    return b, results, vis, hid


def cmd_run(args):
    pid = _need_id(args)
    b, results, vis, hid = _run(pid, _flag(args, "--bundle-dir"))
    bad = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(bad)}/{len(results)} tests passed")
    raise SystemExit(0 if not bad else 1)


def cmd_submit(args):
    pid = _need_id(args)
    bundle = _flag(args, "--bundle-dir")
    b, results, vis, hid = _run(pid, bundle)
    vp, hp = sum(r[1] for r in vis), sum(r[1] for r in hid)
    prog = progress()
    rec = prog["problems"].get(pid, {"attempts": 0, "score": 0})
    attempt = rec["attempts"] + 1
    s = score(vp, len(vis), hp, len(hid), attempt)
    sol_hash = hashlib.sha256((WORK / pid / "solution.py").read_bytes()).hexdigest()[:12]
    payload = {"v": 1, "id": pid, "vis": [vp, len(vis)], "hid": [hp, len(hid)],
               "score": s, "attempt": attempt, "ts": int(time.time()), "sol": sol_hash}
    token = make_token(payload)
    best = max(rec.get("score", 0), s)
    prog["problems"][pid] = {
        "score": best, "attempts": attempt,
        "best_attempt": attempt if s == best else rec.get("best_attempt", attempt),
        "visible": f"{vp}/{len(vis)}", "hidden": f"{hp}/{len(hid)}",
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "source": "cli",
    }
    save_progress(prog)
    link = f"{BASE}/problems/{pid}.html#r={token}"
    print(f"\nScore {s}/5 on attempt {attempt} (best {best}/5)")
    print(f"Open:  {link}")
    print(f"Paste: {token}")
    if "--no-open" not in args:
        try:
            webbrowser.open(link)
        except Exception:
            pass


def cmd_export(args):
    target = Path(args[-1]) if args else Path("dml-progress.json")
    target.write_text(json.dumps(progress(), indent=2) + "\n")
    print(f"exported -> {target}")


def cmd_import(args):
    src = Path(args[-1]) if args else die("give a file")
    incoming = json.loads(src.read_text())
    cur = progress()
    for pid, rec in incoming.get("problems", {}).items():
        old = cur["problems"].get(pid)
        if not old or rec.get("score", 0) > old.get("score", 0):
            cur["problems"][pid] = rec
    save_progress(cur)
    print(f"imported {len(incoming.get('problems', {}))} records")


def cmd_doctor(args):
    ok = True
    print(f"python {sys.version.split()[0]}")
    in_venv = sys.prefix != getattr(sys, "base_prefix", sys.prefix)
    print(f"venv   {'active' if in_venv else 'not active (fine, but pip installs need one)'}")
    try:
        import numpy
        print(f"numpy  {numpy.__version__}")
    except Exception:
        print("numpy  missing (needed by some problems)")
        print("       fix: python3 -m venv .venv && source .venv/bin/activate && python -m pip install numpy")
    try:
        with urllib.request.urlopen(f"{BASE}/index.html", timeout=10) as r:
            print(f"site   reachable ({r.status})")
    except Exception as e:
        print(f"site   unreachable: {e}")
        print("       use --bundle-dir <repo>/problems/data offline")
    try:
        WORK.mkdir(exist_ok=True)
        probe = WORK / ".probe"
        probe.write_text("ok")
        probe.unlink()
        print(f"work   writable at {WORK}")
    except Exception as e:
        ok = False
        print(f"work   not writable: {e}")
    raise SystemExit(0 if ok else 1)


def cmd_selftest(args):
    cases = [((2, 2, 4, 4, 1), 5.0), ((2, 2, 4, 4, 4), 3.5),
             ((2, 2, 2, 4, 1), 3.5), ((2, 2, 0, 4, 9), 1.0),
             ((0, 2, 0, 4, 1), 0.0)]
    for args_, want in cases:
        got = score(*args_)
        assert abs(got - want) < 1e-9, (args_, got, want)
    t = make_token({"id": "001"})
    assert parse_token(t)["id"] == "001"
    assert parse_token("nonsense") is None
    assert parse_token(t + "x") is None
    print("selftest ok: scoring, token round-trip, tamper rejection")


COMMANDS = {"list": cmd_list, "pull": cmd_pull, "run": cmd_run, "submit": cmd_submit,
            "export": cmd_export, "import": cmd_import, "doctor": cmd_doctor,
            "selftest": cmd_selftest}


def main():
    if len(sys.argv) < 2 or sys.argv[1] in {"-h", "--help"}:
        print(__doc__)
        return 0
    cmd = COMMANDS.get(sys.argv[1])
    if not cmd:
        die(f"unknown command {sys.argv[1]}\n{__doc__}")
    cmd(sys.argv[2:])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
