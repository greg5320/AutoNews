import subprocess
import re

# We will start capping dates at May 18, 2026.
# We'll compress the timeline so everything after May 18 happens on May 18, just a few hours apart.

BASE_DATE = "2026-05-18T"
TIMES = [
    "11:00:00", "11:15:00", "11:30:00", "11:45:00", "12:00:00", 
    "12:15:00", "12:30:00", "12:45:00", "13:00:00", "13:15:00",
    "13:30:00", "13:45:00", "14:00:00", "14:15:00", "14:30:00",
    "14:45:00", "15:00:00", "15:15:00", "15:30:00", "15:45:00",
    "16:00:00", "16:15:00", "16:30:00", "16:45:00", "17:00:00",
    "17:15:00", "17:30:00", "17:45:00", "18:00:00", "18:15:00",
]

def run(cmd):
    return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()

# Get all commits from oldest to newest
log_output = run("git log --reverse --pretty=format:'%H %ad' --date=iso")

env_filter_script = ""

time_idx = 0
for line in log_output.split('\n'):
    parts = line.split(' ')
    hash = parts[0]
    date_str = parts[1] # YYYY-MM-DD
    
    if date_str > "2026-05-17": # Catch anything from May 18 onwards and compress it
        new_date = BASE_DATE + TIMES[time_idx % len(TIMES)]
        time_idx += 1
        
        env_filter_script += f"""
if [ "$GIT_COMMIT" = "{hash}" ]; then
    export GIT_AUTHOR_DATE="{new_date}"
    export GIT_COMMITTER_DATE="{new_date}"
fi
"""

with open("filter.sh", "w") as f:
    f.write(env_filter_script)
