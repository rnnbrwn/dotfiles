echo "Hello from .zshrc"

# Set variables
export HOMEBREW_CASK_OPTS="--no-quarantine"

# Create aliases
alias ls="eza -laFh --git"
alias eza="eza -laFh --git"
alias exatree="exa --tree --level=2"
alias db="cd ~/dropbox; ls -l"
alias work="cd ~/work"
alias personal="cd ~/personal"
alias man=batman

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
%B%F{33}%1~%f%b %F{67}%L%f %F{yellow}$(git_branch_name)%f '

RPROMPT='%*'

# Add locations to $PATH variable
# Other surprises# Add Visual Studio Code (code)
export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"


# Write handy functions
function mkcd() {
    mkdir -p "$@" && cd "$_"
}

# Use ZSH plugins


