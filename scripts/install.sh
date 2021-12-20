#!/bin/bash

FILE=./wireless-hid-reloaded.zip

if test -f "$FILE"; then
    echo "Installing extension"
    gnome-extensions install --force "$FILE"
    echo "Extension installed"
else
    echo "$FILE not found. Make sure you built project and you are running script from project root directory."
fi
