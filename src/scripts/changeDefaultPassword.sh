#!/bin/bash
#first var is user, second one new password
echo "$1:$2" | chpasswd
