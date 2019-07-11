FROM ubuntu:16.04
MAINTAINER Ben Lu

RUN apt-get update;\
apt-get install -y git sudo
RUN git clone https://github.com/luben3485/WISE-PaaS-security.git
RUN sudo apt-get update;\
     sudo apt-get -y upgrade;\
     sudo apt-get install -y python3 python3-pip

RUN mkdir /WISE-PaaS-security/arachni/system/arachni-ui-web/tmp
RUN sudo pip3 install flask requests
EXPOSE 8080
WORKDIR /WISE-PaaS-security/arachni/web
CMD ./start.sh
