echo "Hello from .zshrc"

# Set variables


# Change ZSH options


# Create aliases
alias ls="ls -lAFh"
alias db="cd ~/dropbox; ls -l"
alias cd..="cd .."
alias work="cd ~/work"
alias personal="cd ~/personal"

# Customise prompt(s)
PROMPT='
%1~ %L %# '

RPROMPT='%*'

# Add locations to $PATH variable


# Write handy functions
function mkcd() {
    mkdir -p "$@" && cd "$_"
}

# Use ZSH plugins


# Other surprises