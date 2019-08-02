#!/bin/bash

sudo iwlist wlan0 scan | node wifi-scan-parse.js
