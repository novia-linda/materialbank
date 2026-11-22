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
        if line.startswith(prefix):
            rest=line[len(prefix):].split("/")
            # A project update OR an uploaded audio/video file can trigger transcription.
            if len(rest)>=2 and PROJECT_ID.fullmatch(rest[0]) and (
                rest[1]=="project.json" or
                (rest[1]=="media" and len(rest)==3 and MEDIA.fullmatch("media/"+rest[2]))
            ):
                found.add(rest[0])
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
    takes=[t for t in (project.get("takes") or []) if isinstance(t,dict)]
    voice=project.get("voice") or {}
    voice_path=voice.get("path") if isinstance(voice,dict) else None
    referenced=set()
    for take in takes:
        for media in (take.get("audio") or {},take.get("video") or {}):
            if isinstance(media,dict) and isinstance(media.get("path"),str):
                referenced.add(media["path"])
    if voice_path and voice_path not in referenced:
        takes.append({"id":"VOICE-MAIN","audio":{"path":voice_path}})
        referenced.add(voice_path)
    # Recover orphan media uploaded before project.json could be saved.
    # Do not modify project.json or discard files just because a partial upload occurred.
    media_dir=directory/"media"
    if media_dir.exists():
        for file in sorted(media_dir.iterdir()):
            rel="media/"+file.name
            if rel in referenced or not file.is_file() or not MEDIA.fullmatch(rel):
                continue
            if not file.name.startswith(("take-voice-","take-video-","voice-","camera-")):
                continue
            if media_file(directory,rel) is None:
                continue
            orphan_id="ORPHAN-"+hashlib.sha256(rel.encode("utf-8")).hexdigest()[:12]
            info={"path":rel}
            takes.append({"id":orphan_id,"audio":info} if file.suffix.lower() in (".m4a",".mp3",".wav",".ogg") else {"id":orphan_id,"video":info})
            referenced.add(rel)
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
        entries.append({"takeId":take_id,"mediaPath":candidate,"sha256":digest,"model":MODEL,"language":"sv","status":"ready","recoveredOrphan":take_id.startswith("ORPHAN-"),"text":" ".join(filter(None,texts)),"words":words})
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
