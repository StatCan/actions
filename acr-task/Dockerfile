FROM mcr.microsoft.com/azure-cli as runtime

LABEL "repository"="https://github.com/statcan/actions"
LABEL "maintainer"="Statistics Canada"

ADD entrypoint.sh /entrypoint.sh
RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]
