import { Stack, StackProps } from "aws-cdk-lib";
import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
} from "aws-cdk-lib/aws-cognito";
import {
  FederatedPrincipal,
  PolicyDocument,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";
import { CfnAppMonitor } from "aws-cdk-lib/aws-rum";
import { Construct } from "constructs";

export class DodgezDevCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const identityPool = new CfnIdentityPool(this, "RumAppIdentityPool", {
      allowUnauthenticatedIdentities: true,
      identityPoolName: "dodgez.dev-rum-monitor",
    });

    const unauthenticatedRumRole = new Role(this, "UnauthenticatedRumRole", {
      assumedBy: new FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "unauthenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      inlinePolicies: {
        RUMPutBatchMetrics: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["rum:PutRumEvents"],
              resources: [
                this.formatArn({
                  resource: "appmonitor",
                  resourceName: "dodgez.dev",
                  service: "rum",
                }),
              ],
            }),
          ],
        }),
      },
      roleName: "dodgez.dev-RUM-UnauthenticatedRole",
    });

    new CfnIdentityPoolRoleAttachment(this, "RumAppRoleAttachment", {
      identityPoolId: identityPool.ref,
      roles: {
        unauthenticated: unauthenticatedRumRole.roleArn,
      },
    });

    new CfnAppMonitor(this, "DodgezDevMonitor", {
      appMonitorConfiguration: {
        allowCookies: true,
        enableXRay: false,
        guestRoleArn: unauthenticatedRumRole.roleArn,
        identityPoolId: identityPool.ref,
        sessionSampleRate: 1,
        telemetries: ["errors", "http", "performance"],
      },
      cwLogEnabled: false,
      domain: "dodgez.dev",
      name: "dodgez.dev",
      customEvents: {
        status: "ENABLED",
      },
    });
  }
}
