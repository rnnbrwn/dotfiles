#!/usr/bin/env zsh

echo "\n<<< Starting Homebrew Setup >>>\n"

if exists brew; then
    echo "\n<<< Brew exists, skipping install >>>\n"
else
    echo "\m<<< Brew doesn't exist, continuing with install >>>\n"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi


brew bundle --verbose