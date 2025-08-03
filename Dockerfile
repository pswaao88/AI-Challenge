FROM ubuntu:latest
LABEL authors="pswaa"

ENTRYPOINT ["top", "-b"]
