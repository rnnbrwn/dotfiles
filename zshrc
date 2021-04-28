echo "Hello from .zshrc"

# Set variables

# Syntax highlighting for man pages
export MANPAGER="sh -c 'col -bx | bat -l man -p'"

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
# Other surprises# Add Visual Studio Code (code)
export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"


# Write handy functions
function mkcd() {
    mkdir -p "$@" && cd "$_"
}

# Use ZSH plugins


