"use strict";

/**
 * extension wireless-hid
 * JavaScript Gnome extension for wireless keyboards and mice.
 *
 * @author Václav Chlumský
 * @copyright Copyright 2021, Václav Chlumský.
 */

/**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Václav Chlumský
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const UPower = imports.gi.UPowerGlib;
const Clutter = imports.gi.Clutter;
const PowerManagerProxy = Me.imports.powermanagerproxy;
const HID = Me.imports.hid;

/**
 * WirelessHID class. Provides widget.
 *
 * @class PhueMenu
 * @constructor
 * @return {Object} menu widget instance
 */
var WirelessHID = GObject.registerClass(
    {
        GTypeName: "WirelessHIDReloaded",
    },
    class WirelessHID extends PanelMenu.Button {
        /**
         * WirelessHID class initialization
         *
         * @method _init
         * @private
         */
        _init() {
            super._init(0.0, Me.metadata.name, false);

            this._devices = {};

            this._panelBox = new St.BoxLayout();
            this._panelBox.horizontal = true;

            this.add_child(this._panelBox);

            let uPowerProxy = new PowerManagerProxy.PowerManagerProxy(
                Gio.DBus.system,
                "org.freedesktop.UPower",
                "/org/freedesktop/UPower",
                (proxy, error) => {
                    if (error) {
                        log(`${Me.metadata.name} error: ${error.message}`);
                    }
                }
            );

            let dbusCon = uPowerProxy.get_connection();

            this._subscribeAdd = dbusCon.signal_subscribe(
                "org.freedesktop.UPower",
                "org.freedesktop.UPower",
                "DeviceAdded",
                null,
                null,
                0,
                this.discoverDevices.bind(this)
            );

            this._subscribeRemove = dbusCon.signal_subscribe(
                "org.freedesktop.UPower",
                "org.freedesktop.UPower",
                "DeviceRemoved",
                null,
                null,
                0,
                this.discoverDevices.bind(this)
            );

            this.discoverDevices();
        }

        newDevice(device) {
            this._devices[device.native_path] = new HID.HID(device);

            let icon = this._devices[device.native_path].createIcon();
            this._panelBox.add(icon);

            let item = new PopupMenu.PopupMenuItem(_("N/A"));

            item.remove_child(item.label);

            let name = new St.Label({
                text: `${this._devices[device.native_path].model}:`,
                y_align: Clutter.ActorAlign.CENTER,
                x_align: Clutter.ActorAlign.START,
            });
            name.set_x_expand(true);
            item.add(name);

            let label = this._devices[device.native_path].createLabel();
            item.add(label);

            this.menu.addMenuItem(item);

            this._devices[device.native_path].connect("destroy", () => {
                this._panelBox.remove_child(icon);
                icon.destroy();
                item.destroy();
            });
        }

        discoverDevices() {
            let upowerClient = UPower.Client.new_full(null);
            let devices = upowerClient.get_devices();

            /**
             * remove old devices
             */
            for (let j in this._devices) {
                let found = false;
                for (let i = 0; i < devices.length; i++) {
                    if (
                        this._devices[j].nativePath === devices[i].native_path
                    ) {
                        found = true;
                    }
                }

                if (!found) {
                    this._devices[j].destroy();
                    delete this._devices[j];
                }
            }

            /**
             * discover new devices
             */
            for (let i = 0; i < devices.length; i++) {
                if (
                    devices[i].kind != UPower.DeviceKind.KEYBOARD &&
                    devices[i].kind != UPower.DeviceKind.MOUSE &&
                    devices[i].kind != UPower.DeviceKind.GAMING_INPUT
                )
                    continue;

                let exist = false;
                for (let j in this._devices) {
                    if (
                        this._devices[j].nativePath === devices[i].native_path
                    ) {
                        exist = true;
                    }
                }

                if (!exist) {
                    this.newDevice(devices[i]);
                }
            }

            if (this._devices.length === 0) {
                this.visible = false;
            } else {
                this.visible = true;
            }
        }
    }
);
