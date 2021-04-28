#!/usr/bin/env zsh

echo "\n<<< Starting Homebrew Setup >>>\n"

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install httpie
brew install bat


echo "\n<<< Downloading Browsers >>>\n"

brew install google-chrome-canary --no-quarantine
brew install google-chrome --no-quarantine
brew install firefox --no-quarantine
brew install firefox-nightly --no-quarantine
brew install firefox-developer-edition --no-quarantine
brew install microsoft-edge --no-quarantine
brew install microsoft-edge-dev --no-quarantine

echo "\n<<< Downloading Design Tools >>>\n"

brew install affinity-designer-beta
brew install figma

echo "\n<<< Downloading Development Tools >>>\n"

brew install visual-studio-code
brew install visual-studio-code-insiders

echo "\n<<< Downloading Miscellaneous Tools >>>\n"

brew install spotify
brew install dropbox
brew install dropbox-passwords
brew install tunnelbear
brew install --no-quarantine alfred