#!/bin/bash

sudo iwlist wlan0 scan > iwlist.out
node wifi-scan-parse.js < iwlist.out
