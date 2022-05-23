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
const GObject = imports.gi.GObject;
const UPower = imports.gi.UPowerGlib;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const DeviceIconHID = Me.imports.deviceiconhid;
const Clutter = imports.gi.Clutter;
const PowerManagerProxy = Me.imports.powermanagerproxy;

var HID = GObject.registerClass(
    {
        Signals: {
            update: {},
            destroy: {},
        },
    },
    class HID extends GObject.Object {
        _init(device) {
            super._init();

            this.device = device;
            this.model = device.model;
            this.kind = device.kind;
            this.nativePath = device.native_path;
            this.icon = null;
            this.label = null;
            this._proxy = null;

            this._createProxy();
        }

        _createProxy() {
            this._proxy = new PowerManagerProxy.PowerManagerProxy(
                Gio.DBus.system,
                "org.freedesktop.UPower",
                this.device.get_object_path(),
                (p, error) => {
                    if (error) {
                        log(`${Me.metadata.name} error: ${error.message}`);
                        return;
                    }

                    this._proxy.connect(
                        "g-properties-changed",
                        this._update.bind(this)
                    );

                    this._update();
                }
            );
        }

        getBattery() {
            return this.device.percentage;
        }

        _update() {
            this.percentage = this.getBattery();

            if (this.label !== null) {
                this.label.text = `${this.percentage}%`;
            }

            if (this.icon !== null) {
                this.icon.updatePercentage(this.percentage);
            }

            this.emit("update");
        }

        createIcon() {
            let iconName;

            if (this.kind === UPower.DeviceKind.KEYBOARD) {
                iconName = "input-keyboard-symbolic";
            } else if (this.kind === UPower.DeviceKind.MOUSE) {
                iconName = "input-mouse-symbolic";
            } else if (this.kind === UPower.DeviceKind.GAMING_INPUT) {
                iconName = "input-gaming-symbolic";
            }

            this.icon = new DeviceIconHID.DeviceIconHID(iconName);

            this._update();

            return this.icon;
        }

        createLabel() {
            this.label = new St.Label({
                text: _("%"),
                y_align: Clutter.ActorAlign.CENTER,
                x_align: Clutter.ActorAlign.END,
            });

            this.label.set_x_expand(false);

            this._update();

            return this.label;
        }

        destroy() {
            this.emit("destroy");
        }
    }
);
