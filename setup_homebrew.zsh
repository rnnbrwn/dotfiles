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

brew install affinity-designer-beta --no-quarantine
brew install figma --no-quarantine

echo "\n<<< Downloading Development Tools >>>\n"

brew install visual-studio-code --no-quarantine
brew install visual-studio-code-insiders --no-quarantine

echo "\n<<< Downloading Miscellaneous Tools >>>\n"

brew install spotify --no-quarantine
brew install dropbox --no-quarantine
brew install dropbox-passwords --no-quarantine
brew install tunnelbear --no-quarantine
brew install alfred --no-quarantine
brew install discord --no-quarantine