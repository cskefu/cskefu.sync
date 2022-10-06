FROM cskefu/node:v16.17.0
MAINTAINER Hai Liang Wang <hai@chatopera.com>

ARG DEBIAN_FRONTEND=noninteractive

# COPY assets/source.list /etc/apt/sources.list

RUN apt-get update && \
    apt-get install --no-install-recommends -y zip unzip vim ack-grep \
    tzdata iputils-ping zip unzip vim-tiny libfontconfig1 libfreetype6 && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    DEBIAN_FRONTEND=noninteractive dpkg-reconfigure --frontend noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

# Set the locale
ENV LANG C.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL C.UTF-8
ENV TZ Asia/Shanghai

COPY app /opt/app
WORKDIR /opt/app

# version bypass bless
RUN cd /opt/app && \
   npm install --production --registry=https://registry.npm.taobao.org

ENTRYPOINT ["/bin/sh"]
CMD ["npm", "start"]
EXPOSE 8201
