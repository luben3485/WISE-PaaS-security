FROM ubuntu:16.04

MAINTAINER Ben Lu

ENV SERVER_ROOT_PASSWORD arachni
ENV ARACHNI_USERNAME arachni
ENV ARACHNI_PASSWORD password
ENV DB_ADAPTER sqlite

RUN apt-get update

RUN apt-get -y install \
    openssh-server \
    wget \
    curl \
    supervisor \
    unzip

RUN mkdir /var/run/sshd && \
    mkdir -p /var/log/supervisor && \
    mkdir -p /etc/supervisor/conf.d

RUN sed -ri 's/^PermitRootLogin\s+.*/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -ri 's/UsePAM yes/#UsePAM yes/g' /etc/ssh/sshd_config

#COPY "$PWD"/${ARACHNI_VERSION}-linux-x86_64.tar.gz ${ARACHNI_VERSION}-linux-x86_64.tar.gz
RUN wget https://github.com/Arachni/arachni/releases/download/v1.5.1/${ARACHNI_VERSION}-linux-x86_64.tar.gz && \
    tar xzvf ${ARACHNI_VERSION}-linux-x86_64.tar.gz && \
    mv ${ARACHNI_VERSION}/ /usr/local/arachni && \
    rm -rf *.tar.gz

COPY "$PWD"/files /
EXPOSE 8080

CMD entrypoint.sh
