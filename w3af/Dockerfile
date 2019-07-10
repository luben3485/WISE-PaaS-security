FROM ubuntu:16.04

RUN apt-get update;\
apt-get install -y git sudo npm
RUN git clone https://github.com/luben3485/WISE-PaaS-security.git

WORKDIR /WISE-PaaS-security/w3af
RUN sudo apt-get update;\
	sudo apt-get -y upgrade;\
	sudo apt-get install -y python python-pip ;\
	sudo apt-get install -y python3 python3-pip
RUN sudo tmp/w3af_dependency_install.sh
RUN sudo ln -s /usr/bin/nodejs /usr/bin/node
RUN sudo pip install werkzeug==0.12
RUN sudo pip3 install flask requests 
WORKDIR web
CMD ./start.sh
