import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { AssetCode, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class WordleFilterLambdaUpdateStack extends NestedStack {
  constructor(
    scope: Construct,
    id: string,
    bucket: IBucket,
    props?: NestedStackProps
  ) {
    super(scope, id, props);

    const lambda = new Function(this, "WordleFilterLambdaUpdateHandler", {
      code: new AssetCode("lib/wordle-filter/lambda-update/"),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      handler: "index.handler",
      runtime: Runtime.PYTHON_3_11,
    });
    bucket.grantReadWrite(lambda);

    const rule = new Rule(this, "WordleFilterLambdaUpdateDailyRule", {
      schedule: Schedule.cron({ minute: "0", hour: "9", day: "*" }),
    });
    rule.addTarget(new LambdaFunction(lambda));
  }
}
