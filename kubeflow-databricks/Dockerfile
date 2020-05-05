FROM python:3.7-stretch

LABEL "name"="Helm action"
LABEL "maintainer"="William Hearn <william.hearn@canada.ca>"
LABEL "version"="1.0.0"

LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="green"
LABEL "com.github.actions.name"="Submit Kubeflow Pipeline From GitHub"
LABEL "com.github.actions.description"="This is an Action to submit a Kubeflow Pipeline."

COPY . .

RUN chmod +x /entrypoint.sh

RUN pip install -r requirements_kfp.txt

RUN pip install -r requirements_kfp_azure_databricks.txt

ENTRYPOINT ["/entrypoint.sh"]
