"use strict";

/**
 * extension wireless-hid
 * JavaScript Gnome extension for wireless keyboards and mice.
 *
 * @author Filip Izydorczyk
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

const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const DeviceIconHID = GObject.registerClass(
    {
        GTypeName: "DeviceIconHID",
    },
    class DeviceIconHID extends St.BoxLayout {
        _init(iconName) {
            super._init({ style_class: "wirelesshid-icon-container" });

            this.label = null;
            this.percentage = null;

            this.add_child(
                new St.Icon({
                    icon_name: iconName,
                    style_class: "system-status-icon",
                })
            );
            this.add_child(this._createLabel());
        }

        _createLabel() {
            this.label = new St.Label({
                text: _("%"),
                y_align: Clutter.ActorAlign.CENTER,
                x_align: Clutter.ActorAlign.END,
            });

            this.label.set_x_expand(false);

            return this.label;
        }

        updatePercentage(percentage) {
            this.percentage = percentage;

            if (this.label != null) {
                this.label.text = `${this.percentage || `--`}%`;
            }
        }
    }
);
