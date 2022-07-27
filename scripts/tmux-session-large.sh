
#! /bin/sh
backgroundSession="sketchy-background"
backgroundWindow="$backgroundSession:0"

session="sketchy"
window="$session:0"

if [ $(tmux attach -t "$session") ]; then
  exit 0
fi

cd ~/git/sketchy

# Tache de fond
tmux new-session -d -s "$backgroundSession"
tmux send-keys -t "$backgroundWindow.0" "npm run ctags:watch" C-m


# Affichage principal

tmux new-session -d -s "$session"

tmux split-window -t "$window"
tmux split-window -t "$window"
tmux select-layout -t "$window" main-vertical

tmux send-keys -t "$window.0" "npm run edit" C-m
tmux send-keys -t "$window.1" "npm run test:watch" C-m
tmux send-keys -t "$window.2" "npm run status:watch" C-m

tmux select-pane -t "$window.0"

tmux attach -t "$session"
