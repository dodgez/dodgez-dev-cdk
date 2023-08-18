#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { DodgezDevCdkStack } from "../lib/dodgez-dev-cdk-stack";

const app = new cdk.App();
new DodgezDevCdkStack(app, "DodgezDevCdkStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-west-2" },
});
