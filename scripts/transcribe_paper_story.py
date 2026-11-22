#!/usr/bin/env python3
"""Word-level Swedish transcripts for Paper Story Studio; never edits words.json."""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path("skapa-video/paper-story-studio/projects")
PROJECT_ID=re.compile(r"^PROJ-[A-Z0-9_-]{1,36}$")
MEDIA=re.compile(r"^media/[A-Za-z0-9._-]+\.(?:m4a|mp4|webm|mp3|wav|ogg)$",re.I)
MODEL="small"

def changed_projects(root):
    try:
        changed=subprocess.check_output(["git","show","--pretty=format:","--name-only","HEAD"],cwd=root,text=True).splitlines()
    except (FileNotFoundError,subprocess.CalledProcessError):
        return []
    prefix=ROOT.as_posix()+"/"
    found=set()
    for line in changed:
        if line.startswith(prefix) and line.endswith("/project.json"):
            name=line[len(prefix):].split("/")[0]
            if PROJECT_ID.fullmatch(name):found.add(name)
    return sorted(found)

def media_file(directory,relative):
    if not isinstance(relative,str) or not MEDIA.fullmatch(relative):return None
    path=(directory/relative).resolve()
    if path.parent!=(directory/"media").resolve() or not path.is_file() or path.stat().st_size>40*1024*1024:return None
    return path

def run(directory,load_model=None):
    project_file=directory/"project.json"
    if not project_file.is_file():return False
    project=json.loads(project_file.read_text(encoding="utf-8"))
    if project.get("id")!=directory.name:raise ValueError("Unexpected project ID")
    dest=directory/"transcript.json"
    try: previous=json.loads(dest.read_text(encoding="utf-8"))
    except (OSError,ValueError):previous={}
    cached={str(x.get("takeId")):x for x in previous.get("takes",[]) if isinstance(x,dict)}
    entries=[];model=None
    takes=list(project.get("takes") or [])
    # Also support a voice-only recording made in the desktop editor.
    voice=project.get("voice") or {}
    voice_path=voice.get("path") if isinstance(voice,dict) else None
    linked={str((t.get("audio") or {}).get("path") or (t.get("video") or {}).get("path")) for t in takes if isinstance(t,dict)}
    if voice_path and voice_path not in linked:
        takes.append({"id":"VOICE-MAIN","audio":{"path":voice_path}})
    for take in takes:
        if not isinstance(take,dict) or not take.get("id"):continue
        take_id=str(take["id"])
        audio=take.get("audio") or {}
        video=take.get("video") or {}
        candidate=None
        path=None
        for possible in (audio.get("path"),video.get("path")):
            candidate=possible
            path=media_file(directory,possible)
            if path is not None:
                break
        if path is None:
            print("Skip missing or unsupported recording",take_id,flush=True)
            continue
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        old=cached.get(take_id)
        if old and old.get("sha256")==digest and old.get("model")==MODEL and old.get("status")=="ready":
            entries.append(old);continue
        if model is None:
            if load_model is None:
                from faster_whisper import WhisperModel
                load_model=lambda:WhisperModel(MODEL,device="cpu",compute_type="int8",cpu_threads=2)
            model=load_model()
        segments,info=model.transcribe(str(path),language="sv",beam_size=3,word_timestamps=True,vad_filter=True,condition_on_previous_text=False)
        texts=[];words=[]
        for segment in segments:
            texts.append(str(segment.text).strip())
            for token in segment.words or []:
                if token.start is None or token.end is None or token.end<=token.start:continue
                value=str(token.word).strip()
                if value:words.append({"text":value,"start":round(float(token.start),2),"end":round(float(token.end),2)})
        entries.append({"takeId":take_id,"mediaPath":candidate,"sha256":digest,"model":MODEL,"language":"sv","status":"ready","text":" ".join(filter(None,texts)),"words":words})
    if entries==previous.get("takes",[]):
        print("No new takes in",directory.name)
        return False
    result={"version":1,"projectId":directory.name,"language":"sv","model":MODEL,"wordTimestampsAreApproximate":True,"updatedAt":datetime.now(timezone.utc).isoformat(),"takes":entries}
    dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Saved",dest,"with",sum(len(t["words"]) for t in entries),"words",flush=True)
    return True

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--project-id",default="")
    args=parser.parse_args()
    projects=[args.project_id.upper()] if args.project_id else changed_projects(Path.cwd())
    for project_id in projects:
        if not PROJECT_ID.fullmatch(project_id):raise ValueError("Invalid project ID")
        run(ROOT/project_id)
    if not projects:print("No changed projects.")

if __name__=="__main__":main()
