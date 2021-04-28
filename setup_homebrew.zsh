#!/usr/bin/env zsh

echo "\n<<< Starting Homebrew Setup >>>\n"

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install httpie
brew install bat

brew install google-chrome-canary
brew install google-chrome
brew install firefox
brew install firefox-nightly
brew install firefox-developer-edition
brew install microsoft-edge
brew install microsoft-edge-dev
brew install affinity-designer-beta
brew install visual-studio-code
brew install visual-studio-code-insiders
brew install spotify
brew install dropbox
brew install dropbox-passwords
brew install tunnelbear
brew install figma