# KubeFlow DataBricks GitHub Action

The purpose of this action is to allow for automated deployments of [Kubeflow Pipelines](https://github.com/kubeflow/pipelines).

The action will collect the pipeline from a python file and compile it before uploading it to Kubeflow.

## Usage

### Example Workflow that uses this action

To compile a pipeline and upload it to kubeflow:

```yaml
name: Compile and Deploy Kubeflow pipeline
on: [push]

# Set environmental variables

jobs:
  build:
    runs-on: ubuntu-18.04
    steps:
    - name: checkout files in repo
      uses: actions/checkout@master

    - name: Submit Kubeflow pipeline
      id: kubeflow
      uses: sylus/kubeflow-github-action@master
      with:
        KUBEFLOW_URL: ${{ secrets.KUBEFLOW_URL }}
        X_AUTH_TOKEN: ${{ secrets.X_AUTH_TOKEN }}
        PIPELINE_CODE_PATH: "example_pipeline.py"
        PIPELINE_FUNCTION_NAME: "flipcoin_pipeline"
        PIPELINE_PARAMETERS_PATH: "parameters.yaml"
        EXPERIMENT_NAME: "Default"
        RUN_PIPELINE: False
        VERSION_GITHUB_SHA: False

```

If you also would like to run the pipeline you can use the following:

```yaml
name: Compile, Deploy and Run on Kubeflow
on: [push]

# Set environmental variables

jobs:
  build:
    runs-on: ubuntu-18.04
    steps:
    - name: checkout files in repo
      uses: actions/checkout@master

    - name: Submit and Run the Kubeflow pipeline
      id: kubeflow
      uses: sylus/kubeflow-github-action@master
      with:
        KUBEFLOW_URL: ${{ secrets.KUBEFLOW_URL }}
        X_AUTH_TOKEN: ${{ secrets.X_AUTH_TOKEN }}
        PIPELINE_CODE_PATH: "example_pipeline.py"
        PIPELINE_FUNCTION_NAME: "flipcoin_pipeline"
        PIPELINE_PARAMETERS_PATH: "parameters.yaml"
        EXPERIMENT_NAME: "Default"
        RUN_PIPELINE: True
        VERSION_GITHUB_SHA: False

```

### Mandatory inputs

1) KUBEFLOW_URL: The URL to your kubeflow deployment for example "https://kubeflow.example.ca/pipeline"
2) X_AUTH_TOKEN: The X-Auth-Token header which can be grabbed from cookies section for the KubeFlow Dashboard
3) PIPELINE_CODE_PATH: The full path to the python file containing the pipeline
4) PIPELINE_FUNCTION_NAME: The name of the pipeline function
5) PIPELINE_PARAMETERS_PATH: The location of the pipeline parameters file
6) EXPERIMENT_NAME: The name of the kubeflow experiment within which the pipeline should run
7) RUN_PIPELINE: If you like to also run the pipeline after it is deployed this must be set to "True"
8) VERSION_GITHUB_SHA: If the pipeline containers are versioned with the github hash

## Acknowledgements

Extended from the amazing work done by Niklas Hansson over at [KubeFlow GitHub Action](https://github.com/NikeNano/kubeflow-github-action)
