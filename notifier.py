import json, os, sys, requests
from datetime import datetime, date
from pathlib import Path

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "6092119396")
MODE      = os.environ.get("NOTIFY_MODE", "morning")
API       = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

MEMORY_PATHS = [Path(".mcp/memory.json"), Path("memory.json"), Path("life-os/memory.json")]

def load_memory():
    for p in MEMORY_PATHS:
        if p.exists():
            print(f"Loaded: {p}")
            return json.loads(p.read_text(encoding="utf-8"))
    print("ERROR: memory.json not found"); sys.exit(1)

def days_until(s):
    try: return (datetime.strptime(s[:10],"%Y-%m-%d").date() - date.today()).days
    except: return 999

def emo(d):
    return "🔴" if d<=1 else "🟠" if d<=3 else "🟡" if d<=7 else "🟢"

def escape(t):
    for c in r"_*[]()~`>#+-=|{}.!":
        t = t.replace(c, f"\\{c}")
    return t

def send(text):
    if not BOT_TOKEN:
        print("ERROR: TELEGRAM_BOT_TOKEN not set"); return False
    r = requests.post(API, json={"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"}, timeout=15)
    if r.status_code == 200:
        print("Sent successfully"); return True
    print(f"Telegram error {r.status_code}: {r.text}")
    r2 = requests.post(API, json={"chat_id": CHAT_ID, "text": text[:4000]}, timeout=15)
    return r2.status_code == 200

def morning(mem):
    name  = mem.get("identity",{}).get("name","Maya")
    today = datetime.now().strftime("%A, %d %B %Y")
    lines = [f"*LIFE OS - {name}*", f"_{today}_", ""]

    subs  = mem.get("studies",{}).get("moodle",{}).get("upcoming_submissions",[])
    exams = mem.get("studies",{}).get("moodle",{}).get("upcoming_exams",[])
    urgent = []
    for s in subs:
        d = days_until(s["due"])
        if d <= 7: urgent.append(f"{emo(d)} {s['course']} - {s['task']} - {d}d")
    for e in exams:
        d = days_until(e["date"])
        if d <= 14: urgent.append(f"📖 {e['course']} exam - {d}d")
    if urgent:
        lines += ["🔴 *URGENT*"] + [f"  {u}" for u in urgent] + [""]

    top3 = mem.get("active_priorities",{}).get("top_3_right_now",[])
    if top3:
        lines += ["🎯 *Priorities*"] + [f"  {i+1}. {p}" for i,p in enumerate(top3[:3])] + [""]

    aura  = mem.get("projects",{}).get("aura_glossy",{})
    bugs  = aura.get("open_bugs",[])
    check = aura.get("monitoring",{}).get("last_health_check","never")
    lines += [f"🚀 *Aura Glossy* - {len(bugs)} bugs - last check: {check}", ""]

    apps = mem.get("career",{}).get("job_applications",[])
    fu   = [a for a in apps if a.get("status") in ("in-review","applied","waiting-for-assignments")]
    if fu:
        lines += ["💼 *Career*"] + [f"  • {a['company']} - {a.get('status')}" for a in fu] + [""]

    ideas = mem.get("content",{}).get("ideas",[])
    lines.append(f"💡 *Content* - {len(ideas)} ideas ready")
    return "\n".join(lines)

def deadline(mem):
    subs = mem.get("studies",{}).get("moodle",{}).get("upcoming_submissions",[])
    urgent = [s for s in subs if days_until(s["due"]) <= 4]
    if not urgent: return None
    lines = ["⏰ *DEADLINE ALERT*",""]
    for s in urgent:
        d = days_until(s["due"])
        lines.append(f"  {emo(d)} {s['course']} - {s['task']} - {d}d")
    lines += ["","Open Moodle now: https://moodle.kinneret.ac.il/my/"]
    return "\n".join(lines)

def aura_check(mem):
    a     = mem.get("projects",{}).get("aura_glossy",{})
    bugs  = a.get("open_bugs",[])
    check = a.get("monitoring",{}).get("last_health_check","never")
    lines = ["🌐 *AURA GLOSSY CHECK*","",
             f"  🐛 Open bugs: {len(bugs)}",
             f"  🔍 Last check: {check}",""]
    if bugs: lines += ["*Bugs:*"] + [f"  {i+1}. {b}" for i,b in enumerate(bugs[:5])]
    lines += ["","Run: site check in Claude Code"]
    return "\n".join(lines)

def stalled(mem):
    blocked = mem.get("tasks",{}).get("blocked",[])
    waiting = mem.get("tasks",{}).get("waiting_on",[])
    if not blocked and not waiting: return None
    lines = ["⚠️ *STALLED TASKS*",""]
    if blocked:
        lines.append("🔒 *Blocked*")
        for t in blocked:
            lines.append(f"  • {t['task'] if isinstance(t,dict) else t}")
    if waiting:
        lines += ["","⏳ *Waiting on*"] + [f"  • {w}" for w in waiting]
    return "\n".join(lines)

def weekly(mem):
    name = mem.get("identity",{}).get("name","Maya")
    done = mem.get("tasks",{}).get("done_this_week",[])
    next3 = mem.get("active_priorities",{}).get("this_week",[])
    lines = [f"📊 *WEEKLY REPORT - {name}*",
             f"_{datetime.now().strftime('Week of %d %B %Y')}_","",
             f"✅ Completed: {len(done)} tasks",""]
    if next3:
        lines += ["📈 *Next week*"] + [f"  {i+1}. {p}" for i,p in enumerate(next3[:5])]
    return "\n".join(lines)

def main():
    print(f"Mode: {MODE} | {datetime.now().isoformat()}")
    mem = load_memory()
    builders = {"morning":morning,"deadline":deadline,"aura":aura_check,"stalled":stalled,"weekly":weekly}
    msg = builders.get(MODE, morning)(mem)
    if msg is None:
        print("Nothing urgent - silent"); sys.exit(0)
    sys.exit(0 if send(msg) else 1)

if __name__ == "__main__":
    main()
