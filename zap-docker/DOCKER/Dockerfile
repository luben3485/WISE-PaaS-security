FROM owasp/zap2docker-stable:latest
MAINTAINER Peter Tsai
USER root
ENV ZAP_KEY hahaha

RUN apt-get update;\
apt-get install -y git sudo 
RUN sudo apt-get update;\
     sudo apt-get -y upgrade;\
     sudo apt-get install -y python3 python3-pip

RUN sudo mkdir -p /WISE-PaaS-security/zap
RUN sudo pip3 install flask requests
EXPOSE 8080
CMD ./zap.sh -cmd -addonupdate > zapoutput.out && ./zap.sh -daemon -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.key=\${ZAP_KEY} -host 0.0.0.0 -port 8080 >> zapoutput.out 2>&1
#WORKDIR /WISE-PaaS-security/zap
#CMD echo "Hello Zap"

