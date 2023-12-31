import { NestedStack, NestedStackProps } from "aws-cdk-lib";
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

export class RumStack extends NestedStack {
  constructor(scope: Construct, id: string, props?: NestedStackProps) {
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
                  resourceName: "www.dodgez.dev",
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
      domain: "www.dodgez.dev",
      name: "www.dodgez.dev",
      customEvents: {
        status: "ENABLED",
      },
    });
  }
}
