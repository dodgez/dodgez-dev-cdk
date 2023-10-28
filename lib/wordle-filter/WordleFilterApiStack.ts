import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import {
  ApiKeySourceType,
  LambdaRestApi,
  Period,
  UsagePlan,
} from "aws-cdk-lib/aws-apigateway";
import { AssetCode, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class WordleFilterApiStack extends NestedStack {
  constructor(
    scope: Construct,
    id: string,
    bucket: IBucket,
    props?: NestedStackProps
  ) {
    super(scope, id, props);

    const lambda = new Function(this, "WordleFilterLambdaApiHandler", {
      code: new AssetCode("lib/wordle-filter/lambda-api/"),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      handler: "index.handler",
      runtime: Runtime.PYTHON_3_11,
    });
    bucket.grantRead(lambda);

    const restApi = new LambdaRestApi(this, "WordleFilterApiEndpoint", {
      apiKeySourceType: ApiKeySourceType.HEADER,
      handler: lambda,
      defaultCorsPreflightOptions: {
        allowHeaders: ["X-Api-Key"],
        allowMethods: ["GET", "OPTIONS"],
        allowOrigins: ["https://www.dodgez.dev", "http://localhost:3000"],
      },
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });
    const apiKey = restApi.addApiKey("WordleFilterApiKey");

    const usagePlan = new UsagePlan(this, "WordleFilterApiUsagePlan", {
      apiStages: [
        {
          api: restApi,
          stage: restApi.deploymentStage,
        },
      ],
      name: "WordleFilterApiPublicAccess",
      quota: {
        limit: 200,
        period: Period.DAY,
      },
    });
    usagePlan.addApiKey(apiKey);
  }
}
