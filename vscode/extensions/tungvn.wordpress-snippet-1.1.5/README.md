# WordPress Snippet
==================

This is a collection of WordPress snippets and autocompletions for Visual Studio Code

- License: GNU/GPL
- Version: 1.1.5
- Extension URI: https://gitlab.com/tungvn/wordpress-snippet

### Features

Autocomplete for:

    WP version : 4.6.1

    Functions          : 2884
    Constants/Classes  :  191
    
### Install instructions

Install via Extension Marketplace
- Open Command on Visual Studio Code (Ctrl+Shift+P on Windows or Cmd+Shift+P on Mac/OSX)
- > ext install wordpress-snippet
- Wait until install complete and restart VS Code

Install by Packaged Extension (.vsix)
- You can manually install an VS Code extension packaged in a .vsix file. Simply install using the VS Code command line providing the path to the .vsix file.
- >code extension_name.vsix
- The extension will be installed under your user .vscode/extensions folder. You may provide multiple .vsix files on the command line to install multiple extensions at once.
- You can also install a .vsix by opening the file from within VS Code. Run File > Open File... or Ctrl+O and select the extension .vsix.

### Changelogs
- Version 1.1.5: Fix wrong syntax bugs
- Version 1.1.4: Add parameter $version at wp_enqueue_* function and capital WordPress. Thanks [Blake Wilson](https://gitlab.com/blakewilson) and [David G. Johnson](https://gitlab.com/TheDavidJohnson) for merge requests.
- Version 1.1.2: Remove unnecessary command
- Version 1.1.1: Fix a bug which show unnecessary characters on functions
- Version 1.1: Update functions snippet up to WordPress 4.6.1
- Version 0.8: First commit. Update functions, constant and classes from WordPress 3.7

### Special thanks
- [purplefish32](https://github.com/purplefish32) with https://github.com/purplefish32/sublime-text-2-wordpress