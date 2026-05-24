import json, os, sys, imaplib, email, requests, re
from datetime import datetime, date, timedelta
from pathlib import Path
from email.header import decode_header
from bs4 import BeautifulSoup

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN","")
CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID","6092119396")
TELEGRAM  = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
MOODLE_URL  = "https://moodle.kinneret.ac.il"
MOODLE_USER = os.environ.get("MOODLE_USERNAME","")
MOODLE_PASS = os.environ.get("MOODLE_PASSWORD","")
GMAIL_ADDR  = os.environ.get("GMAIL_ADDRESS","")
GMAIL_PASS  = os.environ.get("GMAIL_APP_PASSWORD","")
NETLIFY_TOKEN = os.environ.get("NETLIFY_TOKEN","")
AURA_URL  = "https://auraglossy.com"
AURA_REPO = "MAYASAHOURY/aura-glossy"
MEMORY_PATHS = [Path(".mcp/memory.json"), Path("memory.json")]
PRIORITY_SENDERS = ["imerit","telus","transperfect","mercor","kinneret","moodle","github","netlify","firebase","google","apple","linkedin"]

def load_memory():
    for p in MEMORY_PATHS:
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
    return {}

def days_until(s):
    try: return (datetime.strptime(s[:10],"%Y-%m-%d").date()-date.today()).days
    except: return 999

def urg(d):
    return "🔴" if d<=1 else "🟠" if d<=3 else "🟡" if d<=7 else "🟢"

def check_memory(mem):
    lines=[]
    subs=mem.get("studies",{}).get("moodle",{}).get("upcoming_submissions",[])
    exams=mem.get("studies",{}).get("moodle",{}).get("upcoming_exams",[])
    urgent=[]
    for s in subs:
        d=days_until(s["due"])
        if d<=7: urgent.append(f"{urg(d)} {s['course']} - {s['task']} - {d}d")
    for e in exams:
        d=days_until(e["date"])
        if d<=21: urgent.append(f"📖 {e['course']} exam - {d}d")
    if urgent:
        lines.append("📌 *Deadlines*")
        lines.extend(f"  {i}" for i in urgent)
    top3=mem.get("active_priorities",{}).get("top_3_right_now",[])
    if top3:
        lines.append("\n🎯 *Top 3 today*")
        for i,p in enumerate(top3[:3],1): lines.append(f"  {i}. {p}")
    lines.append("\n🗓 *Schedule*")
    lines.append("  Morning  - check emails + Moodle")
    lines.append("  Afternoon - deep work on top priority")
    lines.append("  Night    - deep work session")
    apps=mem.get("career",{}).get("job_applications",[])
    fu=[a for a in apps if a.get("status") in ("in-review","applied","waiting-for-assignments")]
    if fu:
        lines.append("\n💼 *Follow up*")
        for a in fu: lines.append(f"  - {a['company']} - {a.get('next_action','check')}")
    return "\n".join(lines) if lines else "No urgent items"

def check_moodle():
    if not MOODLE_USER or not MOODLE_PASS:
        return "📚 *Moodle* - credentials not set"
    try:
        s=requests.Session()
        s.headers.update({"User-Agent":"Mozilla/5.0"})
        r=s.get(f"{MOODLE_URL}/login/index.php",timeout=15)
        soup=BeautifulSoup(r.text,"html.parser")
        ti=soup.find("input",{"name":"logintoken"})
        token=ti["value"] if ti else ""
        lr=s.post(f"{MOODLE_URL}/login/index.php",data={"username":MOODLE_USER,"password":MOODLE_PASS,"logintoken":token,"anchor":""},timeout=15,allow_redirects=True)
        if "loginerrormessage" in lr.text:
            return "📚 *Moodle* - login failed, check credentials"
        lines=["📚 *Moodle* - logged in"]
        dash=s.get(f"{MOODLE_URL}/my/",timeout=15)
        ds=BeautifulSoup(dash.text,"html.parser")
        events=ds.find_all(class_=lambda c:c and "event" in c.lower())
        seen=set()
        for ev in events[:6]:
            t=ev.get_text(strip=True)[:80]
            if t and len(t)>3 and t not in seen:
                lines.append(f"  - {t}"); seen.add(t)
        msgs=s.get(f"{MOODLE_URL}/message/index.php",timeout=15)
        ms=BeautifulSoup(msgs.text,"html.parser")
        unread=ms.find_all(class_=lambda c:c and "unread" in c.lower())
        if unread: lines.append(f"  💬 {len(unread)} unread messages")
        return "\n".join(lines)
    except Exception as e:
        return f"📚 *Moodle* - error: {str(e)[:60]}"

def decode_h(v):
    try:
        parts=decode_header(v)
        out=[]
        for p,enc in parts:
            if isinstance(p,bytes): out.append(p.decode(enc or "utf-8",errors="replace"))
            else: out.append(p)
        return " ".join(out)
    except: return v

def check_gmail():
    if not GMAIL_ADDR or not GMAIL_PASS:
        return "📧 *Email* - credentials not set"
    try:
        m=imaplib.IMAP4_SSL("imap.gmail.com",993)
        m.login(GMAIL_ADDR,GMAIL_PASS)
        m.select("INBOX")
        yest=(date.today()-timedelta(days=1)).strftime("%d-%b-%Y")
        _,data=m.search(None,f'(UNSEEN SINCE "{yest}")')
        ids=data[0].split()
        if not ids:
            m.logout()
            return "📧 *Email* - no unread emails since yesterday"
        priority=[]
        other=0
        for eid in reversed(ids[-20:]):
            _,md=m.fetch(eid,"(RFC822)")
            msg=email.message_from_bytes(md[0][1])
            sender=decode_h(msg.get("From",""))
            subject=decode_h(msg.get("Subject","(no subject)"))
            if any(p in sender.lower() for p in PRIORITY_SENDERS):
                dm=re.search(r"@([\w.]+)",sender)
                src=dm.group(1) if dm else sender[:20]
                priority.append(f"  📩 {subject[:50]} - {src}")
            else: other+=1
        m.logout()
        lines=[f"📧 *Email* - {len(ids)} unread"]
        if priority:
            lines.append("  *Priority:*")
            lines.extend(priority[:6])
        if other: lines.append(f"  + {other} non-priority")
        return "\n".join(lines)
    except imaplib.IMAP4.error as e:
        return f"📧 *Email* - login failed: {str(e)[:60]}"
    except Exception as e:
        return f"📧 *Email* - error: {str(e)[:60]}"

def check_aura():
    lines=["🌐 *Aura Glossy*"]
    ses=requests.Session()
    ses.headers.update({"User-Agent":"Mozilla/5.0"})
    try:
        r=ses.get(AURA_URL,timeout=15)
        lines.append(f"  {'✅' if r.status_code==200 else '❌'} Homepage - {r.status_code} ({r.elapsed.total_seconds():.1f}s)")
    except Exception as e:
        lines.append(f"  ❌ Homepage unreachable: {str(e)[:40]}")
        return "\n".join(lines)
    for path,label in [("/signup","Signup"),("/login","Login")]:
        try:
            r2=ses.get(f"{AURA_URL}{path}",timeout=10)
            lines.append(f"  {'✅' if r2.status_code==200 else '⚠️'} {label} - {r2.status_code}")
        except: lines.append(f"  ⚠️ {label} - unreachable")
    lines.append("  ⚠️ Known risk: Firebase Auth in TikTok/Instagram browsers")
    if NETLIFY_TOKEN:
        try:
            nr=requests.get("https://api.netlify.com/api/v1/deploys?per_page=1",headers={"Authorization":f"Bearer {NETLIFY_TOKEN}"},timeout=10)
            if nr.status_code==200:
                d=nr.json()
                if d:
                    st=d[0].get("state","?")
                    lines.append(f"  {'✅' if st=='ready' else '⚠️'} Netlify - {st} ({d[0].get('created_at','')[:10]})")
        except: pass
    else:
        lines.append("  ℹ️ Netlify token not set")
    try:
        gr=requests.get(f"https://api.github.com/repos/{AURA_REPO}/actions/runs?per_page=1",headers={"Accept":"application/vnd.github+json"},timeout=10)
        if gr.status_code==200:
            runs=gr.json().get("workflow_runs",[])
            if runs:
                c=runs[0].get("conclusion","")
                n=runs[0].get("name","")[:25]
                lines.append(f"  {'✅' if c=='success' else '❌' if c=='failure' else '🔄'} GitHub Actions - {n} - {c or 'running'}")
    except: pass
    return "\n".join(lines)

def build_report(mem):
    now=datetime.now().strftime("%A, %d %B %Y - %H:%M")
    name=mem.get("identity",{}).get("name","Maya")
    parts=[f"🌅 *MORNING REPORT - {name}*\n_{now}_\n"]
    for label,fn in [("memory",lambda:check_memory(mem)),("moodle",check_moodle),("email",check_gmail),("aura",check_aura)]:
        try:
            r=fn()
            if r: parts.append(r+"\n")
        except Exception as e:
            parts.append(f"⚠️ {label} failed: {str(e)[:50]}\n")
    parts.append("_Sent by Life OS_")
    return "\n".join(parts)

def send(text):
    if not BOT_TOKEN:
        print("ERROR: TELEGRAM_BOT_TOKEN not set"); return False
    chunks=[text[i:i+4000] for i in range(0,len(text),4000)]
    for chunk in chunks:
        r=requests.post(TELEGRAM,json={"chat_id":CHAT_ID,"text":chunk,"parse_mode":"Markdown","disable_web_page_preview":True},timeout=15)
        if r.status_code!=200:
            r2=requests.post(TELEGRAM,json={"chat_id":CHAT_ID,"text":chunk},timeout=15)
            if r2.status_code!=200:
                print(f"Telegram error: {r2.text}"); return False
    print(f"Sent ({len(text)} chars)"); return True

def main():
    print(f"Morning Report - {datetime.now().isoformat()}")
    mem=load_memory()
    report=build_report(mem)
    print(report[:300])
    sys.exit(0 if send(report) else 1)

if __name__=="__main__":
    main()
