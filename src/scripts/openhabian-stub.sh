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

echo following fommand was called: 
echo $1 $2 $3 $4 $5
$1 $2 $3 $4 $5

# shellcheck disable=SC2164
cd "$OLDWD"

# vim: filetype=sh
