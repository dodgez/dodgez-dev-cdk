import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

import { WordleFilterApiStack } from "./WordleFilterApiStack";
import { WordleFilterLambdaUpdateStack } from "./WordleFilterLambdaUpdateStack";

export class WordleFilterStack extends NestedStack {
  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "WordleFilterWordsBucket", {
      bucketName: "wordle-filter-words-bucket",
    });
    new WordleFilterApiStack(this, "WordleFilterApiStack", bucket);
    new WordleFilterLambdaUpdateStack(
      this,
      "WordleFilterLambdaUpdateStack",
      bucket
    );
  }
}
