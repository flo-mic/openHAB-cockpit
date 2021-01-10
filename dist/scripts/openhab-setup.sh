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

# update openhabian.conf to have latest set of parameters
update_openhabian_conf

# apt/dpkg commands will not try interactive dialogs
export DEBIAN_FRONTEND="noninteractive"
 
#install openhab $1 (openHAB3 || openHAB2) $2 (reselase | testing | snapshot)
openhab_setup $1 $2
  
# shellcheck disable=SC2164
cd "$OLDWD"

# vim: filetype=sh