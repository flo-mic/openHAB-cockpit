#!/bin/bash

# Include all subscripts
# shellcheck source=/dev/null
for shfile in "${BASEDIR:-/opt/openhabian}"/functions/*.bash; do source "$shfile"; done

if is_pi && id -u pi &> /dev/null; then
  defaultUser="pi"
elif is_pi; then
  defaultUser="${username:-openhabian}"
fi

#first var is user, second one new password
echo "$defaultUser:$1" | chpasswd

