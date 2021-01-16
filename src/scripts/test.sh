#!/bin/bash

#Enable debug
#debugmode="maximum"
#DEBUGMAX=1

# Check config file
CONFIGFILE="/etc/openhabian.conf"
if ! [[ -f $CONFIGFILE ]]; then
  cp /opt/openhabian/openhabian.conf.dist "$CONFIGFILE"
fi

# Include all subscripts
# shellcheck source=/dev/null
for shfile in "${BASEDIR:-/opt/openhabian}"/functions/*.bash; do source "$shfile"; done

# avoid potential crash when deleting directory we started from
OLDWD="$(pwd)"
cd /opt || exit 1

# apt/dpkg commands will not try interactive dialogs
export DEBIAN_FRONTEND="noninteractive"
test=openhab3_is_installed
echo $test
if openhab3_is_installed; then echo hello; else echo 1; fi
if openhab2_is_installed; then echo hello; else echo 1; fi

# shellcheck disable=SC2164
cd "$OLDWD"

# vim: filetype=sh
