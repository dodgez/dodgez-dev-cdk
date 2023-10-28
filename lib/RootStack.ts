import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { RumStack } from "./RumStack";
import { WordleFilterStack } from "./wordle-filter/WordleFilterStack";

export class RootStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new RumStack(this, "RumStack");

    new WordleFilterStack(this, "WordleFilterStack");
  }
}
