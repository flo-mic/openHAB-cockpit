# openHAB-cockpit

**This project is in development. Please use mit care and only in test mode for now.**

The openHAB-cockpit is an web application which allows the management of the [openHABian](https://github.com/openhab/openhabian) installation. It offers users the possibility to control their server from any browser without the need to use a terminal/ssh connection. Due to this it is a ideal solution for non technical users that use openHAB. 

This application requires an installation of [openHABian](https://github.com/openhab/openhabian) in order to work.

The openHAB-cockpit is based on the [cockpit-project](https://github.com/cockpit-project/cockpit). The cockpit-project offers already a great web administration for linux systems. It includes e.g. network and storage management. You can view the system status, check for updates and also use a https based terminal connection.

The openHAB-cockpit is an extension for this cockpit which acts on top and uses predefined api interfaces to communicate with the cockpit-project core. This design is ideal to minimize the development effort and keep the maintainability.

# Installing

As first step we need to install cockpit itself. We will install this from an abckport repository because we are running on debian (Buster).

1. Add debian backports repository
```
echo 'deb http://deb.debian.org/debian buster-backports main' | sudo tee /etc/apt/sources.list.d/backports.list
```
2. Add apt keys for the repository
```
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 648ACFD622F3D138
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 04EE7237B7D453EC
```
3. Install cockpit
```
sudo apt update
sudo apt install -t buster-backports cockpit
```

Now we can install the cockpit addon for openHAB. If you want to update the addon run the below commands again. There is no apt update or automatic update at the moment.

1. Clone the repo
```
git clone https://github.com/flo-mic/openHAB-cockpit.git
```
2. Copy the required files
```
sudo mkdir -p /usr/share/cockpit/openhab
sudo cp -r openHAB-cockpit/dist/* /usr/share/cockpit/openhab
sudo mkdir -p /usr/share/metainfo/
sudo cp openHAB-cockpit/org.cockpit-project.openhab.metainfo.xml /usr/share/metainfo/
```
3. Remove the temporary folder
```
sudo rm -r openHAB-cockpit/
```

You can not access your cockpit under **https://openhabiandevice:9090**


# Further reading about the cockpit-project

 * The [cockpit-project webpage](http://cockpit-project.org)
 * The [Starter Kit announcement](http://cockpit-project.org/blog/cockpit-starter-kit.html)
   blog post explains the rationale for this project.
 * [Cockpit Deployment and Developer documentation](http://cockpit-project.org/guide/latest/)
 * [Make your project easily discoverable](http://cockpit-project.org/blog/making-a-cockpit-application.html)
