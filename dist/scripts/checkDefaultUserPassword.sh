#!/bin/bash

# Include all subscripts
# shellcheck source=/dev/null
for shfile in "${BASEDIR:-/opt/openhabian}"/functions/*.bash; do source "$shfile"; done

if is_pi && id -u pi &> /dev/null; then
  defaultUser="pi"
  defaultPassword="raspberry"
elif is_pi; then
  defaultUser="${username:-openhabian}"
  defaultPassword="openhabian"
fi

originalPassword="$(grep -w "$defaultUser" /etc/shadow | cut -d: -f2)"
algo="$(echo "$originalPassword" | cut -d'$' -f2)"
introText="The default password was detected on your system! That is a serious security concern. Bad guys or malicious programs in your subnet are able to gain root access!\\n\\nPlease set a strong password by typing the command 'passwd ${defaultUser}'!"
salt="$(echo "$originalPassword" | cut -d'$' -f3)"
export algo defaultPassword salt
generatedPassword="$(perl -le 'print crypt("$ENV{defaultPassword}","\$$ENV{algo}\$$ENV{salt}\$")')"


if ! [[ $(id -u "$defaultUser") ]]; then 
  echo "OK (unknown user)";
  exit 0; 
fi

if [[ $generatedPassword == "$originalPassword" ]]; then
  if [ `sed -n "/^pi/p" /etc/passwd` ]
  then
      echo  "Default password detected! (pi)".  
  else
      echo  "Default password detected! (openhabian)".
  fi
else
  echo "OK"
fi