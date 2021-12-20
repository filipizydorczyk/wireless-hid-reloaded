# wireless-hid

![screenshot](https://github.com/vchlum/wireless-hid/blob/main/screenshot.png)

## Gnome Shell extension

wireless-hid shows the battery of the wireless keyboards, mice, and game controllers in percentage and colors. Multiple devices are supported. This extension is inspired by the Keyboard battery extension on e.g.o.

## Troubleshoot

Experiencing a problem, please check the tool upower -d. If you do not see the data/device with power, this extension will not recognize your device too.

## Developing

-   `scripts/release.sh` - build `.zip` extension file
-   `scripts/install.sh` - installs previously build extension in your gnome shell

At this point you need to reload gnome shell in order to be able to enable this extension. You can either log out and log in or you **alt + F2** and type `r`. After this you can enable extension by `gnome-extensions enable wireless-hid-reloaded@filip.izydorczyk.protonmail.com` or through extensions GUI in gnome.
