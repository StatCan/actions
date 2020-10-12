// Initially developed by https://github.com/deliverybot/helm/blob/master/index.js

const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const fs = require("fs");
const util = require("util");
const Mustache = require("mustache");

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const required = {
  required: true
};

/**
 * The deployment status
 *
 * @param {string} state
 */
async function status(state) {
  try {
    const context = github.context;
    const deployment = context.payload.deployment;
    const token = core.getInput("token");

    if (!token || !deployment) {
      core.debug("The deployment status is not set");
      return;
    }

    const client = new github.GitHub(token);
    const url = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`;

    await client.repos.createDeploymentStatus({
      ...context.repo,
      deployment_id: deployment.id,
      state,
      log_url: url,
      target_url: url,
      headers: {
        accept: 'application/vnd.github.ant-man-preview+json'
      }
    });
  } catch (error) {
    core.warning(`Failed to set the deployment status: ${error.message}`);
  }
}

function getInput(name, options) {
  const context = github.context;
  const deployment = context.payload.deployment;
  let value = core.getInput(name.replace("_", "-"), {
    ...options,
    required: false
  });
  if (deployment) {
    if (deployment[name]) val = deployment[name];
    if (deployment.payload[name]) val = deployment.payload[name];
  }
  if (options && options.required && !value) {
    throw new Error(`Input is required and was not entered: ${name}`);
  }
  return value;
}

function getReleaseName(name, track) {
  if (track !== "stable") {
    return `${name}-${track}`;
  }
  return name;
}

function getValues(values) {
  if (!values) {
    return "{}";
  }
  if (typeof values === "object") {
    return JSON.stringify(values);
  }
  return values;
}

function getValueFiles(files) {
  let fileList;
  if (typeof files === "string") {
    try {
      fileList = JSON.parse(files);
    } catch (err) {
      fileList = [files];
    }
  } else {
    fileList = files;
  }
  if (!Array.isArray(fileList)) {
    return [];
  }
  return fileList.filter(f => !!f);
}

function getSecrets(secrets) {
  if (typeof secrets === "string") {
    try {
      return JSON.parse(secrets);
    } catch (err) {
      return secrets;
    }
  }
  return secrets;
}

/**
 * Renders data into the list of provided files
 *
 * @param {Array<string>} files
 * @param {any} data
 */
function renderFiles(files, data) {
  core.debug(
    `Rendering value files [${files.join(",")}] with: ${JSON.stringify(data)}`
  );
  const tags = ["${{", "}}"];
  const promises = files.map(async file => {
    const content = await readFile(file, {
      encoding: "utf8"
    });
    const rendered = Mustache.render(content, data, {}, tags);
    await writeFile(file, rendered);
  });
  return Promise.all(promises);
}

/**
 * A delete command that works for both helm 2 and 3
 *
 * @param {string} helm
 * @param {string} namespace
 * @param {string} tillerNamespace
 * @param {string} release
 */
function deleteCmd(helm, namespace, tillerNamespace, release) {
  if (helm === "helm3") {
    return ["delete", "-n", namespace, release];
  }
  return ["delete", "--tiller-namespace", tillerNamespace, "--purge", release];
}

/**
 * Executes the Helm deployment
 *
 */
async function run() {
  try {
    const context = github.context;

    await status("pending");

    const track = getInput("track") || "stable";
    const releaseName = getInput("release", required);
    const chart = getInput("chart", required);
    const chartVersion = getInput("chartVersion");
    const version = getInput("version");
    const release = getReleaseName(releaseName, track);
    const namespace = getInput("namespace", required);
    const tillerNamespace = getInput("tillerNamespace") || "kube-system";
    const dryRun = core.getInput("dryRun");
    const task = getInput("task");
    const values = getValues(getInput("values"));
    const valueFiles = getValueFiles(getInput("valueFiles"));
    const secrets = getSecrets(core.getInput("secrets"));
    const removeCanary = getInput("removeCanary");
    const helm = getInput("helm") || "helm";
    const timeout = getInput("timeout");
    const repository = getInput("repository");

    core.debug(`param: track = "${track}"`);
    core.debug(`param: releaseName = "${releaseName}"`);
    core.debug(`param: chart = "${chart}"`);
    core.debug(`param: chartVersion = "${chartVersion}"`);
    core.debug(`param: version = "${version}"`);
    core.debug(`param: release = "${release}"`);
    core.debug(`param: namespace = "${namespace}"`);
    core.debug(`param: tillerNamespace = "${tillerNamespace}"`);
    core.debug(`param: dryRun = "${dryRun}"`);
    core.debug(`param: task = "${task}"`);
    core.debug(`param: values = "${values}"`);
    core.debug(`param: valueFiles = "${JSON.stringify(valueFiles)}"`);
    core.debug(`param: secrets = "${JSON.stringify(secrets)}"`);
    core.debug(`param: removeCanary = ${removeCanary}`);
    core.debug(`param: helm = ${helm}`);
    core.debug(`param: timeout = "${timeout}"`);
    core.debug(`param: repository = "${repository}"`);

    const opts = {
      env: {
        KUBECONFIG: process.env.KUBECONFIG,
      }
    };

    const args = [
      "upgrade",
      release,
      chart,
      "--install",
      "--wait",
      "--atomic",
      `--namespace=${namespace}`,
      `--tiller-namespace=${tillerNamespace}`,
      '--home=/root/.helm/',
    ];

    if (dryRun) args.push("--dry-run");
    if (releaseName) args.push(`--set=app.name=${releaseName}`);
    if (version) args.push(`--set=app.version=${version}`);
    if (chartVersion) args.push(`--version=${chartVersion}`);
    if (timeout) args.push(`--timeout=${timeout}`);
    if (repository) args.push(`--repo=${repository}`);

    valueFiles.forEach(f => args.push(`--values=${f}`));
    args.push("--values=./values.yml");

    if (track === "canary") {
      args.push("--set=service.enabled=false", "--set=ingress.enabled=false");
    }

    if (process.env.KUBECONFIG_FILE) {
      opts.env.KUBECONFIG = "./kubeconfig.yml";
      await writeFile(opts.env.KUBECONFIG, process.env.KUBECONFIG_FILE);
    }

    await writeFile("./values.yml", values);

    core.debug(`env: KUBECONFIG="${opts.env.KUBECONFIG}"`);

    await renderFiles(valueFiles.concat(["./values.yml"]), {
      secrets,
      deployment: context.payload.deployment,
    });

    if (removeCanary) {
      core.debug(`Removing canary ${releaseName}-canary`);
      await exec.exec(helm, deleteCmd(helm, namespace, tillerNamespace, `${releaseName}-canary`), {
        ...opts,
        ignoreReturnCode: true
      });
    }

    if (task === "remove") {
      await exec.exec(helm, deleteCmd(helm, namespace, tillerNamespace, release), {
        ...opts,
        ignoreReturnCode: true
      });
    } else {
      await exec.exec(helm, args, opts);
    }

    await status(task === "remove" ? "inactive" : "success");
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
    await status("failure");
  }
}

run();
