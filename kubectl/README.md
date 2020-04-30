# kubectl Action

An action that helps you deploy to a Kubernetes cluster.

## Inputs

### kubeconfig context

```sh
cat .kube/config | base64
```

## Usage

## Kustomize

```yaml
- name: Kustomize
  uses: statcan/actions/kubectl@master
  with:
    args: kustomize ...
```

## Deploy

```yaml
- name: Deploy
  uses: statcan/actions/kubectl@master
  with:
    kubeconfig: ${{ secrets.KUBECONFIG }}
    args: apply -f deployment.yaml
```
