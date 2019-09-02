# Gamble Bot

This repository contains code for a bot built by Spencer Kasper that is intended to read messages from a Discord server and reply with messages that are games.  It keeps track of points and provides functionality to view rankings, gift points, and more.  Currently, the only game is a slots game.

## Install

Fork the repo into whatever repository you want to run this from and run the command ``npm install`` in order to install all of the dependencies.  This bot is intended to run on Node.js.  

## Start the Bot

To start the bot for testing, ``cd`` into the directory that you cloned the repo in and run ``node bot.js``

If you want to run the bot in a persistent mode on the machine you are running it on, run the command ``sudo nohup node bot.js &``.  This will run the program in the background and persist it.

## Find and Kill the Bot When Persistent
To find the bot's process id, type ``ps aux | grep -i "bot.js"`` from the command prompt and you should get a list of process IDs that are associated with the commands that kicked them off.  Find the ``sudo nohup node bot.js &`` command and get the associated process ID.  Next, type ``sudo kill {insert process ID without curly braces}``. Ex: ``sudo kill 29474``

## Discord Setup
Go to https://discordapp.com/developers/applications/ and create a new app called ``gamble-bot-dev`` or something similar to that.  This will be your test bot that you add to your test server.  Under ``Settings``, go to ``Bot`` and create a new bot.  Copy your token and then go to the ``OAuth2`` tab.  Under ``Scopes``, choose ``bot`` and give all of the text permissions.

Paste your token in the working directory of the bot into a file called ``Auth.json``.  When you run locally, it will login to discord using this key and know that this is your dev bot.

Go through the same steps to set up your production bot.  All you have to do is use the production bot's token in your ``Auth.json`` file that is on the production server.