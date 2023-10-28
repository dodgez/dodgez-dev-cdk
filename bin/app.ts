#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";

import { RootStack } from "../lib/RootStack";

const app = new App();
new RootStack(app, "DodgezDevStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-west-2" },
});
