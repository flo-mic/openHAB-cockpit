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

# apt/dpkg commands will not try interactive dialogs
export DEBIAN_FRONTEND="noninteractive"
 
if [[ openhab2_is_installed == 1 ]]
then
  echo openHAB2
else
  echo openHAB3
fi
  
# vim: filetype=sh