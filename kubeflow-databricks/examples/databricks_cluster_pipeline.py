#!/usr/bin/env python3
# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import kfp.dsl as dsl
import kfp.compiler as compiler
import databricks

def create_cluster(cluster_name):
    return databricks.CreateClusterOp(
        name="createcluster",
        cluster_name=cluster_name,
        spark_version="5.3.x-scala2.11",
        node_type_id="Standard_D3_v2",
        spark_conf={
            "spark.speculation": "true"
        },
        num_workers=2
    )

def submit_run(run_name, cluster_id, parameter):
    return databricks.SubmitRunOp(
        name="submitrun",
        run_name=run_name,
        existing_cluster_id=cluster_id,
        libraries=[{"jar": "dbfs:/docs/sparkpi.jar"}],
        spark_jar_task={
            "main_class_name": "org.apache.spark.examples.SparkPi",
            "parameters": [parameter]
        }
    )

def delete_run(run_name):
    return databricks.DeleteRunOp(
        name="deleterun",
        run_name=run_name
    )

def delete_cluster(cluster_name):
    return databricks.DeleteClusterOp(
        name="deletecluster",
        cluster_name=cluster_name
    )

@dsl.pipeline(
    name="DatabricksCluster",
    description="A toy pipeline that computes an approximation to pi with Azure Databricks."
)
def calc_pipeline(cluster_name="test-cluster", run_name="test-run", parameter="10"):
    create_cluster_task = create_cluster(cluster_name)
    submit_run_task = submit_run(run_name, create_cluster_task.outputs["cluster_id"], parameter)
    delete_run_task = delete_run(run_name)
    delete_run_task.after(submit_run_task)
    delete_cluster_task = delete_cluster(cluster_name)
    delete_cluster_task.after(delete_run_task)

if __name__ == "__main__":
    compiler.Compiler()._create_and_write_workflow(
        pipeline_func=calc_pipeline,
        package_path=__file__ + ".tar.gz")
