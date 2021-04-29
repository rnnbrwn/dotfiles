echo "Hello from .zshrc"

# Set variables

# Syntax highlighting for man pages
export MANPAGER="sh -c 'col -bx | bat -l man -p'"
export HOMEBREW_CASK_OPTS="--no-quarantine"

# Change ZSH options


# Create aliases
# alias ls="ls -lAFh"
alias ls="exa -laFh --git"
alias exa="exa -laFh --git"
alias exatree="exa --tree --level=2"
alias db="cd ~/dropbox; ls -l"
alias cd..="cd .."
alias work="cd ~/work"
alias personal="cd ~/personal"

# Customise prompt(s)

function git_branch_name()
{
  branch=$(git symbolic-ref HEAD 2> /dev/null | awk 'BEGIN{FS="/"} {print $NF}')
  if [[ $branch == "" ]];
  then
    :
  else
    echo '- ('$branch')'
  fi
}

# Enable substitution in the prompt.
setopt prompt_subst

# Config for prompt. PS1 synonym.
# prompt='%2/ $(git_branch_name) > '


PROMPT='
%1~ %L %# $(git_branch_name) '

RPROMPT='%*'

# Add locations to $PATH variable
# Other surprises# Add Visual Studio Code (code)
export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"


# Write handy functions
function mkcd() {
    mkdir -p "$@" && cd "$_"
}

# Use ZSH plugins


